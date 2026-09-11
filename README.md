# AF pratique

A local-first French A1.1 practice app, built with vanilla JavaScript and Vite.

## Run and validate

```sh
npm install
npm run dev
npm test
npm run build
npm run test:browser
```

On Windows where PowerShell blocks `npm.ps1`, use `npm.cmd`. Browser tests require an installed Google Chrome, build the app, and serve `dist` on port 5191. They cover desktop, 390px, and 320px viewports. Screenshots and traces go to the ignored `test-results` directory.

## Learning content

The 16 lessons include 275 flashcards, 77 teaching sections with examples, 16 contextual readings/dialogues, 111 guided exercises, 64 quiz questions with explanations, and writing/speaking tasks. The suggested sequence starts with the alphabet and introductions and moves into grammar, daily life, outings, messages, and francophone contexts. Every lesson remains freely accessible.

- `src/data/core.js`: the initial three lesson datasets; their card order remains compatible with old saves.
- `src/data/lessons.js`: base topic content and assembly.
- `src/data/depth.js`: teaching sequences, original readings, exercise answers, explanations, and the display order.
- `src/data/textbook.js`: additions aligned with the supplied photos, including separate writing projects.
- `src/progress.js`: save validation/migration, quiz scoring, self-ratings, completion and daily review.
- `src/main.js`: interface, practice interactions, focus management and backup controls.

The content is original and has been aligned with all 30 supplied textbook photos. See [TEXTBOOK_ALIGNMENT.md](TEXTBOOK_ALIGNMENT.md) for the photo-by-photo coverage, added practice and limits of the supplied pages. The pronunciation activity uses written guidance; there is no listening audio or recording.

## Optional English support

French remains the default. The **English help** button adds English companions beside the French: navigation help, guides for all 77 teaching sections, instructions for all 111 exercises and 64 quiz questions, scene summaries, writing/speaking instructions and project guidance. After checking an answer, English feedback and an expandable rule review are available. These are authored explanations and summaries, not word-for-word translations of every example. Flashcard backs already provide English vocabulary meanings. Answers remain in French where the exercise requires French.

The preference is saved separately in this browser (`af-pratique-english-help`) and does not affect progress, scoring or backup contents. It starts off in a fresh browser and can be switched off at any time. No external translation service receives learner text. English blocks have `lang="en"`; the page language stays French. `src/data/english.js` contains the companion content, with coverage tests for every lesson.

## Progress and feedback

Revealing a card records a view; it does not mark it known. “Je connais” and “À revoir” are learner self-ratings, scheduling the card in three days or one day respectively. A daily session contains up to eight mistakes/due cards, then vocabulary from the current lesson or previously viewed cards. It resumes across reloads and refreshes the next local calendar day. This is a simple review schedule, not an adaptive spaced-repetition algorithm.

Quiz attempts resume across reloads; completed scores are stored (up to 30 per lesson). Mistakes remain available for review until answered correctly. Completion requires all cards self-rated known, all guided exercises answered correctly, and at least 80% on the latest quiz. With four questions, that currently means four correct answers.

Guided exercises are checked against authored accepted answers, preserving accent distinctions and tolerating case/apostrophe/final punctuation differences. Free writing has a saved draft, lesson-specific self-checklist, model answer and limited rule-based reminders. It is explicitly not automatically graded or comprehensively corrected.

Version 5 saves accept versions 2 through 4, preserving views, ratings, drafts and daily review while shifting old card references to their new positions. Export creates a JSON backup. Import validates and normalizes the backup, previews draft/result counts and asks before replacing current work. Reset also asks for confirmation. No account, server database or cross-device sync is involved. When browser storage is unavailable, work continues in memory and the interface recommends exporting it.

## Verification boundaries

Logic tests cover scoring, review selection, answer matching, migration and save round-tripping. Browser tests cover all lessons, exercises, quiz results, draft persistence, backup/reset, storage failures, keyboard focus and viewport bounds. Phone viewports are Chrome emulation, not physical-device or Safari tests.

Flashcards now begin with individual alphabet letters, numbers and calendar words before recap cards. English help translates every example and explains selected grammar traps. Letter sound guides are approximate written aids; no audio has been added. Older backups migrate card positions, ratings and daily-review references to the expanded decks.

## Navigation and reading

The lesson picker supports French and English title search (accent-insensitive) and category filters. Selecting a lesson closes the picker and focuses practice. Grammar lessons include section shortcuts. English help adds bilingual activity labels and a collapsible navigation guide. Mobile layouts use a compact header and a three-column activity grid; cards have explicit flip hints and larger navigation controls.
