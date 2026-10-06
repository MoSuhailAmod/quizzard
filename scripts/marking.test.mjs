import { test } from "node:test";
import assert from "node:assert/strict";
import { markQuiz } from "../src/marking.js";
import { createQuiz, pickQuestions, selectAnswer, goNext } from "../src/quiz-logic.js";
import { questions as realBank } from "../src/data/questions/index.js";

// Structural fixtures only: not curriculum content. Question i has correct answer i % 4.
const make = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `t-${i}`, subject: "Test", question: `Question ${i}?`, options: ["w", "x", "y", "z"],
    correctAnswer: i % 4, origin: "past-paper", source: "x",
  }));
const quizWith = (n, answerFor) => {
  const quiz = createQuiz("Test", make(n));
  quiz.answers = quiz.questions.map((q, i) => answerFor(q, i));
  return quiz;
};

test("all correct is full marks", () => {
  const r = markQuiz(quizWith(10, (q) => q.correctAnswer));
  assert.equal(r.correct, 10);
  assert.equal(r.total, 10);
  assert.equal(r.percentage, 100);
  assert.ok(r.review.every((x) => x.isCorrect));
});

test("7 correct out of 10 is 70%", () => {
  const r = markQuiz(quizWith(10, (q, i) => (i < 7 ? q.correctAnswer : (q.correctAnswer + 1) % 4)));
  assert.equal(r.correct, 7);
  assert.equal(r.total, 10);
  assert.equal(r.percentage, 70);
});

test("wrong answers score nothing", () => {
  const r = markQuiz(quizWith(10, (q) => (q.correctAnswer + 1) % 4));
  assert.equal(r.correct, 0);
  assert.equal(r.percentage, 0);
});

test("an unanswered question is incorrect and keeps no chosen answer", () => {
  const r = markQuiz(quizWith(10, (q, i) => (i === 3 ? null : q.correctAnswer)));
  assert.equal(r.correct, 9);
  assert.equal(r.review[3].isCorrect, false);
  assert.equal(r.review[3].chosen, null);
  assert.equal(r.review[3].correctIndex, 3);
});

test("a correct answer of option A (index 0) counts, even though 0 is falsy", () => {
  const r = markQuiz(quizWith(1, () => 0)); // question 0 has correct answer 0
  assert.equal(r.correct, 1);
});

test("percentage is rounded to a whole number", () => {
  assert.equal(markQuiz(quizWith(3, (q, i) => (i === 0 ? q.correctAnswer : null))).percentage, 33);
  assert.equal(markQuiz(quizWith(3, (q, i) => (i < 2 ? q.correctAnswer : null))).percentage, 67);
});

test("fewer than 10 questions is marked out of the number asked", () => {
  const r = markQuiz(quizWith(4, (q, i) => (i < 3 ? q.correctAnswer : null)));
  assert.equal(`${r.correct} / ${r.total}`, "3 / 4");
  assert.equal(r.percentage, 75);
});

test("an empty quiz does not divide by zero", () => {
  const r = markQuiz({ subject: "Test", questions: [], answers: [] });
  assert.deepEqual([r.correct, r.total, r.percentage], [0, 0, 0]);
});

test("review keeps the quiz order and the question, options and correct answer", () => {
  const quiz = quizWith(5, (q) => q.correctAnswer);
  const r = markQuiz(quiz);
  assert.deepEqual(r.review.map((x) => x.question), quiz.questions.map((q) => q.question));
  assert.deepEqual(r.review[2].options, ["w", "x", "y", "z"]);
  assert.equal(r.review[2].correctIndex, 2);
});

test("marking does not change the quiz", () => {
  const quiz = quizWith(10, (q, i) => (i % 2 ? q.correctAnswer : null));
  const before = JSON.stringify(quiz);
  markQuiz(quiz);
  assert.equal(JSON.stringify(quiz), before);
});

test("end to end on the real English bank: answering with the stored answers gives 100%", () => {
  const quiz = createQuiz("English", pickQuestions(realBank, "English"));
  for (let i = 0; i < quiz.questions.length; i++) {
    selectAnswer(quiz, quiz.questions[i].correctAnswer);
    goNext(quiz);
  }
  const r = markQuiz(quiz);
  assert.deepEqual([r.correct, r.total, r.percentage], [10, 10, 100]);
});
