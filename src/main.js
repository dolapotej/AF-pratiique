import './style.css'
import { lessons } from './data/lessons.js'
import { english, activityHelp } from './data/english.js'
import { readProgress, writeProgress, freshProgress, normalizeProgress, rateCard, answerQuiz, nextQuiz, mastery, nextActivity, dailySession, updateMistake, isCorrect } from './progress.js'

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
const questionHelp = new WeakMap()
const exerciseHelp = new WeakMap()
for (const lesson of lessons) {
  lesson.quiz.forEach((question, index) => questionHelp.set(question, { prompt: english[lesson.id].questions[index], lessonId: lesson.id }))
  lesson.exercises.forEach((exercise, index) => exerciseHelp.set(exercise, { prompt: english[lesson.id].exercises[index], lessonId: lesson.id }))
}
let progress = readProgress(storage)
let mode = progress.progress[progress.lessonId].mode
let flipped = false
let catalogue = false
let category = 'Toutes'
let lessonSearch = ''
let writingFeedback = false
let review = false
let reviewAnswer = null
let storageFailed = !storage
let message = ''
const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
const h = escapeHtml
const current = () => lessons.find(l => l.id === progress.lessonId)
const record = () => progress.progress[progress.lessonId]
const button = (id, label, cls = 'primary-btn', extra = '') => `<button id="${id}" class="${cls}" ${extra}>${label}</button>`
function englishNote(text) { return englishHelp && text ? `<aside class="english-note" lang="en">${h(text)}</aside>` : '' }
function englishRules(lessonId) { return englishHelp ? `<details class="english-rules" lang="en"><summary>Review the rules in English</summary><ul>${english[lessonId].sections.map(text => `<li>${h(text)}</li>`).join('')}</ul></details>` : '' }
function save() { storageFailed = !writeProgress(storage, progress) }
function announce(text) { live.textContent = text }
function changeLesson(id, nextMode = null) {
  catalogue = false
  progress.lessonId = id
  mode = nextMode || record().mode
  record().mode = mode
  flipped = false; writingFeedback = false; review = false; reviewAnswer = null
  save(); render('practice-title')
  document.querySelector('#practice-title').scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function render(focusId) {
  const previousFocus = focusId || document.activeElement?.id
  const lesson = current(), p = record(), summary = mastery(lesson, p)
  const known = lessons.reduce((n, l) => n + mastery(l, progress.progress[l.id]).known, 0)
  const total = lessons.reduce((n, l) => n + l.cards.length, 0)
  const percent = Math.round(known / total * 1000) / 10
  const position = lessons.indexOf(lesson)
  app.innerHTML = `<a class="skip-link" href="#practice-title">Aller à la pratique</a>
    <div class="app-shell">
      <aside class="sidebar"><div class="brand"><span class="brand-mark">AF</span><span>pratique</span></div><p class="sidebar-kicker">Mon parcours</p>
        <nav class="level-nav" aria-label="Niveaux"><span class="level active" aria-current="page"><span>A1</span><small>Débutant</small></span>${['A2', 'B1', 'B2'].map(level => `<button class="level muted" disabled><span>${level}</span><small>Bientôt</small></button>`).join('')}</nav>
        <div class="sidebar-foot">Un peu chaque jour.</div></aside>
      <main class="main-content"><header class="topbar"><div class="breadcrumb">A1 / <strong>A1.1 · Les bases</strong></div>${button('english-toggle', englishHelp ? 'English help: on' : 'English help', 'secondary-btn english-toggle', `lang="en" aria-pressed="${englishHelp}"`)}<a class="notebook-link" href="#notebook-title">Mon carnet</a><span class="streak">${known} / ${total} cartes connues</span></header>${englishHelp ? `<details id="english-overview" class="english-note" lang="en"><summary>English help is on · Navigation guide</summary><p>Continuer = resume; Ma révision du jour = daily review; Choisir une leçon = choose a lesson. Apprendre = learn; Cartes = flashcards; Exercices = exercises; Écrire = write; Parler = speak. Turn this help off at any time. Your browser remembers your choice.</p></details>` : ''}
        <section class="welcome"><div><p class="eyebrow">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>Bonjour.</h1><p class="lede">Comprendre, pratiquer, puis revenir.</p></div><div class="progress-ring" style="--progress:${percent * 3.6}deg"><strong>${percent}%</strong><span>connues</span></div></section>
        <section class="continue-panel"><span class="section-label">Ton prochain pas</span><h2>${h(lessons.find(l => l.id === nextActivity(progress).lessonId).title)}</h2><p>Reprends ton activité ou révise jusqu’à 8 éléments.</p><div class="actions">${button('start-review', 'Continuer →')}${button('daily-start', 'Ma révision du jour')}</div></section>
        <div class="section-heading practice-heading"><div><span class="section-label">Étape ${position + 1} / ${lessons.length} · ${h(lesson.category)}</span><h2 id="practice-title" tabindex="-1">${review ? 'Ma révision du jour' : h(lesson.title)}</h2></div>${button('catalogue-toggle', catalogue ? 'Fermer les leçons' : 'Choisir une leçon', 'secondary-btn', `aria-expanded="${catalogue}" aria-controls="catalogue"`)}</div>
        <section id="catalogue" ${catalogue ? '' : 'hidden'} aria-label="Catalogue des leçons"><label class="search-label" for="lesson-search">Rechercher une leçon ${englishHelp ? '<span lang="en">/ Find a lesson</span>' : ''}</label><input type="search" id="lesson-search" value="${h(lessonSearch)}" placeholder="Alphabet, nombres, introductions…" aria-describedby="lesson-search-status"><p id="lesson-search-status" role="status"></p><p>Parcours conseillé : commence par l’alphabet et avance à ton rythme. Toutes les leçons restent accessibles.</p><nav class="category-tabs" aria-label="Catégories">${['Toutes', ...new Set(lessons.map(l => l.category))].map((name, i) => `<button id="category-${i}" data-category="${h(name)}" aria-pressed="${category === name}" class="mode-tab ${category === name ? 'active' : ''}">${h(name)}</button>`).join('')}</nav><div class="lesson-grid">${lessons.map((l, index) => ({ l, index })).filter(({ l }) => category === 'Toutes' || l.category === category).map(({ l, index }) => {
          const s = mastery(l, progress.progress[l.id])
          return `<button id="lesson-${l.id}" class="lesson-card ${l.id === lesson.id ? 'selected' : ''}" data-lesson="${l.id}" aria-pressed="${l.id === lesson.id}"><span class="lesson-number ${l.color}">${String(index + 1).padStart(2, '0')}</span><span class="lesson-info"><strong>${h(l.title)}</strong><small>${h(l.subtitle)}</small><em>${s.complete ? 'Objectifs validés' : `${s.known} / ${l.cards.length} cartes connues`}</em></span></button>`
        }).join('')}</div></section>
        ${review ? '' : `<p class="learning-summary">${p.reviewed.length} cartes vues · ${summary.known} connues · ${summary.exercises} / ${lesson.exercises.length} exercices réussis · Dernier quiz : ${summary.score === null ? 'à faire' : `${summary.score} / ${lesson.quiz.length}`}</p><nav class="mode-tabs" aria-label="Activités">${[['grammar', 'Apprendre'], ['cards', 'Cartes'], ['exercises', 'Exercices'], ['quiz', 'Quiz'], ['writing', 'Écrire'], ['speaking', 'Parler']].map(([id, label]) => `<button id="mode-${id}" data-mode="${id}" class="mode-tab ${mode === id ? 'active' : ''}" aria-pressed="${mode === id}" aria-controls="practice-panel">${label}${englishHelp ? `<small lang="en">${({grammar: 'Learn', cards: 'Flashcards', exercises: 'Practice', quiz: 'Quiz', writing: 'Write', speaking: 'Speak'})[id]}</small>` : ''}</button>`).join('')}</nav>`}
        ${englishNote(review ? activityHelp.daily : `${english[current().id].title}. ${activityHelp[mode]}`)}<section id="practice-panel" class="practice-single" aria-labelledby="practice-title">${review ? renderDaily() : renderMode(lesson, p)}</section>
        ${review ? '' : `<div class="actions lesson-navigation">${position ? button('previous-lesson', '← Leçon précédente', 'secondary-btn') : ''}${position < lessons.length - 1 ? button('next-lesson', 'Leçon suivante →', 'secondary-btn') : ''}</div>`}
        <section class="progress-tools"><h2 id="notebook-title" tabindex="-1">Mon carnet</h2>${englishNote("Your notebook: known cards are self-ratings. Exercises and quizzes are checked automatically. Complete a lesson by marking all its cards known, passing its exercises and scoring at least 80% on the latest quiz. Progress is stored only in this browser. Exporter downloads a backup; Importer restores one; Réinitialiser clears your progress after confirmation.")}<p>Les cartes « connues » sont ton auto-évaluation. Les exercices et les quiz sont corrigés automatiquement. Une leçon est validée avec toutes ses cartes connues, ses exercices réussis et au moins 80 % au dernier quiz.</p>
          <details><summary>Mes résultats de quiz</summary>${renderHistory()}</details>
          <p id="storage-note">${storageFailed ? 'La sauvegarde est indisponible. Ton travail reste en mémoire pendant cette visite : exporte-le avant de fermer la page.' : 'Tes progrès sont enregistrés uniquement dans ce navigateur. Exporte une sauvegarde pour les garder ou les transférer.'}</p>
          <div class="actions">${button('export-progress', 'Exporter', 'secondary-btn')}${button('import-progress', 'Importer', 'secondary-btn')}${button('reset-progress', 'Réinitialiser', 'secondary-btn danger')}</div><input type="file" id="import-file" accept="application/json,.json" hidden><p id="data-message" role="status">${h(message)}</p>
        </section><footer><span>AF pratique · A1.1</span><span>Activités originales · Sans audio</span></footer>
      </main></div>`
  filterLessons()
  if (previousFocus) document.getElementById(previousFocus)?.focus({ preventScroll: true })
}

function filterLessons() {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  let count = 0
  for (const card of app.querySelectorAll('[data-lesson]')) {
    const lesson = lessons.find(l => l.id === card.dataset.lesson)
    card.hidden = !normalize(`${lesson.title} ${lesson.category} ${english[lesson.id].title}`).includes(normalize(lessonSearch.trim()))
    if (!card.hidden) count++
  }
  const status = document.getElementById('lesson-search-status')
  if (status) status.textContent = count ? `${count} leçon${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}` : 'Aucune leçon trouvée. Essaie un autre mot ou une autre catégorie.'
}

function renderMode(lesson, p) {
  if (mode === 'grammar') return `<article class="study-panel grammar-panel"><span class="section-label">Comprendre avant de pratiquer</span><h3>À la fin de cette leçon</h3><ul>${lesson.objectives.map(text => `<li>${h(text)}</li>`).join('')}</ul><p class="study-note">Parcours : lis les explications, observe la scène, puis fais les exercices avant le quiz.</p><nav class="lesson-contents" aria-label="Dans cette leçon"><strong>Dans cette leçon</strong>${lesson.sections.map(([title], index) => `<a href="#section-${index}">${index + 1}. ${h(title)}</a>`).join('')}<a href="#lesson-scene">En situation</a></nav>${lesson.sections.map(([title, explanation, examples], index) => `<section class="teaching-section" id="section-${index}" tabindex="-1"><h3>${h(title)}</h3><p>${h(explanation)}</p>${englishNote(english[lesson.id].sections[index])}<div class="example-list">${examples.map(e => `<strong>${h(e)}</strong>`).join('')}</div></section>`).join('')}<section class="reading" id="lesson-scene" tabindex="-1"><h3>En situation</h3>${englishNote(`Scene summary: ${english[lesson.id].reading}`)}${lesson.dialogue.map(line => `<p>${h(line)}</p>`).join('')}<p class="study-note">Repère les expressions de la leçon. Le quiz contient une question sur cette scène.</p></section>${button('learn-exercises', 'Passer aux exercices →')}</article>`
  if (mode === 'cards') return renderCard(lesson, p.cardIndex, false)
  if (mode === 'exercises') return `<article class="study-panel"><span class="section-label">Pratique guidée · Correction automatique</span><h3>Construire tes propres réponses</h3><p>Complète, remets en ordre et transforme. Les majuscules et la ponctuation finale sont tolérées ; les accents comptent. Pour un exercice de ponctuation, le signe demandé est obligatoire.</p>${lesson.exercises.map((e, i) => {
    const attempt = p.exercises[e.id] || { answer: '', checked: false }
    return `<section class="exercise"><label for="answer-${i}"><strong>${i + 1}. ${h(e.prompt)}</strong></label>${englishNote(exerciseHelp.get(e).prompt)}<input id="answer-${i}" data-exercise="${e.id}" value="${h(attempt.answer)}" autocomplete="off" maxlength="1000" aria-describedby="feedback-${i}">${button(`check-${i}`, 'Vérifier', 'secondary-btn', `data-check="${i}"`)}<div id="feedback-${i}" ${attempt.checked ? 'class="exercise-feedback"' : ''}>${attempt.checked ? exerciseFeedback(e, attempt.answer) : ''}</div></section>`
  }).join('')}</article>`
  if (mode === 'quiz') return renderQuiz(lesson, p)
  if (mode === 'writing') return `<article class="study-panel writing-panel"><span class="section-label">Production écrite · Auto-évaluation</span><h3>${h(lesson.writing.prompt)}</h3>${englishNote(english[lesson.id].writing)}<p>Prépare tes idées avec les exemples, puis écris sans les recopier. Le texte libre n’est pas noté automatiquement.</p><label for="writing-answer">Ton texte</label><textarea id="writing-answer" maxlength="20000" placeholder="Écris ta réponse ici…">${h(p.writingAnswer)}</textarea><p class="draft-note">Brouillon sauvegardé à chaque modification, si le stockage est disponible.</p>${button('check-writing', writingFeedback ? 'Masquer les repères' : 'Relire mon texte', 'primary-btn', `aria-expanded="${writingFeedback}"`)}${writingFeedback ? `<div class="rubric"><h3>Repères de relecture</h3>${englishNote("Self-check: answer every part of the task, use the lesson structures, and check agreement, accents and punctuation. The model is one possible answer, not a correction of your writing.")}<p id="writing-hints">${h(writingHints(p.writingAnswer))}</p><p>À vérifier toi-même :</p>${lesson.writing.rubric.map((text, i) => `<label class="rubric-item"><input id="rubric-${i}" type="checkbox" data-rubric="${i}" ${p.rubric.includes(i) ? 'checked' : ''}>${h(text)}</label>`).join('')}<div class="model-answer"><small>Une réponse possible, pas une correction de ton texte</small>${h(lesson.writing.model)}</div><p>Compare les structures, puis améliore ton brouillon. Plusieurs réponses sont possibles.</p></div>` : ''}${lesson.task ? `<section class="teaching-section"><h3>${h(lesson.task.title)}</h3>${englishNote(english[lesson.id].task)}<p>${h(lesson.task.prompt)}</p><label for="task-answer">Mon projet</label><textarea id="task-answer" maxlength="20000">${h(p.taskAnswer)}</textarea><p>Repères pour relire ton projet :</p><ul>${lesson.task.rubric.map(text => `<li>${h(text)}</li>`).join('')}</ul></section>` : ''}</article>`
  return `<article class="study-panel"><span class="section-label">Production orale · Sans enregistrement</span><h3>Préparer, parler, recommencer</h3><p>${h(lesson.speaking)}</p>${englishNote(english[lesson.id].speaking)}<ol><li>Prépare trois mots utiles sans écrire tout le dialogue.</li><li>Parle à voix haute pendant une minute, seul ou avec un partenaire.</li><li>Recommence avec un autre nom, un autre lieu ou un autre horaire.</li></ol><h3>Pour aller plus loin</h3><p>${h(lesson.challenge)}</p><p class="study-note">Auto-évaluation : ai-je été compris ? Ai-je posé une question ? Ai-je utilisé les expressions étudiées ?</p></article>`
}

function exerciseFeedback(exercise, answer) {
  return `${englishNote(isCorrect(exercise, answer) ? 'Correct!' : `Not quite. Expected French answer: ${exercise.answers.join(' / ')}. Compare it with your answer, including accents and agreement.`)}${englishRules(exerciseHelp.get(exercise).lessonId)}<strong>${isCorrect(exercise, answer) ? 'Correct !' : 'À retravailler.'}</strong><p>${h(exercise.explanation)}</p>${isCorrect(exercise, answer) ? '' : `<p>Réponse attendue : ${exercise.answers.map(h).join(' / ')}</p>`}`
}
function writingHints(text) {
  if (!text.trim()) return 'Ton brouillon est vide. Commence par une phrase qui répond à la consigne.'
  const words = text.trim().split(/\s+/).length
  const notes = [`${words} mots. Ce décompte ne mesure pas la qualité du texte.`]
  if (!/[.!?]\s*$/.test(text.trim())) notes.push('Pense à la ponctuation finale.')
  if (/\bje suis\s+(?:\d+|vingt|trente|dix|douze)\s+ans/i.test(text)) notes.push('Pour l’âge, utilise « j’ai … ans ».')
  if (/\bje aime\b/i.test(text)) notes.push('Devant aime, je devient j’ : j’aime.')
  if (/\bne est\b/i.test(text)) notes.push('Devant est, ne devient n’ : n’est.')
  notes.push('Ces repères simples ne vérifient pas toute la grammaire ni le respect de la consigne.')
  return notes.join(' ')
}
function renderCard(lesson, index, daily) {
  const card = lesson.cards[index]
  const p = progress.progress[lesson.id]
  const rating = p.ratings[index]?.status
  return `<div class="flashcard-wrap"><p class="tiny-note">${daily ? h(lesson.title) : `${p.reviewed.length} / ${lesson.cards.length} cartes vues`} · ${rating === 'known' ? 'Connue' : rating === 'again' ? 'À revoir' : 'Pas encore évaluée'}</p><button class="flashcard ${flipped ? 'is-flipped' : ''}" id="flashcard" aria-label="${flipped ? 'Revoir le recto' : 'Révéler la réponse'}" aria-pressed="${flipped}"><span class="flashcard-face"><small>${flipped ? h(card.front) : h(card.tag)}</small><strong${flipped && !card.prompt ? ' lang="en"' : ''}>${h(flipped ? card.back : card.front)}</strong><em>${h(flipped ? card.example : card.prompt || 'Essaie de retrouver le sens avant de retourner la carte.')}</em><span class="flip-hint">${flipped ? 'Retourner au recto' : 'Toucher pour voir la réponse'} ↻</span></span></button>${flipped ? englishNote(`${card.exampleEn}${card.note ? ` ${card.note}` : ''}`) : englishNote(card.prompt ? (card.tag === 'Nom de la lettre' ? 'Say the French name of this letter, then flip to check.' : 'Spell the name in order, including any accents, then flip to check.') : 'Recall the meaning, then flip to check. Rate the card only after seeing the answer.')}${flipped ? `<div class="actions rating-actions">${button('rate-again', 'À revoir', 'secondary-btn')}${button('rate-known', 'Je connais', 'primary-btn')}</div><p class="study-note">À revoir : revient demain. Je connais : revient dans trois jours. Ce choix est ton auto-évaluation.</p>` : ''}${daily ? '' : `<div class="card-controls">${button('previous-card', '←', 'round-btn', 'aria-label="Carte précédente"')}<span>${index + 1} / ${lesson.cards.length}</span>${button('next-card', '→', 'round-btn dark', 'aria-label="Carte suivante"')}</div>`}</div>`
}
function questionHtml(question, selected, prefix) {
  return `<h3>${h(question.question)}</h3>${englishNote(questionHelp.get(question).prompt)}<div class="options">${question.options.map((option, i) => `<button id="${prefix}-${i}" class="option ${selected !== null && option === question.answer ? 'correct' : ''}" data-answer="${i}" ${selected !== null ? 'disabled' : ''}>${h(option)}</button>`).join('')}</div>${selected !== null ? `<div class="quiz-result ${selected === question.answer ? 'good' : 'try-again'}"><strong>${selected === question.answer ? 'Correct !' : `Réponse attendue : ${h(question.answer)}`}</strong><p>${h(question.explanation)}</p>${englishNote(selected === question.answer ? 'Correct! Read the explanation or review the English rules below.' : `Expected answer: ${question.answer}. Review the rules below to understand your mistake.`)}${englishRules(questionHelp.get(question).lessonId)}</div>` : ''}`
}
function renderQuiz(lesson, p) {
  const a = p.quizAttempt || { index: 0, answers: [] }
  const question = lesson.quiz[a.index]
  const score = a.answers.filter((answer, i) => answer === lesson.quiz[i].answer).length
  if (!question) return `<article class="study-panel quiz-complete"><span class="section-label">Quiz terminé</span><h3>${score} / ${lesson.quiz.length}</h3>${englishNote(`Quiz complete: ${score} out of ${lesson.quiz.length}. Your result is saved. Missed questions are added to review; Recommencer starts a new attempt.`)}<p>${score / lesson.quiz.length >= 0.8 ? 'Objectif du quiz atteint.' : 'Reviens aux explications, puis réessaie.'} Les erreurs sont ajoutées à tes révisions.</p><ol>${a.answers.map((answer, i) => `<li>${h(lesson.quiz[i].question)}<br>Ta réponse : ${h(answer)}. ${answer === lesson.quiz[i].answer ? 'Correct.' : `Réponse attendue : ${h(lesson.quiz[i].answer)}.`}</li>`).join('')}</ol>${button('restart-quiz', 'Recommencer')}</article>`
  const selected = a.answers[a.index] ?? null
  return `<article class="study-panel quiz-panel"><div class="quiz-top"><span>Quiz · Correction automatique</span><span>${a.index + 1} / ${lesson.quiz.length}</span></div>${questionHtml(question, selected, 'quiz-answer')}${selected !== null ? button('next-quiz', a.index === lesson.quiz.length - 1 ? 'Terminer' : 'Question suivante →') : ''}</article>`
}
function renderHistory() {
  const entries = lessons.flatMap(lesson => progress.progress[lesson.id].quizHistory.map(result => ({ ...result, title: lesson.title }))).sort((a, b) => b.date.localeCompare(a.date))
  return entries.length ? `<ul class="history">${entries.map(e => `<li>${h(e.title)} — ${e.score} / ${e.total} <time>${new Date(e.date).toLocaleString('fr-FR')}</time></li>`).join('')}</ul>` : '<p>Aucun quiz terminé pour le moment.</p>'
}
function renderDaily() {
  const session = progress.daily
  const item = session.items[session.index]
  if (!item) return `<article class="study-panel"><h3>${session.items.length ? 'Révision terminée !' : 'Rien à revoir aujourd’hui.'}</h3><p>${session.items.length ? `${session.items.length} éléments travaillés. Les cartes restent planifiées selon tes choix ; les erreurs de quiz restent à revoir jusqu’à une bonne réponse.` : 'Tes cartes évaluées ne sont pas encore dues. Tu peux continuer une leçon.'}</p>${button('daily-exit', 'Revenir à ma leçon')}</article>`
  const lesson = lessons.find(l => l.id === item.lessonId)
  return `<p class="daily-counter">${session.index + 1} / ${session.items.length} · ${h(lesson.title)}</p>${item.type === 'card' ? renderCard(lesson, item.index, true) : `<article class="study-panel quiz-panel">${questionHtml(lesson.quiz[item.index], reviewAnswer, 'daily-answer')}${reviewAnswer !== null ? button('daily-next', 'Continuer la révision →') : ''}</article>`}${button('daily-exit', 'Reprendre plus tard', 'secondary-btn')}`
}

app.addEventListener('input', event => {
  if (event.target.id === 'lesson-search') { lessonSearch = event.target.value; filterLessons(); return }
  if (event.target.id === 'task-answer') { record().taskAnswer = event.target.value; save() }
  if (event.target.id === 'writing-answer') { record().writingAnswer = event.target.value; save(); const hints = document.querySelector('#writing-hints'); if (hints) hints.textContent = writingHints(event.target.value) }
  if (event.target.dataset.exercise) { record().exercises[event.target.dataset.exercise] = { answer: event.target.value, checked: false }; const feedback = document.getElementById(event.target.getAttribute('aria-describedby')); if (feedback) { feedback.textContent = ''; feedback.className = '' }; save() }
  const note = document.querySelector('#storage-note')
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
app.addEventListener('click', event => {
  const target = event.target.closest('button')
  if (!target || target.disabled) return
  const { id, dataset } = target
  const lesson = current(), p = record()
  let focus = id
  if (id === 'english-toggle') {
    englishHelp = !englishHelp
    try { storage?.setItem('af-pratique-english-help', String(englishHelp)) } catch {}
    render(id); return
  }
  if (dataset.lesson) { changeLesson(dataset.lesson); return }
  if (dataset.category) category = dataset.category
  else if (dataset.mode) { mode = dataset.mode; p.mode = mode; flipped = false; save() }
  else if (dataset.check !== undefined) {
    const exercise = lesson.exercises[Number(dataset.check)]
    p.exercises[exercise.id] ||= { answer: '' }
    p.exercises[exercise.id].checked = true
    save(); announce(`${isCorrect(exercise, p.exercises[exercise.id].answer) ? 'Correct.' : 'À retravailler.'} ${exercise.explanation}`)
  } else if (dataset.answer !== undefined) {
    if (review) {
      if (reviewAnswer !== null) return
      const item = progress.daily.items[progress.daily.index]
      const l = lessons.find(l => l.id === item.lessonId), q = l.quiz[item.index]
      reviewAnswer = q.options[Number(dataset.answer)]
      updateMistake(progress.progress[l.id], item.index, reviewAnswer === q.answer)
      announce(`${reviewAnswer === q.answer ? 'Correct.' : `Réponse attendue : ${q.answer}.`} ${q.explanation}`)
      focus = 'daily-next'
    } else {
      const q = lesson.quiz[p.quizAttempt?.index || 0]
      const answer = q.options[Number(dataset.answer)]
      answerQuiz(progress, lesson.id, answer)
      announce(`${answer === q.answer ? 'Correct.' : `Réponse attendue : ${q.answer}.`} ${q.explanation}`)
      focus = 'next-quiz'
    }
    save()
  } else if (id === 'catalogue-toggle') catalogue = !catalogue
  else if (id === 'start-review') { const next = nextActivity(progress); changeLesson(next.lessonId, next.mode); return }
  else if (id === 'daily-start') { dailySession(progress); review = true; reviewAnswer = null; flipped = false; save(); focus = 'practice-title' }
  else if (id === 'daily-exit') { review = false; flipped = false; reviewAnswer = null; focus = 'practice-title' }
  else if (id === 'daily-next') { progress.daily.index++; reviewAnswer = null; flipped = false; save(); focus = 'practice-title' }
  else if (id === 'flashcard') {
    flipped = !flipped
    const item = review ? progress.daily.items[progress.daily.index] : { lessonId: lesson.id, index: p.cardIndex }
    const data = progress.progress[item.lessonId]
    if (flipped && !data.reviewed.includes(item.index)) data.reviewed.push(item.index)
    const card = lessons.find(l => l.id === item.lessonId).cards[item.index]
    announce(flipped ? `${card.back}. ${card.example}` : card.front); save()
  } else if (id === 'rate-again' || id === 'rate-known') {
    const item = review ? progress.daily.items[progress.daily.index] : { lessonId: lesson.id, index: p.cardIndex }
    rateCard(progress, item.lessonId, item.index, id === 'rate-known' ? 'known' : 'again')
    if (review) progress.daily.index++
    else p.cardIndex = (p.cardIndex + 1) % lesson.cards.length
    flipped = false; save(); focus = review ? 'practice-title' : 'flashcard'
    announce(id === 'rate-known' ? 'Carte connue. Prochaine révision dans trois jours.' : 'Carte à revoir demain.')
  } else if (id === 'previous-card' || id === 'next-card') { p.cardIndex = (p.cardIndex + (id === 'next-card' ? 1 : -1) + lesson.cards.length) % lesson.cards.length; flipped = false; save(); announce(lesson.cards[p.cardIndex].front) }
  else if (id === 'learn-exercises') { mode = 'exercises'; p.mode = mode; save(); focus = 'mode-exercises' }
  else if (id === 'next-quiz') { nextQuiz(progress, lesson.id); save(); focus = p.quizAttempt.index === lesson.quiz.length ? 'restart-quiz' : 'quiz-answer-0' }
  else if (id === 'restart-quiz') { p.quizAttempt = null; save(); focus = 'quiz-answer-0' }
  else if (id === 'check-writing') writingFeedback = !writingFeedback
  else if (id === 'previous-lesson' || id === 'next-lesson') { changeLesson(lessons[lessons.indexOf(lesson) + (id === 'next-lesson' ? 1 : -1)].id); return }
  else if (id === 'export-progress') { exportProgress(); return }
  else if (id === 'import-progress') { document.querySelector('#import-file').click(); return }
  else if (id === 'reset-progress') {
    if (!confirm('Effacer tous les progrès de ce navigateur : cartes, textes, exercices et quiz ? Exporte une sauvegarde avant de continuer.')) return
    progress = freshProgress(); mode = 'grammar'; review = false; flipped = false; writingFeedback = false; save(); message = 'Le carnet a été réinitialisé.'; focus = 'practice-title'
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
    progress = candidate; mode = record().mode; review = false; flipped = false; writingFeedback = false; save()
    message = 'Sauvegarde importée.'
  } catch (error) { message = `Import impossible. ${error instanceof SyntaxError ? 'Le fichier JSON est invalide.' : error.message}` }
  render('import-progress')
}
render()
