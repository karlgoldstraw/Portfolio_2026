// Exercise 3: keyboard only.
// The broken version works perfectly with a mouse and barely exists without
// one. The counter reports the gap rather than asking people to take it on
// trust.
(function () {
  "use strict";

  var activity = document.getElementById("kb-broken");
  if (!activity) return;

  var d = window.discovery;
  var result = document.getElementById("kb-result");
  var focusReadout = document.getElementById("kb-focus");
  var broken = document.getElementById("kb-broken");
  var fixed = document.getElementById("kb-fixed");

  var chosen = { room: null, time: null, video: false };

  function describeChoice(target) {
    target.textContent =
      "Selected: " +
      (chosen.room || "no room") +
      ", " +
      (chosen.time || "no time") +
      ", video kit " +
      (chosen.video ? "on" : "off") +
      ".";
  }

  // ---------- The version with the barrier ----------

  var brokenState = document.getElementById("kb-broken-state");

  broken.querySelectorAll(".kb-card").forEach(function (card) {
    card.addEventListener("click", function () {
      broken.querySelectorAll(".kb-card").forEach(function (other) {
        other.classList.remove("is-selected");
      });
      card.classList.add("is-selected");
      chosen.room = card.getAttribute("data-room");
      describeChoice(brokenState);
    });
  });

  var select = broken.querySelector(".kb-select");
  var options = broken.querySelector(".kb-options");

  select.addEventListener("click", function () {
    options.hidden = !options.hidden;
  });

  broken.querySelectorAll(".kb-option").forEach(function (option) {
    option.addEventListener("click", function () {
      chosen.time = option.getAttribute("data-time");
      broken.querySelector(".kb-select__value").textContent = chosen.time;
      options.hidden = true;
      describeChoice(brokenState);
    });
  });

  var check = broken.querySelector(".kb-check");
  check.addEventListener("click", function () {
    chosen.video = !chosen.video;
    check.classList.toggle("is-checked", chosen.video);
    describeChoice(brokenState);
  });

  document.getElementById("kb-broken-submit").addEventListener("click", function () {
    if (!chosen.room || !chosen.time) {
      d.report(
        result,
        "<p><strong>Nothing booked.</strong> You need a room and a time. Both of those controls are <code>div</code> elements, so a keyboard cannot reach them at all.</p>",
        "fail"
      );
      return;
    }
    d.report(
      result,
      "<p><strong>Booked:</strong> " +
        chosen.room +
        " at " +
        chosen.time +
        (chosen.video ? ", with the video kit" : "") +
        ". Which of those choices did you make with the keyboard?</p>",
      "pass"
    );
  });

  // ---------- The accessible version ----------

  var fixedState = document.getElementById("kb-fixed-state");
  var fixedForm = document.getElementById("kb-fixed-form");

  fixedForm.addEventListener("change", function () {
    var room = fixedForm.querySelector('input[name="kb-room"]:checked');
    chosen.room = room ? room.value : null;
    chosen.time = document.getElementById("kb-time").value || null;
    chosen.video = document.getElementById("kb-video").checked;
    describeChoice(fixedState);
  });

  fixedForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!chosen.room || !chosen.time) {
      d.report(result, "<p>Choose a room and a time, then book it.</p>", null);
      return;
    }
    d.report(
      result,
      "<p><strong>Booked:</strong> " +
        chosen.room +
        " at " +
        chosen.time +
        (chosen.video ? ", with the video kit" : "") +
        ". Every step of that was reachable with Tab, the arrow keys and the space bar.</p>",
      "pass"
    );
  });

  // ---------- Tools ----------

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function currentDemo() {
    return broken.closest("[data-mode]").hidden ? fixed : broken;
  }

  document.getElementById("kb-count").addEventListener("click", function () {
    var demo = currentDemo();
    var intended = Array.prototype.slice.call(demo.querySelectorAll("[data-control]"));
    var reachable = intended.filter(function (control) {
      return control.matches(FOCUSABLE);
    });

    var missing = intended
      .filter(function (control) {
        return !control.matches(FOCUSABLE);
      })
      .map(function (control) {
        return control.getAttribute("data-control");
      });

    var html =
      "<p><strong>" +
      reachable.length +
      " of " +
      intended.length +
      " controls can be reached with a keyboard.</strong></p>";

    if (missing.length) {
      html += "<p>Out of reach: " + missing.join(", ") + ".</p>";
    } else {
      html += "<p>Nothing is out of reach. Every control is a real control.</p>";
    }

    d.report(result, html, missing.length ? "fail" : "pass");
  });

  // A plain readout of where focus is, for the facilitator's screen. It is
  // not a live region: screen reader users are already told where focus is,
  // and repeating it would talk over them.
  document.addEventListener("focusin", function (event) {
    var demo = event.target.closest(".demo--keyboard");
    if (!demo) return;
    var label =
      event.target.getAttribute("data-control") ||
      (event.target.labels && event.target.labels[0]
        ? event.target.labels[0].textContent.trim()
        : event.target.textContent.trim()) ||
      event.target.tagName.toLowerCase();
    focusReadout.innerHTML =
      "Focus is on: <strong>" + label + "</strong> (" + event.target.tagName.toLowerCase() + ")";
  });

  var container = broken.closest(".activity");
  container.addEventListener("modechange", function () {
    chosen = { room: null, time: null, video: false };
    d.report(result, "", null);
    focusReadout.innerHTML = "Focus is on: <strong>nothing in the booking form yet</strong>";
  });
})();
