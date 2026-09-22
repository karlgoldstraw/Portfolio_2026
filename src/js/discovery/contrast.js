// Exercise 1: low contrast text.
// The slider mixes the text colour between a very pale grey and near black,
// and the live ratio is worked out with the WCAG formula in common.js.
(function () {
  "use strict";

  var demo = document.getElementById("contrast-demo");
  if (!demo) return;

  var d = window.discovery;
  var BACKGROUND = "#ffffff";
  var PALEST = "#d2d2d2";
  var DARKEST = "#0b0c0c";
  var START = 6;

  var range = document.getElementById("contrast-range");
  var ratioEl = document.getElementById("contrast-ratio");
  var verdictEl = document.getElementById("contrast-verdict");
  var codeEl = document.getElementById("contrast-code");
  var form = document.getElementById("contrast-form");
  var answer = document.getElementById("contrast-answer");
  var result = document.getElementById("contrast-result");

  // Characters that are hard to tell apart when they are hard to see anyway
  // (0/O, 1/I/l, 5/S, 8/B) are left out, so the exercise tests contrast only.
  var ALPHABET = "ACDEFHJKMNPRTUVWXY234679";
  var code = "";

  function newCode() {
    var next = "";
    for (var i = 0; i < 6; i++) {
      next += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    code = next;
    codeEl.textContent = code;
  }

  function ratioFor(value) {
    var colour = d.mix(PALEST, DARKEST, value / 100);
    return {
      colour: colour,
      ratio: d.contrastRatio(d.hexToRgb(colour), d.hexToRgb(BACKGROUND)),
    };
  }

  function format(ratio) {
    return ratio.toFixed(1) + ":1";
  }

  function verdictFor(ratio) {
    if (ratio >= 7) return "Passes AA and AAA for body text.";
    if (ratio >= 4.5) return "Passes AA for body text. AAA needs 7:1.";
    if (ratio >= 3) return "Fails AA for body text. Large text only.";
    return "Fails AA. Body text needs 4.5:1.";
  }

  function apply(value) {
    var state = ratioFor(value);
    demo.style.setProperty("--demo-contrast-ink", state.colour);
    ratioEl.textContent = format(state.ratio);
    verdictEl.textContent = verdictFor(state.ratio);
    // The number on its own means nothing out of context, so screen reader
    // users get the verdict read with it.
    range.setAttribute(
      "aria-valuetext",
      format(state.ratio) + ", " + verdictFor(state.ratio)
    );
  }

  // The slider step nearest to 4.5:1, found by walking up from the bottom.
  function firstPassingValue() {
    for (var i = 0; i <= 100; i++) {
      if (ratioFor(i).ratio >= 4.5) return i;
    }
    return 100;
  }

  range.addEventListener("input", function () {
    apply(Number(range.value));
  });

  document.getElementById("contrast-aa").addEventListener("click", function () {
    range.value = String(firstPassingValue());
    apply(Number(range.value));
  });

  document.getElementById("contrast-reset").addEventListener("click", function () {
    range.value = String(START);
    apply(START);
  });

  document.getElementById("contrast-new").addEventListener("click", function () {
    newCode();
    answer.value = "";
    d.report(result, "<p>New reference. Have another go.</p>", null);
    answer.focus();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var given = answer.value.replace(/[^a-z0-9]/gi, "").toUpperCase();
    var current = Number(range.value);
    var ratio = ratioFor(current).ratio;

    if (!given) {
      d.report(result, "<p>Type the reference you can see, then check it.</p>", null);
      return;
    }

    if (given === code) {
      d.report(
        result,
        "<p><strong>Correct.</strong> You read it at " +
          format(ratio) +
          ". " +
          verdictFor(ratio) +
          " How much of that was reading, and how much was guessing?</p>",
        "pass"
      );
    } else {
      d.report(
        result,
        "<p><strong>Not quite.</strong> You typed " +
          given +
          ". The reference is " +
          code +
          ", shown at " +
          format(ratio) +
          ". " +
          verdictFor(ratio) +
          "</p>",
        "fail"
      );
    }
  });

  newCode();
  range.value = String(START);
  apply(START);
})();
