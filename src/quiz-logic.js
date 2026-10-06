// Quiz state and rules with no DOM access, so it can be unit-tested.
// The quiz lives in memory for one sitting only: nothing is saved anywhere.

export const QUIZ_LENGTH = 10;

/**
 * Pick up to `count` different questions for one subject, in random order.
 * Never modifies the question bank. If the subject has fewer questions than `count`, returns all of them.
 * @param {import("./data/questions/schema.js").Question[]} questions
 * @param {string} subject
 * @param {number} [count]
 * @param {() => number} [random] returns a number in [0, 1); injectable for tests
 */
export function pickQuestions(questions, subject, count = QUIZ_LENGTH, random = Math.random) {
  const pool = questions.filter((q) => q.subject === subject); // a copy, so the bank is untouched
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** Start a quiz over the given questions. `answers[i]` is the chosen option index (0-3) or null. */
export function createQuiz(subject, questions) {
  return { subject, questions, answers: questions.map(() => null), index: 0 };
}

export const currentQuestion = (quiz) => quiz.questions[quiz.index];
export const isFirst = (quiz) => quiz.index === 0;
export const isLast = (quiz) => quiz.index === quiz.questions.length - 1;
export const progressLabel = (quiz) => `Question ${quiz.index + 1} of ${quiz.questions.length}`;
export const unansweredCount = (quiz) => quiz.answers.filter((a) => a === null).length;

/** Record the learner's choice for the current question (replacing any earlier choice). */
export function selectAnswer(quiz, optionIndex) {
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= currentQuestion(quiz).options.length) {
    throw new RangeError(`Invalid option: ${optionIndex}`);
  }
  quiz.answers[quiz.index] = optionIndex;
}

export function goNext(quiz) {
  if (!isLast(quiz)) quiz.index += 1;
}

export function goPrevious(quiz) {
  if (!isFirst(quiz)) quiz.index -= 1;
}
