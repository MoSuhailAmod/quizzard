// Question schema and validation. Pure functions with no Node or browser APIs,
// so the same code runs in the build/validation script and in tests.

/** Where a question came from. See README.md in this folder for the rules for each. */
export const ORIGINS = ["past-paper", "adapted", "generated"];

const FIELDS = ["id", "subject", "question", "options", "correctAnswer", "origin", "source"];

/**
 * @typedef {Object} Question
 * @property {string} id              Unique, e.g. "eng-001".
 * @property {string} subject         e.g. "English".
 * @property {string} question        Self-contained question text.
 * @property {string[]} options       Exactly four options, in the order they are shown.
 * @property {number} correctAnswer   Index (0-3) of the one correct option.
 * @property {"past-paper"|"adapted"|"generated"} origin
 * @property {string} source          Paper reference (past-paper, adapted) or CAPS document and topic (generated).
 */

const isText = (value) => typeof value === "string" && value.trim() !== "";
const normalise = (text) => text.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Returns a list of human-readable problems. An empty list means the data is valid.
 * @param {unknown[]} questions
 * @returns {string[]}
 */
export function validateQuestions(questions) {
  if (!Array.isArray(questions)) return ["Question bank must be an array."];

  const errors = [];
  const ids = new Set();
  const seenQuestions = new Set();

  questions.forEach((q, index) => {
    const label = isText(q?.id) ? `Question "${q.id}"` : `Question at position ${index + 1}`;
    const problem = (message) => errors.push(`${label}: ${message}`);

    if (q === null || typeof q !== "object" || Array.isArray(q)) {
      problem("must be an object.");
      return;
    }

    for (const key of Object.keys(q)) {
      if (!FIELDS.includes(key)) problem(`unknown field "${key}" (allowed: ${FIELDS.join(", ")}).`);
    }

    if (!isText(q.id)) problem("id is required.");
    else if (ids.has(q.id)) problem("id is not unique.");
    else ids.add(q.id);

    if (!isText(q.subject)) problem("subject is required.");
    if (!isText(q.question)) problem("question text is required.");

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      problem("options must be an array of exactly 4 items.");
    } else if (!q.options.every(isText)) {
      problem("every option must be non-empty text.");
    } else if (new Set(q.options.map(normalise)).size !== 4) {
      problem("options must all be different.");
    }

    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
      problem("correctAnswer must be an integer from 0 to 3.");
    }

    if (!ORIGINS.includes(q.origin)) problem(`origin must be one of: ${ORIGINS.join(", ")}.`);
    if (!isText(q.source)) problem("source is required.");

    if (isText(q.subject) && isText(q.question)) {
      const key = `${normalise(q.subject)}|${normalise(q.question)}`;
      if (seenQuestions.has(key)) problem("duplicate of another question in the same subject.");
      else seenQuestions.add(key);
    }
  });

  return errors;
}
