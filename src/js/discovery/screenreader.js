// Exercise 5: what a screen reader has to work with.
// Two scripts of announcements for the same page. Stepping through them one
// at a time is a slow, deliberate stand-in for listening to it.
(function () {
  "use strict";

  var player = document.getElementById("sr-utterance");
  if (!player) return;

  var d = window.discovery;
  var result = document.getElementById("sr-result");

  var SCRIPTS = {
    broken: [
      { text: "Northerly dot co dot U K. Document.", link: null },
      { text: "Graphic. logo-final-2.png", link: null },
      { text: "Button.", link: null },
      { text: "Graphic. hero_banner_autumn_v4.jpg", link: null },
      { text: "Graphic. IMG_2094.jpg", link: null },
      { text: "139 pounds", link: null },
      { text: "Link. Read more", link: "Read more" },
      { text: "Graphic. IMG_2097.jpg", link: null },
      { text: "95 pounds", link: null },
      { text: "Link. Read more", link: "Read more" },
      { text: "Graphic. returns-panel-FINAL.png", link: null },
      { text: "Not happy?", link: null },
      { text: "Link. Click here", link: "Click here" },
      { text: "End of document.", link: null },
    ],
    fixed: [
      { text: "Northerly. Coats and jackets. Document.", link: null },
      { text: "Banner landmark. Link. Northerly, home page.", link: "Northerly, home page" },
      { text: "Link. Basket, 1 item.", link: "Basket, 1 item" },
      { text: "Main landmark. Heading level 1. Coats and jackets.", link: null },
      { text: "Graphic. Two people walking a coastal path in heavy rain.", link: null },
      { text: "Heading level 2. Our two best sellers.", link: null },
      {
        text: "Graphic. The Gower parka in slate blue, shown with the hood up in rain.",
        link: null,
      },
      { text: "Heading level 3. Gower waterproof parka. 139 pounds.", link: null },
      {
        text: "Link. Gower waterproof parka, full details and sizes.",
        link: "Gower waterproof parka, full details and sizes",
      },
      {
        text: "Graphic. The Mumbles quilted jacket in olive, shown indoors.",
        link: null,
      },
      { text: "Heading level 3. Mumbles quilted jacket, showerproof. 95 pounds.", link: null },
      {
        text: "Link. Mumbles quilted jacket, full details and sizes.",
        link: "Mumbles quilted jacket, full details and sizes",
      },
      { text: "Heading level 2. Returns and exchanges.", link: null },
      { text: "Call us free on, link, 0800 111 2233. Monday to Saturday, 8am to 8pm.", link: "0800 111 2233" },
      { text: "Not happy? Link. Start a return.", link: "Start a return" },
      { text: "End of main landmark.", link: null },
    ],
  };

  var mode = "broken";
  var index = -1;

  var positionEl = document.getElementById("sr-position");
  var transcript = document.getElementById("sr-transcript");
  var linksList = document.getElementById("sr-links-list");

  function script() {
    return SCRIPTS[mode];
  }

  function render() {
    var items = script();
    if (index < 0) {
      positionEl.textContent = "Not started";
      player.textContent = "Press Next to start reading the page from the top.";
      return;
    }
    positionEl.textContent = index + 1 + " of " + items.length;
    player.textContent = items[index].text;
  }

  function buildLinks() {
    linksList.innerHTML = "";
    var found = script().filter(function (item) {
      return item.link;
    });
    found.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item.link;
      linksList.appendChild(li);
    });
  }

  document.getElementById("sr-next").addEventListener("click", function () {
    if (index < script().length - 1) index += 1;
    render();
  });

  document.getElementById("sr-prev").addEventListener("click", function () {
    if (index > -1) index -= 1;
    render();
  });

  document.getElementById("sr-restart").addEventListener("click", function () {
    index = -1;
    render();
  });

  var linksButton = document.getElementById("sr-links");
  linksButton.setAttribute("aria-expanded", "false");
  linksButton.setAttribute("aria-controls", "sr-transcript");

  linksButton.addEventListener("click", function () {
    var open = transcript.hidden;
    if (open) buildLinks();
    transcript.hidden = !open;
    linksButton.setAttribute("aria-expanded", String(open));
    linksButton.textContent = open ? "Hide links list" : "Links list";
  });

  document.getElementById("sr-form").addEventListener("submit", function (event) {
    event.preventDefault();

    var phone = document.getElementById("sr-answer-phone").value.replace(/\D/g, "");
    var coat = document.getElementById("sr-answer-coat").value.trim().toLowerCase();

    var phoneRight = phone === "08001112233";
    var coatRight = coat.indexOf("gower") > -1 || coat.indexOf("parka") > -1;

    if (mode === "broken") {
      d.report(
        result,
        "<p><strong>Neither answer is available in this version.</strong> " +
          (phoneRight || coatRight
            ? "If you got one right, you read it off the picture &mdash; which is the one thing a screen reader user cannot do. "
            : "") +
          "The phone number is inside a graphic with no alt text, and the only difference between the two coats is in a photograph called IMG_2094.jpg. Switch to the accessible version and try again.</p>",
        "fail"
      );
      return;
    }

    if (phoneRight && coatRight) {
      d.report(
        result,
        "<p><strong>Both right.</strong> Same page, same layout, same photographs. The only change was text.</p>",
        "pass"
      );
    } else {
      d.report(
        result,
        "<p>" +
          (phoneRight ? "Phone number right. " : "The phone number is 0800 111 2233. ") +
          (coatRight ? "Coat right." : "The waterproof one is the Gower parka.") +
          " Both are in the announcements now &mdash; step through again and listen for them.</p>",
        null
      );
    }
  });

  var activity = player.closest(".activity");
  activity.addEventListener("modechange", function (event) {
    mode = event.detail.mode;
    index = -1;
    render();
    if (!transcript.hidden) buildLinks();
    d.report(result, "", null);
  });

  render();
})();
