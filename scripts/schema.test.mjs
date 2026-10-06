import { test } from "node:test";
import assert from "node:assert/strict";
import { validateQuestions, ORIGINS } from "../src/data/questions/schema.js";
import { getQuestionsBySubject, getSubjects } from "../src/data/questions/index.js";

// Structural test fixtures only. These are NOT real curriculum content and never go in the question bank.
const valid = (overrides = {}) => ({
  id: "t-001",
  subject: "Test Subject",
  question: "Test question text?",
  options: ["A", "B", "C", "D"],
  correctAnswer: 1,
  origin: "past-paper",
  source: "Test source",
  ...overrides,
});

const problemsFor = (overrides) => validateQuestions([valid(overrides)]);

test("a valid question and an empty bank both pass", () => {
  assert.deepEqual(validateQuestions([valid()]), []);
  assert.deepEqual(validateQuestions([]), []);
});

test("all three origins are accepted", () => {
  for (const origin of ORIGINS) assert.deepEqual(problemsFor({ origin }), []);
});

test("rejects a bank that is not an array", () => {
  assert.equal(validateQuestions({}).length, 1);
});

test("rejects missing or empty text fields", () => {
  for (const field of ["id", "subject", "question", "source"]) {
    assert.equal(problemsFor({ [field]: "" }).length, 1, field);
    assert.equal(problemsFor({ [field]: undefined }).length, 1, field);
  }
});

test("requires exactly four non-empty, distinct options", () => {
  assert.equal(problemsFor({ options: ["A", "B", "C"] }).length, 1);
  assert.equal(problemsFor({ options: ["A", "B", "C", "D", "E"] }).length, 1);
  assert.equal(problemsFor({ options: ["A", "B", "C", ""] }).length, 1);
  assert.equal(problemsFor({ options: ["A", "B", "C", "  A "] }).length, 1);
  // Capitalisation and punctuation can be the whole point of a language question, so they count as different.
  assert.deepEqual(problemsFor({ options: ["She left; she won.", "She left; She won.", "She left, she won.", "She left. she won."] }), []);
  assert.equal(problemsFor({ options: "ABCD" }).length, 1);
});

test("correctAnswer must be an integer from 0 to 3", () => {
  for (const bad of [-1, 4, 1.5, "1", null, undefined]) {
    assert.equal(problemsFor({ correctAnswer: bad }).length, 1, String(bad));
  }
  for (const good of [0, 1, 2, 3]) assert.deepEqual(problemsFor({ correctAnswer: good }), []);
});

test("origin must be one of the allowed values", () => {
  assert.equal(problemsFor({ origin: "invented" }).length, 1);
  assert.equal(problemsFor({ origin: undefined }).length, 1);
});

test("rejects unknown fields such as explanation", () => {
  const errors = problemsFor({ explanation: "because" });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /explanation/);
});

test("ids must be unique", () => {
  const errors = validateQuestions([valid(), valid({ question: "Another question?" })]);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /not unique/);
});

test("duplicate questions in the same subject are rejected, other subjects are fine", () => {
  const same = validateQuestions([valid(), valid({ id: "t-002", question: "  test QUESTION text? " })]);
  assert.equal(same.length, 1);
  assert.match(same[0], /duplicate/);

  const other = validateQuestions([valid(), valid({ id: "t-002", subject: "Other" })]);
  assert.deepEqual(other, []);
});

test("non-object entries are reported", () => {
  assert.equal(validateQuestions([null]).length, 1);
  assert.equal(validateQuestions(["text"]).length, 1);
});

test("questions can be filtered by subject", () => {
  const list = [valid(), valid({ id: "t-002", subject: "Other", question: "Q2?" }), valid({ id: "t-003", question: "Q3?" })];
  assert.deepEqual(getSubjects(list), ["Test Subject", "Other"]);
  assert.deepEqual(getQuestionsBySubject("Test Subject", list).map((q) => q.id), ["t-001", "t-003"]);
  assert.deepEqual(getQuestionsBySubject("Missing", list), []);
});
