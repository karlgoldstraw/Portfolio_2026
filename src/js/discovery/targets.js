// Exercise 6: target size and spacing.
// The counter treats anything you never needed to press as a mis-tap: the
// task only ever requires the plus button, the close button and Pay now.
(function () {
  "use strict";

  var broken = document.getElementById("checkout-broken");
  if (!broken) return;

  var d = window.discovery;
  var result = document.getElementById("target-result");
  var fixed = document.getElementById("checkout-fixed");

  var state = {
    broken: { qty: 1, mistaps: 0 },
    fixed: { qty: 1, mistaps: 0 },
  };

  function money(qty) {
    return "£" + (qty * 12).toFixed(2);
  }

  function misTap(which, what) {
    state[which].mistaps += 1;
    document.getElementById(which + "-mistaps").textContent = String(state[which].mistaps);
    d.report(
      result,
      "<p>That was <strong>" + what + "</strong>. Was it the one you meant?</p>",
      "fail"
    );
  }

  // ---------- The version with the barrier ----------

  var cookieBroken = document.getElementById("cookie-broken");

  cookieBroken.addEventListener("click", function (event) {
    if (event.target.closest("#cookie-broken-close")) {
      cookieBroken.hidden = true;
      return;
    }
    // Pressing the banner and missing the 12 pixel cross.
    misTap("broken", "the cookie banner, not the close button");
  });

  broken.querySelectorAll(".qty__btn").forEach(function (button) {
    button.addEventListener("click", function () {
      var step = Number(button.getAttribute("data-step"));
      if (step < 0) {
        misTap("broken", "minus");
      }
      state.broken.qty = Math.max(1, Math.min(20, state.broken.qty + step));
      document.getElementById("qty-broken").textContent = String(state.broken.qty);
      document.getElementById("total-broken").textContent = money(state.broken.qty);
    });
  });

  document.getElementById("cancel-broken").addEventListener("click", function () {
    misTap("broken", "Cancel order");
    state.broken.qty = 1;
    document.getElementById("qty-broken").textContent = "1";
    document.getElementById("total-broken").textContent = money(1);
  });

  document.getElementById("pay-broken").addEventListener("click", function () {
    finish("broken", state.broken.qty);
  });

  // ---------- The accessible version ----------

  var cookieFixed = document.getElementById("cookie-fixed");

  ["cookie-fixed-accept", "cookie-fixed-reject"].forEach(function (id) {
    document.getElementById(id).addEventListener("click", function () {
      cookieFixed.hidden = true;
    });
  });

  var qtyInput = document.getElementById("qty-fixed");

  function syncFixed() {
    state.fixed.qty = Math.max(1, Math.min(20, Number(qtyInput.value) || 1));
    qtyInput.value = String(state.fixed.qty);
    document.getElementById("total-fixed").textContent = money(state.fixed.qty);
  }

  fixed.querySelectorAll(".qty__btn-big").forEach(function (button) {
    button.addEventListener("click", function () {
      var step = Number(button.getAttribute("data-step"));
      if (step < 0) misTap("fixed", "minus");
      qtyInput.value = String(Number(qtyInput.value) + step);
      syncFixed();
    });
  });

  qtyInput.addEventListener("change", syncFixed);

  document.getElementById("cancel-fixed").addEventListener("click", function () {
    misTap("fixed", "Cancel order");
    qtyInput.value = "1";
    syncFixed();
  });

  document.getElementById("pay-fixed").addEventListener("click", function () {
    finish("fixed", state.fixed.qty);
  });

  function finish(which, qty) {
    if (qty !== 3) {
      d.report(
        result,
        "<p><strong>Paid for " +
          qty +
          (qty === 1 ? " pair." : " pairs.") +
          "</strong> The task was three. That is the kind of mistake nobody notices until the parcel arrives.</p>",
        "fail"
      );
      return;
    }
    d.report(
      result,
      "<p><strong>Three pairs, " +
        money(3) +
        ".</strong> It took " +
        state[which].mistaps +
        (state[which].mistaps === 1 ? " mis-tap" : " mis-taps") +
        " to get there.</p>",
      state[which].mistaps === 0 ? "pass" : "fail"
    );
  }

  // ---------- Measuring ----------

  function currentDemo() {
    return broken.closest("[data-mode]").hidden ? fixed : broken;
  }

  function centreOf(rect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function distance(a, b) {
    return Math.round(Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)));
  }

  function edgeGap(a, b) {
    var x = Math.max(b.left - a.right, a.left - b.right, 0);
    var y = Math.max(b.top - a.bottom, a.top - b.bottom, 0);
    return Math.round(Math.sqrt(x * x + y * y));
  }

  // 2.5.8 allows a target under 24 by 24 if a 24 pixel circle centred on it
  // does not reach the circle of any neighbour. Targets that are already big
  // enough pass on size and are not measured for spacing.
  function spacingFailures(targets) {
    var notes = [];
    targets.forEach(function (target, i) {
      var box = target.getBoundingClientRect();
      if (Math.min(box.width, box.height) >= 24) return;
      targets.forEach(function (other, j) {
        if (i >= j) return;
        var apart = distance(centreOf(box), centreOf(other.getBoundingClientRect()));
        if (apart < 24) {
          notes.push(
            target.getAttribute("data-target") +
              " and " +
              other.getAttribute("data-target") +
              ", centres " +
              apart +
              " pixels apart"
          );
        }
      });
    });
    return notes;
  }

  document.getElementById("measure").addEventListener("click", function () {
    var demo = currentDemo();
    var targets = Array.prototype.slice
      .call(demo.querySelectorAll("[data-target]"))
      .filter(function (target) {
        return target.offsetParent !== null;
      });

    if (!targets.length) {
      d.report(result, "<p>Nothing to measure right now.</p>", null);
      return;
    }

    var rows = targets.map(function (target) {
      var box = target.getBoundingClientRect();
      var width = Math.round(box.width);
      var height = Math.round(box.height);
      var smallest = Math.min(width, height);
      var verdict =
        smallest >= 44
          ? "meets 44 by 44"
          : smallest >= 24
            ? "meets the 24 minimum, under 44"
            : "under 24 by 24";
      return (
        "<li>" +
        target.getAttribute("data-target") +
        ": <strong>" +
        width +
        " by " +
        height +
        "</strong> &mdash; " +
        verdict +
        "</li>"
      );
    });

    var undersized = targets.filter(function (target) {
      var box = target.getBoundingClientRect();
      return Math.min(box.width, box.height) < 24;
    });

    var crowded = spacingFailures(targets);

    var summary = undersized.length
      ? "<p><strong>" +
        undersized.length +
        " of " +
        targets.length +
        " targets are under 24 by 24.</strong>" +
        (crowded.length
          ? " " +
            crowded.length +
            (crowded.length === 1 ? " pair fails" : " pairs fail") +
            " 2.5.8 outright, being too close to fall back on the spacing exception: " +
            crowded.join("; ") +
            ". The rest scrape through only because nothing else is within reach, which is a floor, not a design goal."
          : " They pass 2.5.8 only on the spacing exception, because nothing else is within reach. That is a floor, not a design goal.") +
        "</p>"
      : "<p><strong>Every target meets the 24 by 24 minimum.</strong></p>";

    // Size is not the only risk. How far a destructive action sits from the
    // one next to it decides how much a slip costs.
    var danger = demo.querySelector("[data-risk='destructive']");
    var risk = "";
    if (danger) {
      var nearest = null;
      targets.forEach(function (target) {
        if (target === danger) return;
        var gap = edgeGap(danger.getBoundingClientRect(), target.getBoundingClientRect());
        if (!nearest || gap < nearest.gap) {
          nearest = { gap: gap, name: target.getAttribute("data-target") };
        }
      });
      if (nearest) {
        risk =
          "<p>" +
          danger.getAttribute("data-target") +
          " sits <strong>" +
          nearest.gap +
          " pixels</strong> from " +
          nearest.name +
          ".</p>";
      }
    }

    d.report(
      result,
      summary + "<ul class='measure-list'>" + rows.join("") + "</ul>" + risk,
      undersized.length || crowded.length ? "fail" : "pass"
    );
  });

  document.getElementById("targets-reset").addEventListener("click", function () {
    state.broken = { qty: 1, mistaps: 0 };
    state.fixed = { qty: 1, mistaps: 0 };
    document.getElementById("broken-mistaps").textContent = "0";
    document.getElementById("fixed-mistaps").textContent = "0";
    document.getElementById("qty-broken").textContent = "1";
    document.getElementById("total-broken").textContent = money(1);
    qtyInput.value = "1";
    syncFixed();
    cookieBroken.hidden = false;
    cookieFixed.hidden = false;
    d.report(result, "<p>Reset. Both versions are back to the start.</p>", null);
  });

  var activity = broken.closest(".activity");
  activity.addEventListener("modechange", function () {
    d.report(result, "", null);
  });
})();
