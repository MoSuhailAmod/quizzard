# Question bank

Static question data, one file per subject (`english.js`, ...), registered in `index.js`.

## The rule

Only South African **Grade 12 CAPS-aligned** questions may be added. Nothing may be based on
assumptions, international curricula, or topics outside the Grade 12 CAPS syllabus. Official DBE CAPS
documents, Grade 12 exam guidelines and NSC past papers/memoranda are the source of truth.

Every question has exactly four options and exactly one correct answer.

## Question format

```js
{
  id: "eng-001",                 // unique across the whole bank
  subject: "English",
  question: "...",               // self-contained: no passage, image, diagram or table needed
  options: ["...", "...", "...", "..."],   // exactly 4, shown in this order (never shuffled)
  correctAnswer: 1,              // index 0-3 of the correct option
  origin: "past-paper",          // "past-paper" | "adapted" | "generated"
  source: "NSC Nov 2023, English HL P1, Q4.2",
}
```

There is no `explanation` field, and any other unknown field is rejected.

## `origin`: where a question came from

| `origin` | What it is | `source` must contain |
|---|---|---|
| `past-paper` | A multiple-choice question copied from an official NSC past paper. The correct answer is taken from the official memo. | Paper reference: subject, year/session, paper, question number. |
| `adapted` | A question from an official past paper that is not multiple choice. The correct answer is taken from the official memo. The three wrong options are written to be plausible and close to the right answer. | Paper reference, as above. |
| `generated` | A new question (for example AI-written) that tests a specific topic in the Grade 12 CAPS document. | The CAPS document and the specific section/topic it is based on. |

AI may help draft questions, but they must always be based on the CAPS syllabus, never on topics
outside it. A `generated` question must be reviewed by the user before it is merged.

### Rules for `adapted` and `generated` questions

- Wrong options must be believable and close to the correct answer, based on common learner errors,
  and similar in form and length to the correct option.
- Exactly one option is unambiguously correct. No wrong option may also be arguably correct.
- The question must be answerable from Grade 12 CAPS content only.

## Adding a subject

1. Create `<subject>.js` exporting an array of questions as its default export.
2. In `index.js`, import it, add the file name to `subjectFiles` and spread the array into `questions`.
3. Run `npm run validate`.

## Validation

`npm run validate` checks every question: required text fields, unique `id`, exactly four non-empty
and different options, `correctAnswer` 0-3, a known `origin`, a `source`, no unknown fields, and no
duplicate question within a subject. It also checks that every subject file is registered in
`index.js`. `npm run build` runs the same check first and stops if anything is wrong.

## Current subjects

- **English (Home Language)**: `english.js`. Built from the official NSC English HL Paper 1 papers and
  memos, November 2014 to May/June 2026. Sessions before November 2014 are excluded because they
  pre-date CAPS for Grade 12. Only self-contained language-structure questions are used, because
  comprehension and visual-literacy questions need a passage, picture or cartoon.

- **Physics (Physical Sciences Paper 1)**: `physics.js`. Built from the official NSC Physical Sciences
  P1 (Physics) papers and memos, November 2014 to May/June 2026. Question 1 multiple-choice items and
  written-answer questions (definitions, short conceptual items and calculations) are used only when
  they can be answered from their own text. Anything that needs a diagram, graph or circuit drawing
  is excluded, and so are questions where the memo's own answer looked wrong. Numeric answers were
  recomputed against the memo.

- **Chemistry (Physical Sciences Paper 2)**: `chemistry.js`. Built from the official NSC Physical Sciences
  P2 (Chemistry) papers and memos, November sessions 2014 to 2025 only (May/June and Feb/March sessions
  were not used). Question 1 multiple-choice items and written-answer questions are used only when
  they can be answered from their own text. Anything that needs a structural formula, graph or
  apparatus diagram is excluded. Numeric answers were recomputed against the memo.
