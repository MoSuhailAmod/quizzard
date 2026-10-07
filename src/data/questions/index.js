// The question bank. One file per subject lives in this folder.
//
// To add a subject: create <subject>.js (copy an existing one), then add it to the two lists below.
// `npm run validate` fails if a subject file in this folder is missing from the `subjectFiles` list.

import english from "./english.js";
import physics from "./physics.js";

export const subjectFiles = ["english.js", "physics.js"];

/** @type {import("./schema.js").Question[]} */
export const questions = [...english, ...physics];

/** Distinct subjects that have at least one question, in the order they first appear. */
export function getSubjects(list = questions) {
  return [...new Set(list.map((q) => q.subject))];
}

/** All questions for one subject. */
export function getQuestionsBySubject(subject, list = questions) {
  return list.filter((q) => q.subject === subject);
}
