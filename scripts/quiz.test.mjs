import { test } from "node:test";
import assert from "node:assert/strict";
import {
  QUIZ_LENGTH, createQuiz, currentQuestion, goNext, goPrevious, isFirst, isLast,
  pickQuestions, progressLabel, selectAnswer, unansweredCount,
} from "../src/quiz-logic.js";
import { questions as realBank } from "../src/data/questions/index.js";

// Structural fixtures only: not curriculum content.
const make = (subject, n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `${subject}-${i}`, subject, question: `Q${i}?`, options: ["a", "b", "c", "d"],
    correctAnswer: 0, origin: "past-paper", source: "x",
  }));
const bank = [...make("English", 25), ...make("Other", 15)];

test("picks 10 different questions, all from the chosen subject", () => {
  const picked = pickQuestions(bank, "English");
  assert.equal(picked.length, QUIZ_LENGTH);
  assert.equal(new Set(picked.map((q) => q.id)).size, QUIZ_LENGTH);
  assert.ok(picked.every((q) => q.subject === "English"));
});

test("is random: different random sources give different quizzes", () => {
  const a = pickQuestions(bank, "English", 10, () => 0).map((q) => q.id).join();
  const b = pickQuestions(bank, "English", 10, () => 0.99).map((q) => q.id).join();
  assert.notEqual(a, b);
  // real randomness over many runs should not always give the same first question
  const firsts = new Set(Array.from({ length: 50 }, () => pickQuestions(bank, "English")[0].id));
  assert.ok(firsts.size > 1);
});

test("every question in the subject can be picked (the shuffle is not biased out of the pool)", () => {
  const seen = new Set();
  for (let i = 0; i < 400; i++) pickQuestions(bank, "English").forEach((q) => seen.add(q.id));
  assert.equal(seen.size, 25);
});

test("does not change the question bank or the options", () => {
  const before = JSON.stringify(bank);
  pickQuestions(bank, "English");
  assert.equal(JSON.stringify(bank), before);
});

test("fewer than 10 questions: uses all of them without crashing", () => {
  const small = make("Tiny", 4);
  assert.equal(pickQuestions(small, "Tiny").length, 4);
  assert.deepEqual(pickQuestions(small, "Missing"), []);
  const quiz = createQuiz("Tiny", pickQuestions(small, "Tiny"));
  assert.equal(progressLabel(quiz), "Question 1 of 4");
});

test("works on the real English question bank", () => {
  const picked = pickQuestions(realBank, "English");
  assert.equal(picked.length, QUIZ_LENGTH);
  assert.equal(new Set(picked.map((q) => q.id)).size, QUIZ_LENGTH);
});

test("progress and navigation stay inside the quiz", () => {
  const quiz = createQuiz("English", pickQuestions(bank, "English"));
  assert.equal(progressLabel(quiz), "Question 1 of 10");
  assert.ok(isFirst(quiz));
  goPrevious(quiz);
  assert.equal(quiz.index, 0);
  for (let i = 0; i < 20; i++) goNext(quiz);
  assert.equal(quiz.index, 9);
  assert.ok(isLast(quiz));
  assert.equal(progressLabel(quiz), "Question 10 of 10");
  goPrevious(quiz);
  assert.equal(progressLabel(quiz), "Question 9 of 10");
});

test("answers are one per question, can be changed, and are kept while navigating", () => {
  const quiz = createQuiz("English", pickQuestions(bank, "English"));
  assert.equal(unansweredCount(quiz), 10);
  selectAnswer(quiz, 2);
  selectAnswer(quiz, 3); // changing the answer replaces it
  goNext(quiz);
  selectAnswer(quiz, 1);
  goPrevious(quiz);
  assert.equal(quiz.answers[0], 3);
  assert.equal(quiz.answers[1], 1);
  assert.equal(unansweredCount(quiz), 8);
  assert.equal(currentQuestion(quiz), quiz.questions[0]);
});

test("rejects an option that does not exist", () => {
  const quiz = createQuiz("English", pickQuestions(bank, "English"));
  for (const bad of [-1, 4, 1.5, "1", null]) assert.throws(() => selectAnswer(quiz, bad), RangeError);
});
