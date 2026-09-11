# Alignment with the supplied textbook photos

Reviewed all 30 images attached in the `369fc680-3fe4-4f4c-ad15-bc5b60029ea0` batch. The visible pages cover the introductory material (14–15), Unit 1 (18–31), and Unit 2 (34–47), in mostly reverse order. Pages 16–17 and 32–33 were not supplied; this is alignment with the provided pages, not a claim of complete textbook transcription or coverage of unseen pages.

The app uses original examples, fictional profiles/programmes and fresh exercises. The photos, layouts, copyrighted readings, survey figures and celebrity biographies are not shipped in the app. Listening, video playback and recording remain excluded. Their underlying communicative objectives are practised through written scenes and speaking prompts. Written pronunciation guidance is not an automatic pronunciation assessment.

## Photo-by-photo coverage

| Image | Visible page | Concepts identified | App coverage |
|---|---|---|---|
| 1 | 47 | Preferences, asking/telling time, moments, negotiating a weekend activity | preferences, calendar, outings; constraint-based invitation and saved outing project |
| 2 | 46 | Classroom objects, shapes, sports, leisure places and hobbies; un/une and elision | classroom vocabulary and description exercises; preferences/outing vocabulary; alphabet articulation guidance |
| 3 | 45 | Possessives for all persons; à/de contractions | articles owner-change exercises; preferences faire + de; outings destinations |
| 4 | 44 | ne… pas/plus/jamais/rien; indefinites and negated quantities | negation explanations and four added exercises; classroom/articles |
| 5 | 43 | Asking for a programme by email; interests and punctuation | messages programme request, separate saved project draft and rubric |
| 6 | 42 | Situation-appropriate wishes and agreement | feelings wishes, card set and applied exercises |
| 7 | 41 | Reading a leisure survey; figurative language; film profile project | preferences fictional survey; francophonie idiom and fictional film project |
| 8 | 40 | Possession, object identification, sport profiles, destinations and showtimes | articles, classroom, preferences, outings and calendar; original profiles replace named celebrities |
| 9 | 39 | Reading event listings; going to places; SMS with time/place | calendar listing exercises; outings budget/availability task and saved message project |
| 10 | 38 | Telling time; showtimes; parts of day and date ranges | calendar schedule-reading sections and exercises; no unverified present-day timezone claims |
| 11 | 37 | faire conjugation; de contractions; comparing activities | preferences full faire paradigm, activity vocabulary and contraction exercises |
| 12 | 36 | Sports, likes/dislikes, noun versus infinitive, mais, elision | preferences teaching, noun-to-infinitive exercise; alphabet and negation |
| 13 | 35 | Suitcase contents; possessives; lost objects | articles owner-change task and suitcase vocabulary; classroom personal objects |
| 14 | 34 | Identifying objects; indefinites; shapes; ne… plus | classroom description/shape exercises; negation change-of-state exercise |
| 15 | 31 | Introducing someone, asking identity questions, feelings, polite exchanges | introductions third-person profile; numbers question forms; feelings requests |
| 16 | 30 | Countries, professions, numbers 11–69; il/elle, liaison and stress | countries/professions vocabulary expansion; numbers; alphabet written phonetics |
| 17 | 29 | Nationality gender/plural and irregular forms; quel agreement | countries exceptions/transformations; numbers quel/quelle/quels/quelles exercises |
| 18 | 28 | Subject/stressed pronouns; country articles; simple negation | pronouns tonic forms and practice; countries article exceptions; negation |
| 19 | 27 | Form fields, identity data, identifying information | messages original fictional profile with name/date exercises; no real passwords requested |
| 20 | 26 | Polite requests/replies, intonation | feelings voudrais/je vous en prie practice; alphabet written intonation guidance |
| 21 | 25 | Feelings in messages, numbers, idiom, country profile project | feelings figurative expression; numbers; francophonie country-and-film project |
| 22 | 24 | Names, professions, country articles, negation, francophone contexts | introductions, professions, countries, negation, francophonie; historical membership counts not presented as current facts |
| 23 | 23 | Physical/emotional states; numbers in words | feelings être versus avoir and short exchanges; numbers exercises |
| 24 | 22 | Asking age and nationality, avoir, quel, number liaison | numbers full avoir and interrogatives; countries/feelings; written liaison examples |
| 25 | 21 | Nationality agreement, negation, identity profile and class presentation | countries irregular/plural exercises; introductions and professions original profiles |
| 26 | 20 | Festival reading, countries/articles, colours | francophonie fictional festival reading; countries article exercises; classroom colours |
| 27 | 19 | Alphabet, names in everyday objects, spelling, business card | alphabet spelling/articulation; introductions original business-card exercise |
| 28 | 18 | Introducing self/others, s’appeler, tonic pronouns, professions, il/elle | introductions, pronouns, professions, alphabet |
| 29 | 15 | Classroom commands, counting, simple self-introduction | classroom instructions; numbers; introductions |
| 30 | 14 | Place/time/manner questions, days, moments and colours | numbers interrogatives; calendar; classroom colour vocabulary |

Some photos contain glare, handwriting or cropped margins. The mapping follows legible teaching boxes and task themes; illegible individual answers and missing audio are not reconstructed. The basic town-directions lesson and numbers above 69 remain useful extensions beyond the main emphasis of these photos.

## Implementation and preservation

- `src/data/textbook.js` adds explanations, vocabulary and uniquely identified guided exercises to the existing 16 lessons. `textbook.images` records the source-photo mapping.
- Existing card indices, exercise IDs and quiz questions stay in their original order. Added cards and exercises are appended. This preserves old views, card self-ratings, guided answers and quiz histories.
- Three larger writing projects cover an outing, a programme request, and country/film profiles. Their `taskAnswer` draft is separate from the original writing exercise and survives reload/export/import.
- The punctuation exercise explicitly requires a question mark. General answer matching still tolerates final punctuation for other exercise types.
- New course totals: 202 cards, 77 teaching sections, 111 guided exercises, 64 quiz questions, 16 readings/dialogues, and writing/speaking tasks across all 16 lessons.

## Verification

The logic suite verifies all source image numbers are mapped, key new concepts have exercise IDs, every accepted answer is markable, IDs remain unique, punctuation is enforced and project drafts round-trip. Browser tests execute every guided exercise and quiz at desktop, 390px and 320px widths, plus persistence, backup/reset, storage recovery and keyboard focus. These tests verify implementation behavior; the photo review and content mapping above provide the pedagogical alignment evidence.

Validation completed on 9 September 2026: 11 logic tests passed and the production build passed. The 21-case browser suite passed 18 cases initially and exposed rounding of one known card to 0% in three viewport cases. Progress now displays a decimal when needed. All nine affected progress/backup/project cases passed on the rebuilt app, resolving those three failures and verifying the updated import preview. No failing case remains. Phone tests use Chrome viewport emulation, not physical phones or Safari.
