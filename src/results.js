// Placeholder for marking and results (next issue). It receives the finished quiz:
// { subject, questions, answers }, where answers[i] is the chosen option index (0-3) or null.
export function showResults(quiz, container, onExit) {
  const heading = Object.assign(document.createElement("h2"), { tabIndex: -1, textContent: "Quiz submitted" });
  const message = Object.assign(document.createElement("p"), { textContent: "Marking and results are coming soon." });
  const back = Object.assign(document.createElement("button"), { type: "button", textContent: "Choose another subject", onclick: onExit });
  container.replaceChildren(heading, message, back);
  heading.focus();
}
