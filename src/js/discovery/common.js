// Shared behaviour for the accessibility discovery exercises.
// Exposed on window.discovery so each exercise script can use it.
(function () {
  "use strict";

  // Swap an activity between its broken and fixed versions.
  // Markup: a fieldset.mode-toggle with radios valued "broken" and "fixed",
  // inside an .activity that holds elements marked data-mode="broken|fixed".
  function setUpModeToggles() {
    var toggles = document.querySelectorAll(".mode-toggle[data-mode-toggle]");

    Array.prototype.forEach.call(toggles, function (toggle) {
      var activity = toggle.closest(".activity");
      if (!activity) return;

      var panes = activity.querySelectorAll("[data-mode]");
      var status = activity.querySelector("[data-mode-status]");

      function apply(mode, announce) {
        Array.prototype.forEach.call(panes, function (pane) {
          pane.hidden = pane.getAttribute("data-mode") !== mode;
        });
        activity.setAttribute("data-current-mode", mode);
        if (announce && status) {
          status.textContent =
            mode === "fixed"
              ? "Showing the accessible version."
              : "Showing the version with the barrier.";
        }
        activity.dispatchEvent(
          new CustomEvent("modechange", { detail: { mode: mode } })
        );
      }

      toggle.addEventListener("change", function (event) {
        if (event.target.name !== toggle.getAttribute("data-mode-toggle")) return;
        apply(event.target.value, true);
      });

      var checked = toggle.querySelector("input:checked");
      apply(checked ? checked.value : "broken", false);
    });
  }

  // Write a result into a status region, with a pass or fail style.
  // The region is aria-live, so the text is announced as well as shown.
  function report(region, html, outcome) {
    if (!region) return;
    region.classList.remove("result--pass", "result--fail");
    if (outcome === "pass") region.classList.add("result--pass");
    if (outcome === "fail") region.classList.add("result--fail");
    region.innerHTML = html;
  }

  // Relative luminance and contrast ratio, per WCAG 2.2.
  function channel(value) {
    var c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminance(rgb) {
    return (
      0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
    );
  }

  function contrastRatio(foreground, background) {
    var a = luminance(foreground);
    var b = luminance(background);
    var lighter = Math.max(a, b);
    var darker = Math.min(a, b);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function hexToRgb(hex) {
    var value = hex.replace("#", "");
    if (value.length === 3) {
      value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
    }
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16),
    ];
  }

  function rgbToHex(rgb) {
    return (
      "#" +
      rgb
        .map(function (n) {
          var hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  // Mix two colours, amount 0 = first colour, 1 = second colour.
  function mix(fromHex, toHex, amount) {
    var from = hexToRgb(fromHex);
    var to = hexToRgb(toHex);
    return rgbToHex([
      from[0] + (to[0] - from[0]) * amount,
      from[1] + (to[1] - from[1]) * amount,
      from[2] + (to[2] - from[2]) * amount,
    ]);
  }

  window.discovery = {
    report: report,
    contrastRatio: contrastRatio,
    hexToRgb: hexToRgb,
    rgbToHex: rgbToHex,
    mix: mix,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setUpModeToggles);
  } else {
    setUpModeToggles();
  }
})();
