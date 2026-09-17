import './style.css'
import { lessons } from './data/lessons.js'
import { english, activityHelp } from './data/english.js'
import { readProgress, writeProgress, freshProgress, normalizeProgress, rateCard, answerQuiz, nextQuiz, mastery, nextActivity, isCorrect } from './progress.js'

const app = document.querySelector('#app')
const live = document.createElement('p')
live.className = 'sr-only'
live.setAttribute('role', 'status')
live.setAttribute('aria-live', 'polite')
document.body.append(live)
let storage
try { storage = window.localStorage } catch { /* Memory-only practice remains available. */ }
let englishHelp = false
try { englishHelp = storage?.getItem('af-pratique-english-help') === 'true' } catch {}
let progress = readProgress(storage)
let view = 'today'
let flipped = false
let showModel = false
let lessonSearch = ''
let exerciseIndex = 0
let storageFailed = !storage
let message = ''

// The redesign shows four activities. Saved modes keep their old names so backups stay compatible:
// exercises and quiz both live under Quiz, and the dropped speaking mode opens Apprendre.
const activities = [['learn', 'Apprendre'], ['cards', 'Cartes'], ['quiz', 'Quiz'], ['write', 'Écrire']]
const activityOf = mode => ({ cards: 'cards', exercises: 'quiz', quiz: 'quiz', writing: 'write' })[mode] || 'learn'
const activityLabel = mode => activities.find(([id]) => id === activityOf(mode))[1]
const navItems = [['today', 'Aujourd’hui'], ['lessons', 'Leçons'], ['carnet', 'Mon carnet']]

const h = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
const current = () => lessons.find(l => l.id === progress.lessonId)
const record = () => progress.progress[progress.lessonId]
const button = (id, label, cls = 'btn btn-primary', extra = '') => `<button id="${id}" class="${cls}" ${extra}>${label}</button>`
const englishNote = text => englishHelp && text ? `<aside class="english-note" lang="en">${h(text)}</aside>` : ''
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
function save() { storageFailed = !writeProgress(storage, progress) }
function announce(text) { live.textContent = text }
function firstOpenExercise() {
  const lesson = current(), p = record()
  const index = lesson.exercises.findIndex(e => !(p.exercises[e.id]?.checked && isCorrect(e, p.exercises[e.id].answer)))
  return Math.max(index, 0)
}
function openLesson(id, mode = null) {
  progress.lessonId = id
  const p = record()
  if (mode) p.mode = mode
  if (p.mode === 'speaking') p.mode = 'grammar'
  view = 'lesson'; flipped = false; showModel = false; exerciseIndex = firstOpenExercise()
  save()
}

function render(focusId) {
  const previousFocus = focusId || document.activeElement?.id
  const known = lessons.reduce((n, l) => n + mastery(l, progress.progress[l.id]).known, 0)
  const total = lessons.reduce((n, l) => n + l.cards.length, 0)
  const lesson = current()
  app.innerHTML = `<a class="skip-link" href="#page-title">Aller au contenu</a>
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">AF</span><strong>pratique</strong><small>A1.1 · Les bases</small></div>
        <nav class="side-nav" aria-label="Sections">${navItems.map(([id, label]) => `<button id="nav-${id}" data-view="${id}" ${view === id ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav>
        <div class="sidebar-foot">Un peu chaque jour.<br>Aucun compte, aucun envoi.</div>
      </aside>
      <main class="main">
        <header class="topbar"><span class="breadcrumb">${view === 'lesson' ? `Leçons / ${h(lesson.title)}` : 'A1.1 · Les bases'}</span>
          <div class="topbar-end"><span class="known-label">${known} / ${total} cartes connues</span>${button('english-toggle', englishHelp ? 'English help: on' : 'English help', 'english-toggle', `lang="en" aria-pressed="${englishHelp}"`)}</div>
        </header>
        ${({ today: renderToday, lessons: renderLessons, lesson: renderLesson, carnet: renderCarnet })[view](known, total)}
      </main>
    </div>`
  if (view === 'lessons') filterLessons()
  if (previousFocus) document.getElementById(previousFocus)?.focus({ preventScroll: true })
}

function renderToday(known, total) {
  const next = nextActivity(progress)
  const lesson = lessons.find(l => l.id === next.lessonId)
  const latest = lessons.flatMap(l => progress.progress[l.id].quizHistory).sort((a, b) => b.date.localeCompare(a.date))[0]
  const stats = [[`${Math.round(known / total * 100)}%`, 'du vocabulaire connu'], [lessons.length, 'leçons disponibles'], [latest ? `${latest.score}/${latest.total}` : '—', 'dernier quiz']]
  return `<section class="page page-today">
    <div class="today-head"><span class="kicker kicker-blue">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span><h1 id="page-title" tabindex="-1">Bonjour.</h1><p class="lead">Une seule chose à la fois. Comprendre, pratiquer, puis revenir.</p>
      ${englishNote('Aujourd’hui = today; Leçons = lessons; Mon carnet = your notebook and backups. Continuer resumes where you left off; Choisir une leçon opens the lesson list.')}</div>
    <div class="panel next-step"><span class="kicker">Ton prochain pas</span>
      <div class="stack-6"><strong class="next-title">${h(lesson.title)}</strong><span class="meta-15">${activityLabel(next.mode)} · ${mastery(lesson, progress.progress[lesson.id]).known} / ${lesson.cards.length} cartes connues</span></div>
      <div class="actions">${button('continue', 'Continuer →')}${button('choose-lesson', 'Choisir une leçon', 'btn btn-outline')}</div>
    </div>
    <div class="stats">${stats.map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>
  </section>`
}

function renderLessons() {
  return `<section class="page page-lessons"><h1 id="page-title" tabindex="-1">Leçons</h1>
    ${englishNote('Search by French or English title. Every lesson stays open; the suggested order starts with the alphabet.')}
    <label class="search"><span class="kicker">Rechercher${englishHelp ? ' <span lang="en">/ Find a lesson</span>' : ''}</span><input type="search" id="lesson-search" value="${h(lessonSearch)}" placeholder="Se présenter, en classe, ma ville…" aria-describedby="lesson-search-status"></label>
    <div class="lesson-list">${lessons.map((l, index) => `<button id="lesson-${l.id}" class="lesson-row" data-lesson="${l.id}" ${l.id === progress.lessonId ? 'aria-current="true"' : ''}><span class="lesson-index">${String(index + 1).padStart(2, '0')}</span><span class="lesson-info"><strong>${h(l.title)}</strong><span>${h(l.subtitle)}</span></span><span class="lesson-count">${mastery(l, progress.progress[l.id]).known} / ${l.cards.length} cartes</span></button>`).join('')}</div>
    <p id="lesson-search-status" class="status" role="status"></p>
  </section>`
}

function filterLessons() {
  let count = 0
  for (const row of app.querySelectorAll('[data-lesson]')) {
    const lesson = lessons.find(l => l.id === row.dataset.lesson)
    row.hidden = !normalize(`${lesson.title} ${lesson.subtitle} ${lesson.category} ${english[lesson.id].title}`).includes(normalize(lessonSearch.trim()))
    if (!row.hidden) count++
  }
  const status = document.getElementById('lesson-search-status')
  if (status) status.textContent = count ? `${count} leçon${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}.` : 'Aucune leçon trouvée. Essaie un autre mot.'
}

function renderLesson() {
  const lesson = current(), p = record(), activity = activityOf(p.mode)
  const body = ({ learn: renderLearn, cards: renderCards, quiz: p.mode === 'quiz' ? renderQuiz : renderExercises, write: renderWriting })[activity](lesson, p)
  return `<section class="page page-lesson">
    <div class="stack-8"><span class="kicker kicker-blue">Leçon ${lessons.indexOf(lesson) + 1} / ${lessons.length}</span><h1 id="page-title" tabindex="-1">${h(lesson.title)}</h1></div>
    <nav class="tabs" aria-label="Activités">${activities.map(([id, label]) => `<button id="tab-${id}" data-activity="${id}" aria-pressed="${activity === id}" aria-controls="activity-panel">${label}</button>`).join('')}</nav>
    <div id="activity-panel" class="activity">${englishNote(activityHelp[p.mode === 'writing' ? 'writing' : p.mode] || activityHelp.grammar)}${body}</div>
  </section>`
}

function renderLearn(lesson) {
  return `<article class="stack-24">
    ${lesson.sections.map(([title, explanation, examples], index) => `<section class="teaching-section stack-24"><div class="stack-8"><h2>${h(title)}</h2><p class="body-text">${h(explanation)}</p>${englishNote(english[lesson.id].sections[index])}</div><div class="rule-list">${examples.map(e => `<strong>${h(e)}</strong>`).join('')}</div></section>`).join('')}
    <section class="reading stack-8"><h2>En situation</h2>${englishNote(`Scene summary: ${english[lesson.id].reading}`)}<div class="rule-list dialogue">${lesson.dialogue.map(line => `<p>${h(line)}</p>`).join('')}</div><p class="note">${h(lesson.grammar.note)}</p></section>
    <div>${button('learn-cards', 'Passer aux cartes →')}</div>
  </article>`
}

function renderCards(lesson, p) {
  const index = p.cardIndex, card = lesson.cards[index], rating = p.ratings[index]?.status
  const hint = card.prompt ? (card.tag === 'Nom de la lettre' ? 'Say the French name of this letter, then flip to check.' : 'Spell the name in order, including any accents, then flip to check.') : 'Recall the meaning, then flip to check. Rate the card only after seeing the answer.'
  return `<article class="stack-20">
    <span class="meta">${rating === 'known' ? 'Carte connue' : rating === 'again' ? 'À revoir' : 'Pas encore évaluée'}</span>
    <button id="flashcard" class="flashcard" aria-pressed="${flipped}" aria-label="${flipped ? 'Revoir le recto' : 'Révéler la réponse'}"><small>${h(flipped ? card.front : card.tag)}</small><strong${flipped && !card.prompt ? ' lang="en"' : ''}>${h(flipped ? card.back : card.front)}</strong><em>${h(flipped ? card.example : card.prompt || 'Essaie de retrouver le sens avant de retourner la carte.')}</em><span class="flip-hint">${flipped ? 'Retourner au recto' : 'Toucher pour voir la réponse'} ↻</span></button>
    ${englishNote(flipped ? `${card.exampleEn}${card.note ? ` ${card.note}` : ''}` : hint)}
    ${flipped ? `<div class="actions">${button('rate-again', 'À revoir', 'btn btn-outline')}${button('rate-known', 'Je connais', 'btn btn-blue')}</div>` : ''}
    <div class="card-nav">${button('previous-card', '←', 'arrow', 'aria-label="Carte précédente"')}${button('next-card', '→', 'arrow arrow-dark', 'aria-label="Carte suivante"')}<span class="meta">${index + 1} / ${lesson.cards.length}</span></div>
  </article>`
}

function quizSteps(lesson, p) {
  const done = mastery(lesson, p).exercises
  return `<div class="steps">${button('step-exercises', `1. Exercices · ${done} / ${lesson.exercises.length}`, 'step', `aria-pressed="${p.mode === 'exercises'}"`)}${button('step-quiz', `2. Quiz · ${lesson.quiz.length} questions`, 'step', `aria-pressed="${p.mode === 'quiz'}"`)}</div>`
}

function renderExercises(lesson, p) {
  const exercise = lesson.exercises[exerciseIndex]
  const attempt = p.exercises[exercise.id] || { answer: '', checked: false }
  const correct = attempt.checked && isCorrect(exercise, attempt.answer)
  const last = exerciseIndex === lesson.exercises.length - 1
  return `<article class="stack-20">${quizSteps(lesson, p)}
    <span class="meta">Exercice ${exerciseIndex + 1} / ${lesson.exercises.length} · correction automatique</span>
    <form id="exercise-form" class="stack-18"><label for="exercise-answer"><h2 class="question">${h(exercise.prompt)}</h2></label>${englishNote(english[lesson.id].exercises[exerciseIndex])}
      <input id="exercise-answer" class="text-input" data-exercise="${exercise.id}" value="${h(attempt.answer)}" autocomplete="off" maxlength="1000" aria-describedby="exercise-feedback">
      <div id="exercise-feedback">${attempt.checked ? `<div class="feedback"><strong>${correct ? 'Correct !' : 'À retravailler.'}</strong><p>${h(exercise.explanation)}</p>${correct ? '' : `<p>Réponse attendue : ${exercise.answers.map(h).join(' / ')}</p>`}${englishNote(correct ? 'Correct!' : `Not quite. Expected French answer: ${exercise.answers.join(' / ')}. Compare it with your answer, including accents and agreement.`)}</div>` : ''}</div>
      <div class="actions">${attempt.checked ? button(last ? 'exercises-done' : 'next-exercise', last ? 'Passer au quiz →' : 'Exercice suivant →', 'btn btn-primary', 'type="button"') : button('check-exercise', 'Vérifier', 'btn btn-primary', 'type="submit"')}</div>
    </form>
    <div class="card-nav">${button('previous-exercise', '←', 'arrow', 'aria-label="Exercice précédent"')}${button('following-exercise', '→', 'arrow arrow-dark', 'aria-label="Exercice suivant"')}<span class="meta">${exerciseIndex + 1} / ${lesson.exercises.length}</span></div>
  </article>`
}

function renderQuiz(lesson, p) {
  const a = p.quizAttempt || { index: 0, answers: [] }
  const question = lesson.quiz[a.index]
  const score = a.answers.filter((answer, i) => answer === lesson.quiz[i].answer).length
  if (!question) return `<article class="stack-20">${quizSteps(lesson, p)}<span class="meta">Correction automatique</span>
    <div id="quiz-complete" class="panel stack-16"><span class="kicker">Quiz terminé</span><strong class="score">${score} / ${lesson.quiz.length}</strong><p class="verdict">${score / lesson.quiz.length >= 0.8 ? 'Objectif du quiz atteint. Les erreurs restent à revoir.' : 'Reviens aux explications, puis réessaie.'}</p>${englishNote(`Quiz complete: ${score} out of ${lesson.quiz.length}. Your result is saved. Recommencer starts a new attempt.`)}<div>${button('restart-quiz', 'Recommencer', 'btn btn-outline')}</div></div>
  </article>`
  const picked = a.answers[a.index] ?? null
  const correct = picked === question.answer
  return `<article class="stack-20">${quizSteps(lesson, p)}
    <span class="meta">Question ${a.index + 1} / ${lesson.quiz.length} · correction automatique</span>
    <div class="stack-18"><h2 class="question">${h(question.question)}</h2>${englishNote(english[lesson.id].questions[a.index])}
      <div class="options">${question.options.map((option, i) => `<button id="quiz-answer-${i}" class="option${picked !== null && option === question.answer ? ' correct' : ''}${picked !== null && option === picked && !correct ? ' wrong' : ''}" data-answer="${i}" ${picked !== null ? 'disabled' : ''}>${h(option)}</button>`).join('')}</div>
      ${picked !== null ? `<div class="feedback"><strong>${correct ? 'Correct !' : `Réponse attendue : ${h(question.answer)}`}</strong><p>${h(question.explanation)}</p>${englishNote(correct ? 'Correct. Keep going.' : `Expected answer: ${question.answer}.`)}<div>${button('next-quiz', a.index === lesson.quiz.length - 1 ? 'Terminer' : 'Question suivante →')}</div></div>` : ''}
    </div>
  </article>`
}

function renderWriting(lesson, p) {
  return `<article class="stack-20">
    <div class="stack-8"><span class="kicker">Production écrite · non notée</span><h2 class="prompt">${h(lesson.writing.prompt)}</h2>${englishNote(english[lesson.id].writing)}</div>
    <label class="sr-only" for="writing-answer">Ton texte</label><textarea id="writing-answer" class="text-area" maxlength="20000" placeholder="Écris ta réponse ici…">${h(p.writingAnswer)}</textarea>
    <span id="storage-draft" class="meta">${storageFailed ? 'Sauvegarde indisponible : exporte ton travail avant de fermer cette page.' : 'Brouillon enregistré dans ce navigateur. Le texte libre n’est pas noté automatiquement.'}</span>
    <div>${button('toggle-model', showModel ? 'Masquer la réponse possible' : 'Voir une réponse possible', 'btn btn-outline', `aria-expanded="${showModel}"`)}</div>
    ${showModel ? `<div class="model stack-8"><small class="kicker">Une réponse possible, pas une correction</small><strong>${h(lesson.writing.model)}</strong>
      <fieldset class="rubric"><legend class="kicker">À vérifier toi-même</legend>${lesson.writing.rubric.map((text, i) => `<label><input id="rubric-${i}" type="checkbox" data-rubric="${i}" ${p.rubric.includes(i) ? 'checked' : ''}> ${h(text)}</label>`).join('')}</fieldset></div>` : ''}
    ${lesson.task ? `<section class="task stack-8"><span class="kicker">Projet</span><h2 class="prompt">${h(lesson.task.title)}</h2><p class="body-text">${h(lesson.task.prompt)}</p>${englishNote(english[lesson.id].task)}
      <label class="sr-only" for="task-answer">Mon projet</label><textarea id="task-answer" class="text-area" maxlength="20000" placeholder="Écris ton projet ici…">${h(p.taskAnswer)}</textarea>
      <ul class="note">${lesson.task.rubric.map(text => `<li>${h(text)}</li>`).join('')}</ul></section>` : ''}
  </article>`
}

function renderCarnet() {
  return `<section class="page page-carnet"><h1 id="page-title" tabindex="-1">Mon carnet</h1>
    <p class="intro">Les cartes « connues » sont ton auto-évaluation. Tes progrès restent dans ce navigateur. Exporte une sauvegarde pour les garder.</p>
    ${englishNote('Known cards are your own ratings. Progress is stored only in this browser. Exporter downloads a backup; Importer restores one; Réinitialiser clears your progress after confirmation.')}
    <div class="carnet-list">${lessons.map(l => `<div class="carnet-row"><span>${h(l.title)}</span><span>${mastery(l, progress.progress[l.id]).known} / ${l.cards.length} cartes connues</span></div>`).join('')}</div>
    <p id="storage-note" class="meta">${storageFailed ? 'La sauvegarde est indisponible. Ton travail reste en mémoire pendant cette visite : exporte-le avant de fermer la page.' : 'Tes progrès sont enregistrés uniquement dans ce navigateur.'}</p>
    <div class="actions">${button('export-progress', 'Exporter', 'btn btn-outline')}${button('import-progress', 'Importer', 'btn btn-outline')}${button('reset-progress', 'Réinitialiser', 'btn btn-danger')}</div>
    <input type="file" id="import-file" accept="application/json,.json" hidden><p id="data-message" class="meta" role="status">${h(message)}</p>
  </section>`
}

function setView(next) {
  view = next; flipped = false
  render('page-title'); window.scrollTo(0, 0)
}

app.addEventListener('input', event => {
  const { target } = event
  if (target.id === 'lesson-search') { lessonSearch = target.value; filterLessons(); return }
  if (target.id === 'writing-answer') { record().writingAnswer = target.value; save() }
  if (target.id === 'task-answer') { record().taskAnswer = target.value; save() }
  if (target.dataset.exercise) {
    const wasChecked = record().exercises[target.dataset.exercise]?.checked
    record().exercises[target.dataset.exercise] = { answer: target.value, checked: false }
    save()
    if (wasChecked) { render('exercise-answer'); const input = document.getElementById('exercise-answer'); input.setSelectionRange(input.value.length, input.value.length) }
  }
  const note = document.querySelector('#storage-draft')
  if (storageFailed && note) note.textContent = 'Sauvegarde indisponible : exporte ton travail avant de fermer cette page.'
})
app.addEventListener('change', event => {
  if (event.target.dataset.rubric !== undefined) {
    const index = Number(event.target.dataset.rubric)
    record().rubric = record().rubric.filter(i => i !== index)
    if (event.target.checked) record().rubric.push(index)
    save()
  }
  if (event.target.id === 'import-file') importFile(event.target.files[0])
})
app.addEventListener('submit', event => {
  if (event.target.id !== 'exercise-form') return
  event.preventDefault()
  const exercise = current().exercises[exerciseIndex], p = record()
  p.exercises[exercise.id] = { answer: document.getElementById('exercise-answer').value, checked: true }
  save()
  const correct = isCorrect(exercise, p.exercises[exercise.id].answer)
  announce(`${correct ? 'Correct.' : 'À retravailler.'} ${exercise.explanation}`)
  render(exerciseIndex === current().exercises.length - 1 ? 'exercises-done' : 'next-exercise')
})
app.addEventListener('click', event => {
  const target = event.target.closest('button')
  if (!target || target.disabled || target.id === 'check-exercise') return
  const { id, dataset } = target
  const lesson = current(), p = record()
  let focus = id
  if (id === 'english-toggle') {
    englishHelp = !englishHelp
    try { storage?.setItem('af-pratique-english-help', String(englishHelp)) } catch {}
  } else if (dataset.view) { setView(dataset.view); return }
  else if (dataset.lesson) { openLesson(dataset.lesson, 'grammar'); lessonSearch = ''; render('page-title'); window.scrollTo(0, 0); return }
  else if (id === 'continue') { const next = nextActivity(progress); openLesson(next.lessonId, next.mode); render('page-title'); window.scrollTo(0, 0); return }
  else if (id === 'choose-lesson') { setView('lessons'); return }
  else if (dataset.activity) {
    const modes = { learn: 'grammar', cards: 'cards', write: 'writing' }
    if (dataset.activity !== activityOf(p.mode)) p.mode = modes[dataset.activity] || (mastery(lesson, p).exercises === lesson.exercises.length ? 'quiz' : 'exercises')
    flipped = false; showModel = false; save()
  } else if (id === 'learn-cards') { p.mode = 'cards'; save(); focus = 'tab-cards' }
  else if (id === 'flashcard') {
    flipped = !flipped
    if (flipped && !p.reviewed.includes(p.cardIndex)) p.reviewed.push(p.cardIndex)
    const card = lesson.cards[p.cardIndex]
    announce(flipped ? `${card.back}. ${card.example}` : card.front); save()
  } else if (id === 'rate-again' || id === 'rate-known') {
    rateCard(progress, lesson.id, p.cardIndex, id === 'rate-known' ? 'known' : 'again')
    p.cardIndex = (p.cardIndex + 1) % lesson.cards.length
    flipped = false; save(); focus = 'flashcard'
    announce(id === 'rate-known' ? 'Carte connue. Prochaine révision dans trois jours.' : 'Carte à revoir demain.')
  } else if (id === 'previous-card' || id === 'next-card') {
    p.cardIndex = (p.cardIndex + (id === 'next-card' ? 1 : -1) + lesson.cards.length) % lesson.cards.length
    flipped = false; save(); announce(lesson.cards[p.cardIndex].front)
  } else if (id === 'step-exercises' || id === 'step-quiz') { p.mode = id === 'step-quiz' ? 'quiz' : 'exercises'; save() }
  else if (id === 'next-exercise' || id === 'following-exercise' || id === 'previous-exercise') {
    exerciseIndex = (exerciseIndex + (id === 'previous-exercise' ? -1 : 1) + lesson.exercises.length) % lesson.exercises.length
    focus = id === 'next-exercise' ? 'exercise-answer' : id
  } else if (id === 'exercises-done') { p.mode = 'quiz'; save(); focus = 'quiz-answer-0' }
  else if (dataset.answer !== undefined) {
    const question = lesson.quiz[p.quizAttempt?.index || 0]
    const answer = question.options[Number(dataset.answer)]
    answerQuiz(progress, lesson.id, answer)
    announce(`${answer === question.answer ? 'Correct.' : `Réponse attendue : ${question.answer}.`} ${question.explanation}`)
    save(); focus = 'next-quiz'
  } else if (id === 'next-quiz') { nextQuiz(progress, lesson.id); save(); focus = p.quizAttempt.index === lesson.quiz.length ? 'restart-quiz' : 'quiz-answer-0' }
  else if (id === 'restart-quiz') { p.quizAttempt = null; save(); focus = 'quiz-answer-0' }
  else if (id === 'toggle-model') showModel = !showModel
  else if (id === 'export-progress') { exportProgress(); return }
  else if (id === 'import-progress') { document.querySelector('#import-file').click(); return }
  else if (id === 'reset-progress') {
    if (!confirm('Effacer tous les progrès de ce navigateur : cartes, textes, exercices et quiz ? Exporte une sauvegarde avant de continuer.')) return
    progress = freshProgress(); flipped = false; showModel = false; exerciseIndex = 0; save(); message = 'Le carnet a été réinitialisé.'
  } else return
  render(focus)
})

function exportProgress() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url; link.download = `af-pratique-${new Date().toISOString().slice(0, 10)}.json`
  document.body.append(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  message = 'Sauvegarde préparée. Conserve le fichier téléchargé.'; render('export-progress')
}
async function importFile(file) {
  if (!file) return
  try {
    if (file.size > 2 * 1024 * 1024) throw new Error('Le fichier est trop volumineux (maximum 2 Mo).')
    const candidate = normalizeProgress(JSON.parse(await file.text()), true)
    const drafts = Object.values(candidate.progress).reduce((n, p) => n + Number(Boolean(p.writingAnswer)) + Number(Boolean(p.taskAnswer)), 0)
    const results = Object.values(candidate.progress).reduce((n, p) => n + p.quizHistory.length, 0)
    if (!confirm(`Cette sauvegarde contient ${drafts} brouillon(s) et ${results} résultat(s) de quiz. Remplacer le carnet actuel ?`)) return
    progress = candidate; flipped = false; showModel = false; exerciseIndex = firstOpenExercise(); save()
    message = 'Sauvegarde importée.'
  } catch (error) { message = `Import impossible. ${error instanceof SyntaxError ? 'Le fichier JSON est invalide.' : error.message}` }
  render('import-progress')
}
exerciseIndex = firstOpenExercise()
render()
