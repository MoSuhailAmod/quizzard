// Placeholder for the quiz flow (next issue). It receives the subject the learner chose.
//
// startQuiz(subject, container, onExit)
//   subject    the chosen subject name, as it appears in the question bank
//   container  the element to render the quiz into
//   onExit     call to return to subject selection
export function startQuiz(subject, container, onExit) {
  const heading = document.createElement("h2");
  heading.tabIndex = -1;
  heading.textContent = subject;

  const message = document.createElement("p");
  message.textContent = "The quiz for this subject is coming soon.";

  const back = document.createElement("button");
  back.type = "button";
  back.textContent = "Choose another subject";
  back.addEventListener("click", onExit);

  container.replaceChildren(heading, message, back);
  heading.focus();
}
