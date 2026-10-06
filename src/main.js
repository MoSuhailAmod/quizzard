// Minimal screen switching. Subject selection and the quiz itself arrive in later issues.
const home = document.getElementById("home");
const practise = document.getElementById("practise");

function show(screen) {
  home.hidden = screen !== home;
  practise.hidden = screen !== practise;
}

document.getElementById("start").addEventListener("click", () => show(practise));
document.getElementById("back").addEventListener("click", () => show(home));
