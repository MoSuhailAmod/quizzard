# Quizzard

A deliberately simple, throwaway practice quiz app for South African Grade 12 (matric) revision.
Static files only: no database, accounts, analytics or runtime dependencies.

## Requirements
- Node.js 20 or newer (only Node built-ins are used; there is nothing to `npm install`).

## Run locally
```bash
npm start
```
Then open http://localhost:3000. To try it on a phone on the same network, open
`http://<your-computer-ip>:3000`.

Use another port with `PORT=4000 npm start` (PowerShell: `$env:PORT=4000; npm start`).

## Commands
| Command | What it does |
|---|---|
| `npm start` | Serve `src/` locally. |
| `npm run validate` | Check the question bank. Exits with an error if anything is wrong. |
| `npm test` | Run the unit tests for the validation rules. |
| `npm run build` | Validate the question bank, then write static files to `dist/`. The build stops if validation fails. |
| `npm run preview` | Serve the built `dist/` folder locally. |

The files in `dist/` can be served by any basic static web server.

## Project structure
```
src/
  index.html, styles.css, main.js   the app: screens and subject selection
  quiz.js                           the quiz (placeholder until the quiz issue)
  data/questions/                   static question bank (one file per subject)
    schema.js                       question format and validation rules
    index.js                        registers subject files, filter-by-subject helpers
    README.md                       how to add questions: read this first
scripts/
  serve.mjs                         tiny static file server
  validate.mjs                      question bank validation
  build.mjs                         validates, then copies src/ to dist/
  schema.test.mjs                   tests for the validation rules
```

## Content rule
Only South African Grade 12 CAPS-aligned questions may be added to the question bank. Every
question records where it came from (`origin` and `source`). See
[`src/data/questions/README.md`](src/data/questions/README.md) for the format and the rules.
