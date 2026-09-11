Run `npm run test:browser` from the project root. Google Chrome must be installed.

The command builds the app, then serves the production files at http://127.0.0.1:5191 and runs in headless Chrome at desktop (1440px), mobile (390px), and small mobile (320px) sizes. Phone projects emulate touch and viewport behavior; they do not replace testing on physical phones or Safari.

Checks cover all 16 teaching sequences, 111 guided exercises, 64 quiz questions, scoring, practice modes, page overflow, practice panel bounds, draft/checklist persistence, category filtering, daily review resumption, export/import/reset, storage failures, and keyboard focus. Practice screenshots are saved under `test-results/`; failures also retain a trace.

Run `npm test` for the separate logic regression suite and `npm run build` for production compilation. In PowerShell environments that block npm.ps1, use `npm.cmd` instead of `npm`.
