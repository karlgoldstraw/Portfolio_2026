// Exercise 4: colour as the only cue.
// Both tables are built from the same rows, so the only difference is
// whether the status is spelled out.
(function () {
  "use strict";

  var stage = document.getElementById("colour-stage");
  if (!stage) return;

  var d = window.discovery;
  var result = document.getElementById("colour-result");

  var ORDERS = [
    { id: "SW-4417", customer: "M Okonkwo-Bell", value: "£64.00", status: "shipped" },
    { id: "SW-4418", customer: "T Reeves", value: "£128.50", status: "action" },
    { id: "SW-4421", customer: "A Nowak", value: "£19.99", status: "shipped" },
    { id: "SW-4425", customer: "J Ahmed", value: "£240.00", status: "delayed" },
    { id: "SW-4429", customer: "R Vaughan", value: "£8.75", status: "shipped" },
    { id: "SW-4430", customer: "S Ibrahim", value: "£415.20", status: "action" },
    { id: "SW-4433", customer: "L Price", value: "£56.00", status: "shipped" },
    { id: "SW-4436", customer: "C Donnelly", value: "£92.40", status: "delayed" },
    { id: "SW-4440", customer: "H Kaur", value: "£310.00", status: "action" },
    { id: "SW-4442", customer: "D Evans", value: "£27.30", status: "shipped" },
  ];

  var LABELS = {
    shipped: "Shipped",
    delayed: "Delayed",
    action: "Action needed",
  };

  var COLOURS = {
    shipped: "green",
    delayed: "amber",
    action: "red",
  };

  // A tick, a warning triangle and a cross: shape as well as colour, so the
  // three states stay apart when hue does not.
  var ICONS = {
    shipped:
      '<svg class="status-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6.2 12.3 2.3 8.4l1.4-1.4 2.5 2.5 6.1-6.1 1.4 1.4z"/></svg>',
    delayed:
      '<svg class="status-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1.5 15.5 14.5H.5zm-.9 4.3v4.4h1.8V5.8zm0 5.6v1.8h1.8v-1.8z"/></svg>',
    action:
      '<svg class="status-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M12.7 4.7 11.3 3.3 8 6.6 4.7 3.3 3.3 4.7 6.6 8l-3.3 3.3 1.4 1.4L8 9.4l3.3 3.3 1.4-1.4L9.4 8z"/></svg>',
  };

  var ANSWER = ORDERS.filter(function (order) {
    return order.status === "action";
  }).length;

  function cell(text) {
    var td = document.createElement("td");
    td.textContent = text;
    return td;
  }

  function buildRows(tbody, spellItOut) {
    ORDERS.forEach(function (order) {
      var tr = document.createElement("tr");

      var th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = order.id;
      tr.appendChild(th);

      tr.appendChild(cell(order.customer));
      tr.appendChild(cell(order.value));

      var status = document.createElement("td");
      if (spellItOut) {
        status.className = "status status--" + COLOURS[order.status];
        status.innerHTML = ICONS[order.status] + "<span>" + LABELS[order.status] + "</span>";
      } else {
        // Colour and nothing else. Not even a text alternative, which is
        // how this usually reaches production.
        status.innerHTML = '<span class="dot dot--' + COLOURS[order.status] + '"></span>';
      }
      tr.appendChild(status);

      tbody.appendChild(tr);
    });
  }

  buildRows(document.getElementById("orders-broken"), false);
  buildRows(document.getElementById("orders-fixed"), true);

  document.getElementById("colour-filter").addEventListener("change", function (event) {
    var choice = event.target.value;
    stage.style.filter = choice === "none" ? "" : "url(#filter-" + choice + ")";
  });

  document.getElementById("colour-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var given = document.getElementById("colour-answer").value.trim();

    if (given === "") {
      d.report(result, "<p>Put a number in first, even if you are guessing.</p>", null);
      return;
    }

    if (Number(given) === ANSWER) {
      d.report(
        result,
        "<p><strong>Right, there are " +
          ANSWER +
          ".</strong> How long did it take, and how certain were you? Now switch to the accessible version and count again.</p>",
        "pass"
      );
    } else {
      d.report(
        result,
        "<p><strong>Not quite.</strong> You said " +
          given +
          ". There are " +
          ANSWER +
          " orders that need action. Nothing on that table says so in words.</p>",
        "fail"
      );
    }
  });

  var activity = stage.closest(".activity");
  activity.addEventListener("modechange", function () {
    d.report(result, "", null);
  });
})();
