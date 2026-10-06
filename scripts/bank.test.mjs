import { test } from "node:test";
import assert from "node:assert/strict";
import { questions, getSubjects, getQuestionsBySubject } from "../src/data/questions/index.js";

// Guards the content rules that validation alone cannot express.
const paperSource = /^NSC( |\/SC )(November|May\/June|Feb\/March) (20\d\d), English HL P1, Q\d+(\.\d+)*$/;

test("the bank has English questions, and enough for a 10-question quiz", () => {
  assert.ok(getSubjects().includes("English"));
  assert.ok(getQuestionsBySubject("English").length >= 10);
});

test("English questions cite an official NSC English HL Paper 1 question from the CAPS era", () => {
  for (const q of getQuestionsBySubject("English")) {
    assert.match(q.source, paperSource, `${q.id}: ${q.source}`);
    const year = Number(q.source.match(/(20\d\d)/)[1]);
    assert.ok(year >= 2014, `${q.id}: CAPS Grade 12 was first examined in 2014`);
  }
});

test("English questions are only past-paper or adapted (nothing generated without a CAPS reference)", () => {
  for (const q of getQuestionsBySubject("English")) {
    assert.ok(["past-paper", "adapted"].includes(q.origin), `${q.id}: ${q.origin}`);
  }
});

test("the correct answer is spread across all four positions", () => {
  const positions = new Set(questions.map((q) => q.correctAnswer));
  assert.equal(positions.size, 4);
});
