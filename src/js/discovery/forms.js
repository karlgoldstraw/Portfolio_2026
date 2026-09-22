// Exercise 2: form controls.
// Both forms are checked against the same rules. The difference is entirely
// in how they label the fields and how they report what went wrong.
(function () {
  "use strict";

  var brokenForm = document.getElementById("broken-form");
  var fixedForm = document.getElementById("fixed-form");
  if (!brokenForm || !fixedForm) return;

  var d = window.discovery;
  var result = document.getElementById("form-result");
  var attempts = { broken: 0, fixed: 0 };

  function value(id) {
    return document.getElementById(id).value.trim();
  }

  var POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

  function checkDate(day, month, year) {
    var d1 = Number(day);
    var m = Number(month);
    var y = Number(year);
    if (!day || !month || !year) return "Enter your date of birth.";
    if (!/^\d{1,2}$/.test(day) || d1 < 1 || d1 > 31) return "Day must be a number between 1 and 31.";
    if (!/^\d{1,2}$/.test(month) || m < 1 || m > 12) return "Month must be a number between 1 and 12.";
    if (!/^\d{4}$/.test(year) || y < 1900 || y > 2026) return "Year must be four digits, for example 1962.";
    return null;
  }

  // ---------- The version with the barrier ----------

  // Rules nothing on screen ever mentions: two digit day and month, and a
  // postcode with no space in it.
  function validateBroken() {
    var bad = [];
    if (!value("bf-name")) bad.push("bf-name");
    if (!/^\d{2}$/.test(value("bf-day"))) bad.push("bf-day");
    if (!/^\d{2}$/.test(value("bf-month"))) bad.push("bf-month");
    if (!/^\d{4}$/.test(value("bf-year"))) bad.push("bf-year");
    if (!value("bf-address")) bad.push("bf-address");
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/i.test(value("bf-postcode"))) bad.push("bf-postcode");
    return bad;
  }

  brokenForm.addEventListener("submit", function (event) {
    event.preventDefault();
    attempts.broken += 1;
    document.getElementById("broken-attempts").textContent = String(attempts.broken);

    var bad = validateBroken();
    var fields = brokenForm.querySelectorAll("input");
    Array.prototype.forEach.call(fields, function (field) {
      field.classList.remove("bf-invalid");
    });

    if (!bad.length) {
      document.getElementById("bf-error").hidden = true;
      d.report(
        result,
        "<p><strong>Accepted, after " +
          attempts.broken +
          (attempts.broken === 1 ? " attempt." : " attempts.") +
          "</strong> Margaret is still on the line. Now try the accessible version and compare.</p>",
        "pass"
      );
      return;
    }

    bad.forEach(function (id) {
      document.getElementById(id).classList.add("bf-invalid");
    });

    // The failure the exercise is really about: a message that names nothing,
    // is not announced, and throws away work the user already did.
    document.getElementById("bf-error").hidden = false;
    document.getElementById("bf-day").value = "";
    document.getElementById("bf-month").value = "";
    document.getElementById("bf-year").value = "";
  });

  brokenForm.addEventListener("reset", function () {
    document.getElementById("bf-error").hidden = true;
    Array.prototype.forEach.call(brokenForm.querySelectorAll("input"), function (field) {
      field.classList.remove("bf-invalid");
    });
  });

  // ---------- The accessible version ----------

  var FIELDS = [
    {
      id: "ff-name",
      errorId: "ff-name-error",
      hintId: "ff-name-hint",
      label: "Full name",
      check: function (v) {
        return v ? null : "Enter your full name.";
      },
    },
    {
      id: "ff-day",
      errorId: "ff-dob-error",
      hintId: "ff-dob-hint",
      label: "Date of birth",
      check: function () {
        return checkDate(value("ff-day"), value("ff-month"), value("ff-year"));
      },
    },
    {
      id: "ff-address",
      errorId: "ff-address-error",
      hintId: "ff-address-hint",
      label: "Address",
      check: function (v) {
        return v ? null : "Enter your address.";
      },
    },
    {
      id: "ff-postcode",
      errorId: "ff-postcode-error",
      hintId: "ff-postcode-hint",
      label: "Postcode",
      check: function (v) {
        if (!v) return "Enter your postcode.";
        return POSTCODE.test(v) ? null : "Enter a postcode in the format SA1 5LN.";
      },
    },
  ];

  function clearFixedErrors() {
    FIELDS.forEach(function (field) {
      var input = document.getElementById(field.id);
      var error = document.getElementById(field.errorId);
      input.removeAttribute("aria-invalid");
      input.setAttribute("aria-describedby", field.hintId);
      error.hidden = true;
      error.textContent = "";
      var group = input.closest(".field");
      if (group) group.classList.remove("field--error");
    });
    document.getElementById("ff-summary").hidden = true;
    document.getElementById("ff-summary-list").innerHTML = "";
  }

  fixedForm.addEventListener("submit", function (event) {
    event.preventDefault();
    attempts.fixed += 1;
    document.getElementById("fixed-attempts").textContent = String(attempts.fixed);

    clearFixedErrors();

    var problems = [];
    FIELDS.forEach(function (field) {
      var input = document.getElementById(field.id);
      var message = field.check(input.value.trim());
      if (!message) return;

      problems.push({ id: field.id, message: message });

      var error = document.getElementById(field.errorId);
      error.textContent = message;
      error.hidden = false;
      input.setAttribute("aria-invalid", "true");
      // The error is added to the description so it is read with the label.
      input.setAttribute("aria-describedby", field.errorId + " " + field.hintId);
      var group = input.closest(".field");
      if (group) group.classList.add("field--error");
    });

    if (!problems.length) {
      // Postcodes are normalised for the user rather than rejected.
      var postcode = value("ff-postcode").toUpperCase().replace(/\s+/g, "");
      var tidy = postcode.slice(0, postcode.length - 3) + " " + postcode.slice(-3);
      d.report(
        result,
        "<p><strong>Accepted, after " +
          attempts.fixed +
          (attempts.fixed === 1 ? " attempt." : " attempts.") +
          "</strong> The postcode you typed was saved as " +
          tidy +
          ", tidied up by the form rather than sent back to you.</p>",
        "pass"
      );
      return;
    }

    var list = document.getElementById("ff-summary-list");
    problems.forEach(function (problem) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + problem.id;
      link.textContent = problem.message;
      link.addEventListener("click", function (clickEvent) {
        clickEvent.preventDefault();
        document.getElementById(problem.id).focus();
      });
      item.appendChild(link);
      list.appendChild(item);
    });

    var summary = document.getElementById("ff-summary");
    summary.hidden = false;
    // Moving focus here is what makes the error reachable for keyboard and
    // screen reader users, instead of leaving them at the bottom of the form.
    summary.focus();
  });

  // Reset the counters when the version changes, so the two are compared
  // over the same run rather than accumulating.
  var activity = brokenForm.closest(".activity");
  if (activity) {
    activity.addEventListener("modechange", function () {
      d.report(result, "", null);
    });
  }
})();
