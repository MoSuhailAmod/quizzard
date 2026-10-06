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

## Build
```bash
npm run build
```
This writes static files to `dist/`. They can be served by any basic static web server.
To check the built output locally: `npm run preview`.

## Project structure
```
src/
  index.html, styles.css, main.js   the app
  data/questions/                   static question bank (one file per subject)
scripts/
  serve.mjs                         tiny static file server
  build.mjs                         copies src/ to dist/
```

## Content rule
Only South African Grade 12 CAPS-aligned questions may be added to the question bank.
