// The quiz screen: one question at a time, four options, no feedback until the quiz is submitted.
import { questions as bank } from "./data/questions/index.js";
import {
  createQuiz, currentQuestion, goNext, goPrevious, isFirst, isLast,
  pickQuestions, progressLabel, selectAnswer, unansweredCount,
} from "./quiz-logic.js";

const LETTERS = ["A", "B", "C", "D"];

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

/**
 * startQuiz(subject, container, { onExit, onSubmit })
 *   subject    the chosen subject name, as it appears in the question bank
 *   container  the element to render the quiz into
 *   onExit     return to subject selection
 *   onSubmit   called with the finished quiz ({ subject, questions, answers }) when the learner submits
 */
export function startQuiz(subject, container, { onExit, onSubmit }) {
  const quiz = createQuiz(subject, pickQuestions(bank, subject));

  if (quiz.questions.length === 0) {
    container.replaceChildren(
      el("h2", { textContent: subject }),
      el("p", { textContent: "There are no questions for this subject yet." }),
      el("button", { type: "button", textContent: "Choose another subject", onclick: onExit }),
    );
    return;
  }

  function render() {
    const question = currentQuestion(quiz);
    const chosen = quiz.answers[quiz.index];

    const options = question.options.map((text, i) => {
      const input = el("input", { type: "radio", name: "answer", value: String(i), checked: chosen === i });
      // Update in place (no re-render) so keyboard focus stays on the option just chosen.
      input.addEventListener("change", () => { selectAnswer(quiz, i); updateNote(); });
      return el("label", { className: "option" }, input, el("span", { className: "letter", textContent: LETTERS[i] }), el("span", { textContent: text }));
    });

    const nav = el("div", { className: "nav" },
      el("button", { type: "button", textContent: "Previous", disabled: isFirst(quiz), onclick: () => { goPrevious(quiz); render(); } }),
    );
    if (isLast(quiz)) {
      nav.append(el("button", { type: "button", className: "primary", textContent: "Submit quiz", onclick: () => onSubmit(quiz) }));
    } else {
      nav.append(el("button", { type: "button", className: "primary", textContent: "Next", onclick: () => { goNext(quiz); render(); } }));
    }

    const heading = el("h2", { className: "progress", tabIndex: -1, textContent: progressLabel(quiz) });
    const children = [
      el("p", { className: "quiz-subject", textContent: subject }),
      heading,
      el("fieldset", { className: "question" }, el("legend", { textContent: question.question }), ...options),
    ];
    const note = el("p", { className: "unanswered" });
    function updateNote() {
      const missing = unansweredCount(quiz);
      note.textContent = missing > 0 ? `${missing} question${missing === 1 ? "" : "s"} not answered yet.` : "";
    }
    if (isLast(quiz)) { updateNote(); children.push(note); }
    children.push(nav);

    container.replaceChildren(...children);
    heading.focus();
  }

  render();
}
