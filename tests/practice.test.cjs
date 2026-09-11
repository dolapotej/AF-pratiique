const { test, before } = require('node:test')
const assert = require('node:assert/strict')
let lessons, api
before(async () => {
  ;({ lessons } = await import('../src/data/lessons.js'))
  api = await import('../src/progress.js')
})

test('every card has English example support and foundation decks start with single items', () => {
  for (const lesson of lessons) for (const card of lesson.cards) {
    assert.ok(card.exampleEn?.length > 3, `${lesson.id}: ${card.front}`)
    for (const text of [card.front, card.back, card.example, card.exampleEn]) assert.ok(!/[a-z]\?[a-z]|\uFFFD/i.test(text), text)
  }
  const alphabet = lessons.find(l => l.id === 'alphabet').cards
  assert.deepEqual(alphabet.slice(0,26).map(c => c.front[0]), [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'])
  assert.ok(alphabet.some(c => c.front.startsWith('é —')))
  assert.ok(alphabet.some(c => c.back === 'L – É – A'))
  assert.equal(lessons.find(l => l.id === 'numbers').cards[14].back, '14')
  assert.equal(lessons.find(l => l.id === 'calendar').cards[0].back, 'Monday')
})

test('older card ratings, positions and daily references migrate without rating new cards', () => {
  const due = '2026-09-13T12:00:00.000Z'
  for (const version of [3,4]) {
    const raw = { version, lessonId: 'alphabet', progress: {}, daily: { date: '2026-09-10', index: 0, items: [{ lessonId: 'alphabet', type: 'card', index: 1 }, { lessonId: 'alphabet', type: 'quiz', index: 1 }] } }
    for (const id of ['alphabet','numbers','calendar']) raw.progress[id] = { cardIndex: 1, reviewed: [1], ratings: { 1: { status: 'known', due } }, writingAnswer: 'My draft' }
    const migrated = api.normalizeProgress(raw, true)
    for (const [id, shift] of [['alphabet',26],['numbers',25],['calendar',19]]) {
      const p = migrated.progress[id]
      assert.equal(p.cardIndex, shift + 1)
      assert.deepEqual(p.reviewed, [shift + 1])
      assert.deepEqual(p.ratings, { [shift + 1]: { status: 'known', due } })
      assert.equal(p.writingAnswer, 'My draft')
    }
    assert.equal(migrated.daily.items[0].index, 27)
    assert.equal(migrated.daily.items[1].index, 1)
    assert.deepEqual(api.normalizeProgress(migrated, true), migrated)
  }
})

test('all 16 lessons have teaching depth, coherent exercises, and unique IDs', () => {
  assert.equal(lessons.length, 16)
  assert.equal(new Set(lessons.map(l => l.id)).size, 16)
  for (const l of lessons) {
    assert.ok(l.cards.length >= 8, l.id)
    assert.ok(l.sections.length >= 3)
    assert.equal(l.objectives.length, 3)
    assert.ok(l.dialogue.length >= 4)
    assert.ok(l.exercises.length >= 4)
    assert.equal(l.quiz.length, 4)
    assert.ok(l.challenge && l.writing.rubric.length >= 3)
    for (const q of l.quiz) {
      assert.equal(new Set(q.options).size, q.options.length)
      assert.ok(q.options.includes(q.answer))
      assert.ok(q.explanation.length > 20)
    }
    for (const exercise of l.exercises) {
      assert.ok(exercise.answers.every(a => api.isCorrect(exercise, a)))
      assert.ok(!api.isCorrect(exercise, ''))
    }
  }
})

test('legacy positional data follows original lesson IDs after reordering', () => {
  const migrated = api.normalizeProgress({ version: 2, lessonIndex: 1, lessons: [{ reviewed: [0] }, { cardIndex: 1, reviewed: [0, 1], writingAnswer: 'Old draft' }, {}] })
  assert.equal(migrated.lessonId, 'classroom')
  assert.equal(migrated.progress.classroom.writingAnswer, 'Old draft')
  assert.deepEqual(migrated.progress.introductions.reviewed, [0])
  assert.deepEqual(migrated.progress.alphabet.reviewed, [])
  const v3 = api.normalizeProgress({ version: 3, lessonId: 'town', progress: { town: { cardIndex: 2, reviewed: [2], writingAnswer: 'Town draft' } } })
  assert.equal(v3.lessonId, 'town')
  assert.equal(v3.progress.town.cardIndex, 2)
  assert.equal(v3.progress.town.writingAnswer, 'Town draft')
})

test('invalid storage and malformed imported fields are safely normalized', () => {
  for (const value of [null, {}, [], 'bad', { version: 77 }]) assert.equal(api.normalizeProgress(value).version, 5)
  assert.throws(() => api.normalizeProgress({ version: 77 }, true))
  const raw = api.freshProgress()
  Object.assign(raw.progress.alphabet, { cardIndex: -1, reviewed: [0, 0, '2', -1, 999], writingAnswer: {}, ratings: { 0: { status: 'known', due: 'not a date' } }, quizHistory: [{ date: 'bad', score: 999 }], quizAttempt: { index: 0, answers: ['wrong option'] } })
  const p = api.normalizeProgress(raw).progress.alphabet
  assert.equal(p.cardIndex, 0)
  assert.deepEqual(p.reviewed, [0])
  assert.equal(p.writingAnswer, '')
  assert.deepEqual(p.ratings, {})
  assert.deepEqual(p.quizHistory, [])
  assert.equal(p.quizAttempt, null)
  assert.equal(api.readProgress({ getItem() { throw Error('blocked') } }).version, 5)
  assert.equal(api.writeProgress({ setItem() { throw Error('blocked') } }, raw), false)
})

test('only self-ratings count as known; rating does not duplicate views', () => {
  const progress = api.freshProgress(), l = lessons[0], p = progress.progress[l.id]
  p.reviewed.push(0)
  assert.equal(api.mastery(l, p).known, 0)
  api.rateCard(progress, l.id, 0, 'known', new Date('2026-09-10T12:00:00Z'))
  api.rateCard(progress, l.id, 0, 'known', new Date('2026-09-10T12:00:00Z'))
  assert.equal(p.reviewed.length, 1)
  assert.equal(api.mastery(l, p).known, 1)
  assert.equal(p.ratings[0].due, '2026-09-13T12:00:00.000Z')
  api.rateCard(progress, l.id, 0, 'again', new Date('2026-09-10T12:00:00Z'))
  assert.equal(api.mastery(l, p).known, 0)
  assert.equal(p.ratings[0].due, '2026-09-11T12:00:00.000Z')
})

test('quiz resumes, counts each answer once, saves history once and tracks mistakes', () => {
  let progress = api.freshProgress()
  const l = lessons[0]
  const wrong = l.quiz[0].options.find(o => o !== l.quiz[0].answer)
  assert.ok(api.answerQuiz(progress, l.id, wrong))
  assert.equal(api.answerQuiz(progress, l.id, l.quiz[0].answer), false)
  progress = api.normalizeProgress(JSON.parse(JSON.stringify(progress)))
  assert.equal(progress.progress[l.id].quizAttempt.answers[0], wrong)
  api.nextQuiz(progress, l.id)
  for (let i = 1; i < l.quiz.length; i++) { api.answerQuiz(progress, l.id, l.quiz[i].answer); api.nextQuiz(progress, l.id) }
  const p = progress.progress[l.id]
  assert.equal(p.quizHistory[0].score, 3)
  assert.equal(p.quizHistory[0].total, 4)
  assert.deepEqual(p.mistakes, [0])
  api.nextQuiz(progress, l.id)
  assert.equal(p.quizHistory.length, 1)
  p.quizAttempt = null
  api.answerQuiz(progress, l.id, l.quiz[0].answer)
  assert.deepEqual(p.mistakes, [])
})

test('daily review prioritizes mistakes and due cards, survives reload, renews next day', () => {
  const progress = api.freshProgress(), now = new Date('2026-09-10T12:00:00Z')
  progress.progress.town.mistakes = [1]
  api.rateCard(progress, 'town', 0, 'again', new Date('2026-09-08T12:00:00Z'))
  api.rateCard(progress, 'town', 2, 'known', now)
  const session = api.dailySession(progress, now)
  assert.ok(session.items.slice(0, 2).some(i => i.lessonId === 'town' && i.type === 'quiz'))
  assert.ok(session.items.slice(0, 2).some(i => i.lessonId === 'town' && i.type === 'card' && i.index === 0))
  assert.ok(!session.items.some(i => i.lessonId === 'town' && i.type === 'card' && i.index === 2))
  session.index = 2
  const restored = api.normalizeProgress(JSON.parse(JSON.stringify(progress)))
  assert.equal(api.dailySession(restored, now).index, 2)
  assert.equal(api.dailySession(restored, new Date('2026-09-11T12:00:00Z')).index, 0)
})

test('completion requires cards, correct exercises and quiz; continue follows saved activity', () => {
  const progress = api.freshProgress(), l = lessons[0], p = progress.progress[l.id]
  p.mode = 'writing'
  assert.deepEqual(api.nextActivity(progress), { lessonId: l.id, mode: 'writing' })
  for (let i = 0; i < l.cards.length; i++) api.rateCard(progress, l.id, i, 'known')
  for (const e of l.exercises) p.exercises[e.id] = { answer: e.answers[0], checked: true }
  assert.equal(api.mastery(l, p).complete, false)
  p.quizHistory.push({ date: new Date().toISOString(), score: 4, total: 4 })
  assert.equal(api.mastery(l, p).complete, true)
  assert.equal(api.nextActivity(progress).lessonId, lessons[1].id)
})

test('answer matching accepts apostrophe and case variants without ignoring accents', () => {
  assert.ok(api.isCorrect({ answers: ['Je m’appelle Nina'] }, "je m'appelle Nina."))
  assert.ok(!api.isCorrect({ answers: ['fatiguée'] }, 'fatiguee'))
})

test('backup roundtrip preserves drafts, checklists, exercises, ratings and results', () => {
  const p = api.freshProgress(), l = lessons[0], data = p.progress[l.id]
  Object.assign(data, { writingAnswer: '<script>draft</script>', rubric: [0], mode: 'exercises', exercises: { [l.exercises[0].id]: { answer: l.exercises[0].answers[0], checked: true } } })
  api.rateCard(p, l.id, 0, 'known')
  for (const q of l.quiz) { api.answerQuiz(p, l.id, q.answer); api.nextQuiz(p, l.id) }
  assert.deepEqual(api.normalizeProgress(JSON.parse(JSON.stringify(p)), true), p)
})

test('all supplied photo concepts have a mapped lesson and added practice', () => {
  const images = new Set(lessons.flatMap(l => l.textbook?.images || []))
  assert.deepEqual([...images].sort((a, b) => a - b), Array.from({ length: 30 }, (_, i) => i + 1))
  const required = ['pronouns-tonic-me', 'pronouns-after-with', 'questions-feminine', 'questions-plural', 'countries-exception', 'countries-greek', 'wishes-holiday', 'objects-shape', 'objects-colour', 'possession-their-plural', 'negation-no-longer', 'negation-never', 'negation-nothing', 'faire-you', 'activities-contraction', 'schedule-period', 'outings-budget', 'form-birth-date', 'culture-film']
  const exercises = lessons.flatMap(l => l.exercises)
  for (const id of required) assert.ok(exercises.some(e => e.id === id), id)
  assert.equal(new Set(exercises.map(e => e.id)).size, exercises.length)
})

test('punctuation questions require the question mark; project drafts survive backup', () => {
  const exercise = lessons[0].exercises.find(e => e.type === 'punctuation')
  assert.ok(api.isCorrect(exercise, 'Tu es ici ?'))
  assert.equal(api.isCorrect(exercise, 'Tu es ici.'), false)
  const p = api.freshProgress()
  p.progress.messages.taskAnswer = 'Bonjour, quels ateliers proposez-vous ?'
  assert.equal(api.normalizeProgress(JSON.parse(JSON.stringify(p)), true).progress.messages.taskAnswer, p.progress.messages.taskAnswer)
})

test('English companions cover every lesson section, exercise and quiz instruction', async () => {
  const { english, activityHelp } = await import('../src/data/english.js')
  for (const lesson of lessons) {
    const help = english[lesson.id]
    assert.ok(help?.title && help.reading && help.writing && help.speaking, lesson.id)
    assert.equal(help.sections.length, lesson.sections.length, `${lesson.id}: sections`)
    assert.equal(help.exercises.length, lesson.exercises.length, `${lesson.id}: exercises`)
    assert.equal(help.questions.length, lesson.quiz.length, `${lesson.id}: quiz`)
    assert.ok([...help.sections, ...help.exercises, ...help.questions].every(text => typeof text === 'string' && text.length > 10))
    if (lesson.task) assert.ok(help.task)
  }
  for (const mode of [...api.modes, 'daily']) assert.ok(activityHelp[mode])
})
