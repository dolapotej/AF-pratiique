import { lessons } from './data/lessons.js'
import { cardOffsets } from './data/cards.js'

export const storageKey = 'af-pratique-progress'
export const modes = ['grammar', 'cards', 'exercises', 'quiz', 'writing', 'speaking']
const legacyOrder = ['introductions', 'classroom', 'town']
export const emptyLesson = () => ({ cardIndex: 0, reviewed: [], ratings: {}, writingAnswer: '', taskAnswer: '', rubric: [], exercises: {}, quizHistory: [], mistakes: [], mode: 'grammar', quizAttempt: null })
export const freshProgress = () => ({ version: 5, lessonId: lessons[0].id, progress: Object.fromEntries(lessons.map(lesson => [lesson.id, emptyLesson()])), daily: null })
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const integer = (value, max) => Number.isInteger(value) && value >= 0 && value < max
const indices = (value, max) => Array.isArray(value) ? [...new Set(value.filter(i => integer(i, max)))] : []
const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value))

export function normalizeProgress(raw, strict = false) {
  if (!object(raw) || ![2, 3, 4, 5].includes(raw.version) || (raw.version === 2 ? !Array.isArray(raw.lessons) : !object(raw.progress))) {
    if (strict) throw new Error('Ce fichier ne contient pas une sauvegarde AF pratique compatible.')
    return freshProgress()
  }
  const result = freshProgress()
  const offset = id => raw.version < 5 ? cardOffsets[id] || 0 : 0
  const selected = raw.version === 2 ? legacyOrder[raw.lessonIndex] : raw.lessonId
  if (lessons.some(l => l.id === selected)) result.lessonId = selected
  for (const lesson of lessons) {
    const value = (raw.version === 2 ? raw.lessons[legacyOrder.indexOf(lesson.id)] : raw.progress[lesson.id]) || {}
    const p = result.progress[lesson.id]
    const shift = offset(lesson.id)
    const oldLength = raw.version < 5 && lesson.id === 'alphabet' ? 10 : lesson.cards.length - shift
    p.cardIndex = integer(value.cardIndex, oldLength) ? value.cardIndex + shift : 0
    p.reviewed = indices(value.reviewed, oldLength).map(i => i + shift)
    p.writingAnswer = typeof value.writingAnswer === 'string' ? value.writingAnswer.slice(0, 20000) : ''
    p.taskAnswer = typeof value.taskAnswer === 'string' ? value.taskAnswer.slice(0, 20000) : ''
    p.mode = modes.includes(value.mode) ? value.mode : 'grammar'
    p.rubric = indices(value.rubric, lesson.writing.rubric.length)
    p.mistakes = indices(value.mistakes, lesson.quiz.length)
    for (let i = 0; i < oldLength; i++) {
      const rating = value.ratings?.[i]
      if (rating && ['known', 'again'].includes(rating.status) && validDate(rating.due)) p.ratings[i + shift] = { status: rating.status, due: rating.due }
    }
    for (const exercise of lesson.exercises) {
      const attempt = value.exercises?.[exercise.id]
      if (attempt && typeof attempt.answer === 'string') p.exercises[exercise.id] = { answer: attempt.answer.slice(0, 1000), checked: attempt.checked === true }
    }
    p.quizHistory = Array.isArray(value.quizHistory) ? value.quizHistory.filter(h => object(h) && validDate(h.date) && integer(h.score, lesson.quiz.length + 1) && h.total === lesson.quiz.length).slice(-30).map(h => ({ date: h.date, score: h.score, total: h.total })) : []
    const a = value.quizAttempt
    if (object(a) && Array.isArray(a.answers) && a.answers.length <= lesson.quiz.length && a.answers.every((answer, i) => lesson.quiz[i].options.includes(answer)) && integer(a.index, lesson.quiz.length + 1) && (a.answers.length === a.index || a.answers.length === a.index + 1)) {
      p.quizAttempt = { index: a.index, answers: [...a.answers], recorded: a.index === lesson.quiz.length && a.recorded === true }
    }
  }
  const daily = raw.daily
  if (object(daily) && typeof daily.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(daily.date) && Array.isArray(daily.items) && daily.items.length <= 10 && daily.items.every(item => {
    const lesson = lessons.find(l => l.id === item.lessonId)
    return lesson && ['card', 'quiz'].includes(item.type) && integer(item.index, item.type === 'card' ? raw.version < 5 && lesson.id === 'alphabet' ? 10 : lesson.cards.length - offset(lesson.id) : lesson.quiz.length)
  }) && integer(daily.index, daily.items.length + 1)) result.daily = { date: daily.date, items: daily.items.map(({ lessonId, type, index }) => ({ lessonId, type, index: index + (type === 'card' ? offset(lessonId) : 0) })), index: daily.index }
  return result
}

export function readProgress(storage) {
  try { return normalizeProgress(JSON.parse(storage.getItem(storageKey))) } catch { return freshProgress() }
}
export function writeProgress(storage, progress) {
  try { storage.setItem(storageKey, JSON.stringify(progress)); return true } catch { return false }
}
export const normalizeAnswer = value => value.trim().normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/g, "'").replace(/\s*'\s*/g, "'").replace(/[.!?]+$/g, '').replace(/\s+/g, ' ').trim()
export const isCorrect = (exercise, answer) => (exercise.type !== 'punctuation' || answer.trim().endsWith('?')) && exercise.answers.some(value => normalizeAnswer(value) === normalizeAnswer(answer))
export function rateCard(progress, lessonId, index, status, now = new Date()) {
  const p = progress.progress[lessonId]
  p.ratings[index] = { status, due: new Date(now.getTime() + (status === 'known' ? 3 : 1) * 86400000).toISOString() }
  if (!p.reviewed.includes(index)) p.reviewed.push(index)
}
export function answerQuiz(progress, lessonId, answer) {
  const lesson = lessons.find(l => l.id === lessonId)
  const p = progress.progress[lessonId]
  p.quizAttempt ||= { index: 0, answers: [], recorded: false }
  const a = p.quizAttempt
  const question = lesson.quiz[a.index]
  if (!question || a.answers.length > a.index || !question.options.includes(answer)) return false
  a.answers.push(answer)
  updateMistake(p, a.index, answer === question.answer)
  return true
}
export function updateMistake(p, index, correct) {
  p.mistakes = p.mistakes.filter(i => i !== index)
  if (!correct) p.mistakes.push(index)
}
export function nextQuiz(progress, lessonId, now = new Date()) {
  const lesson = lessons.find(l => l.id === lessonId)
  const p = progress.progress[lessonId]
  const a = p.quizAttempt
  if (!a || a.answers.length <= a.index) return
  a.index++
  if (a.index === lesson.quiz.length && !a.recorded) {
    const score = a.answers.filter((answer, i) => answer === lesson.quiz[i].answer).length
    p.quizHistory.push({ date: now.toISOString(), score, total: lesson.quiz.length })
    p.quizHistory = p.quizHistory.slice(-30)
    a.recorded = true
  }
}
export function mastery(lesson, p) {
  const known = Object.values(p.ratings).filter(r => r.status === 'known').length
  const exercises = lesson.exercises.filter(e => p.exercises[e.id]?.checked && isCorrect(e, p.exercises[e.id].answer)).length
  const latest = p.quizHistory.at(-1)
  return { known, exercises, score: latest?.score ?? null, complete: known === lesson.cards.length && exercises === lesson.exercises.length && latest?.score / lesson.quiz.length >= 0.8 }
}
export function nextActivity(progress) {
  const lesson = lessons.find(l => l.id === progress.lessonId) || lessons[0]
  const p = progress.progress[lesson.id]
  if (!mastery(lesson, p).complete) return { lessonId: lesson.id, mode: p.mode }
  const next = lessons.find(l => !mastery(l, progress.progress[l.id]).complete)
  return { lessonId: next?.id || lesson.id, mode: next ? progress.progress[next.id].mode : 'cards' }
}
export const localDate = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
export function dailySession(progress, now = new Date()) {
  const date = localDate(now)
  if (progress.daily?.date === date) return progress.daily
  const candidates = []
  for (const lesson of lessons) {
    const p = progress.progress[lesson.id]
    for (const index of p.mistakes) candidates.push({ lessonId: lesson.id, type: 'quiz', index, priority: 0 })
    lesson.cards.forEach((card, index) => {
      const rating = p.ratings[index]
      const introduced = lesson.id === progress.lessonId || p.reviewed.includes(index)
      if ((!rating && introduced) || (rating && Date.parse(rating.due) <= now.getTime())) candidates.push({ lessonId: lesson.id, type: 'card', index, priority: rating?.status === 'again' ? 0 : rating ? 1 : 2 })
    })
  }
  // Alternate cards and questions among due mistakes before introducing new cards.
  candidates.sort((a, b) => a.priority - b.priority || a.index - b.index)
  const items = candidates.slice(0, 8).map(({ lessonId, type, index }) => ({ lessonId, type, index }))
  progress.daily = { date, items, index: 0 }
  return progress.daily
}
