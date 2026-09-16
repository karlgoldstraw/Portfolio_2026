// Dark mode control: On / Off / Auto.
// "Auto" stores nothing and lets prefers-color-scheme decide.
(function () {
  var root = document.documentElement;
  var group = document.getElementById("theme-toggle");
  if (!group) return;

  var stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch (e) {}

  var current = stored === "dark" || stored === "light" ? stored : "auto";
  var selected = group.querySelector('input[value="' + current + '"]');
  if (selected) selected.checked = true;

  // Only offer the control to readers who can actually use it
  group.hidden = false;

  group.addEventListener("change", function (event) {
    var choice = event.target.value;

    if (choice === "auto") {
      delete root.dataset.theme;
      try {
        localStorage.removeItem("theme");
      } catch (e) {}
      return;
    }

    root.dataset.theme = choice;
    try {
      localStorage.setItem("theme", choice);
    } catch (e) {}
  });
})();
