// The results screen: score, percentage, and a review of every question.
import { markQuiz } from "./marking.js";

const LETTERS = ["A", "B", "C", "D"];

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

const optionText = (r, i) => `${LETTERS[i]}. ${r.options[i]}`;

/**
 * showResults(quiz, container, onExit)
 *   quiz       the finished quiz: { subject, questions, answers }
 *   container  the element to render into
 *   onExit     return to subject selection to start another quiz
 */
export function showResults(quiz, container, onExit) {
  const result = markQuiz(quiz);
  const exitButton = (primary) =>
    el("button", { type: "button", className: primary ? "primary" : "", textContent: "Choose another subject", onclick: onExit });

  const heading = el("h2", { tabIndex: -1, textContent: "Your result" });
  const summary = el("div", { className: "score" },
    el("p", { className: "quiz-subject", textContent: result.subject }),
    el("p", { className: "score-main", textContent: `${result.correct} / ${result.total}` }),
    el("p", { className: "score-percent", textContent: `${result.percentage}%` }),
  );

  const items = result.review.map((r, i) => {
    const status = el("p", { className: `status ${r.isCorrect ? "right" : "wrong"}`, textContent: r.isCorrect ? "✓ Correct" : "✗ Incorrect" });
    const lines = [
      el("p", { className: "review-question", textContent: `${i + 1}. ${r.question}` }),
      el("p", {}, el("strong", { textContent: "Your answer: " }), r.chosen === null ? "Not answered" : optionText(r, r.chosen)),
      el("p", {}, el("strong", { textContent: "Correct answer: " }), optionText(r, r.correctIndex)),
    ];
    return el("li", { className: "review-item" }, status, ...lines);
  });

  container.replaceChildren(
    heading, summary, exitButton(true),
    el("h3", { textContent: "Review" }),
    el("ol", { className: "review" }, ...items),
    exitButton(false),
  );
  window.scrollTo(0, 0);
  heading.focus();
}
