import { test } from "node:test";
import assert from "node:assert/strict";
import { questions, getSubjects, getQuestionsBySubject } from "../src/data/questions/index.js";

// Guards the content rules that validation alone cannot express.
// Each subject must cite the official DBE NSC paper a question comes from, in the CAPS era (2014 onwards).
const subjects = {
  English: /^NSC( |\/SC )(November|May\/June|Feb\/March) 20\d\d, English HL P1, Q\d+(\.\d+)*$/,
  Physics: /^NSC( |\/SC )(November|May\/June|Feb\/March) 20\d\d, Physical Sciences P1 \(Physics\), Q\d+(\.\d+)*( and \d+(\.\d+)*)?$/,
};

test("every subject in the bank has a sourcing rule in this test", () => {
  for (const subject of getSubjects()) assert.ok(subjects[subject], `add a source pattern for ${subject}`);
});

for (const [subject, pattern] of Object.entries(subjects)) {
  test(`${subject}: enough questions for a 10-question quiz`, () => {
    assert.ok(getQuestionsBySubject(subject).length >= 10);
  });

  test(`${subject}: every question cites an official CAPS-era NSC paper question`, () => {
    for (const q of getQuestionsBySubject(subject)) {
      assert.match(q.source, pattern, `${q.id}: ${q.source}`);
      const year = Number(q.source.match(/(20\d\d)/)[1]);
      assert.ok(year >= 2014, `${q.id}: CAPS Grade 12 was first examined in 2014`);
    }
  });

  test(`${subject}: only past-paper or adapted (nothing generated without a CAPS reference)`, () => {
    for (const q of getQuestionsBySubject(subject)) assert.ok(["past-paper", "adapted"].includes(q.origin), `${q.id}: ${q.origin}`);
  });

  test(`${subject}: the correct answer is spread across all four positions`, () => {
    const positions = getQuestionsBySubject(subject).map((q) => q.correctAnswer);
    for (let i = 0; i < 4; i++) assert.ok(positions.includes(i), `${subject}: nothing has correct answer ${i}`);
  });
}
