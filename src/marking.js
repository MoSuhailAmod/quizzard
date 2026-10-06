// Marking rules with no DOM access, so they can be unit-tested. Nothing is saved anywhere.

/**
 * Mark a finished quiz ({ subject, questions, answers }, as passed to the results screen).
 * An unanswered question counts as incorrect. The quiz itself is not modified.
 * @returns {{
 *   subject: string, total: number, correct: number, percentage: number,
 *   review: { question: string, options: string[], chosen: number|null, correctIndex: number, isCorrect: boolean }[]
 * }}
 */
export function markQuiz(quiz) {
  const review = quiz.questions.map((q, i) => {
    const chosen = quiz.answers[i] ?? null;
    return {
      question: q.question,
      options: q.options,
      chosen,
      correctIndex: q.correctAnswer,
      isCorrect: chosen === q.correctAnswer,
    };
  });
  const total = review.length;
  const correct = review.filter((r) => r.isCorrect).length;
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { subject: quiz.subject, total, correct, percentage, review };
}
