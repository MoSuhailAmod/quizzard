// Screen switching and subject selection. The quiz itself lives in quiz.js.
import { getSubjects } from "./data/questions/index.js";
import { startQuiz } from "./quiz.js";
import { showResults } from "./results.js";

const screens = {
  home: document.getElementById("home"),
  subjects: document.getElementById("subjects-screen"),
  quiz: document.getElementById("quiz"),
};

function show(name) {
  for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
  screens[name].querySelector("h1, h2")?.focus();
}

function showSubjects() {
  const subjects = getSubjects();
  const list = document.getElementById("subjects");
  list.replaceChildren(
    ...subjects.map((subject) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "subject";
      button.textContent = subject;
      button.addEventListener("click", () => {
        show("quiz");
        startQuiz(subject, screens.quiz, {
          onExit: showSubjects,
          onSubmit: (quiz) => showResults(quiz, screens.quiz, showSubjects),
        });
      });
      return button;
    }),
  );
  document.getElementById("subjects-empty").hidden = subjects.length > 0;
  show("subjects");
}

document.getElementById("start").addEventListener("click", showSubjects);
document.getElementById("back").addEventListener("click", () => show("home"));
