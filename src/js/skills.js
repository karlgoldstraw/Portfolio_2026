// Search, category filter and "show more" for /accessibility-skills/.
// The full list is in the HTML, so the page works without this. The filter
// form and the show more button start hidden and only appear once the script
// is running.
(function () {
  var form = document.querySelector("[data-skill-filter]");
  var list = document.querySelector("[data-skill-list]");
  if (!form || !list) return;

  // How many skills are shown at a time. A longer list gets a button to
  // show the next batch.
  var BATCH = 100;

  var search = form.querySelector("#skill-search");
  var category = form.querySelector("#skill-category");
  var count = document.querySelector("[data-skill-count]");
  var empty = document.querySelector("[data-skill-empty]");
  var more = document.querySelector("[data-skill-more]");
  var moreButton = more && more.querySelector("button");
  var items = Array.prototype.map.call(list.children, function (item) {
    return {
      element: item,
      category: item.dataset.category,
      // The card shows the first sentence; search covers the whole description
      text: (item.textContent + " " + (item.dataset.search || "")).toLowerCase().replace(/\s+/g, " "),
    };
  });
  var limit = BATCH;
  var announce;

  function status(shown, matches, filtered) {
    if (shown < matches) {
      return filtered
        ? "Showing " + shown + " of " + matches + " matching skills"
        : "Showing " + shown + " of " + matches + " skills, most installed first";
    }
    return filtered
      ? "Showing " + matches + " of " + items.length + " skills"
      : matches + " skills, most installed first";
  }

  // Shows the skills that match the filter, up to the limit. Returns the
  // first skill that this call revealed, if there is one.
  function apply(immediately) {
    var words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    var chosen = category.value;
    var matches = 0;
    var firstRevealed = null;

    items.forEach(function (item) {
      var match =
        (!chosen || item.category === chosen) &&
        words.every(function (word) {
          return item.text.indexOf(word) !== -1;
        });
      if (match) matches += 1;
      var show = match && matches <= limit;
      if (show && item.element.hidden && !firstRevealed) firstRevealed = item.element;
      item.element.hidden = !show;
    });

    var shown = Math.min(matches, limit);
    empty.hidden = matches !== 0;
    list.hidden = matches === 0;

    if (more) {
      var remaining = matches - shown;
      more.hidden = remaining <= 0;
      if (remaining > 0) {
        var next = Math.min(BATCH, remaining);
        moreButton.textContent = "Show " + next + " more skill" + (next === 1 ? "" : "s");
      }
    }

    // Wait for a pause in typing, so a screen reader hears one count, not five
    var text = status(shown, matches, Boolean(chosen || words.length));
    clearTimeout(announce);
    if (immediately) {
      count.textContent = text;
    } else {
      announce = setTimeout(function () {
        count.textContent = text;
      }, 400);
    }

    // Keep the filter in the address, so a filtered list can be shared
    var params = new URLSearchParams();
    if (search.value.trim()) params.set("q", search.value.trim());
    if (chosen) params.set("category", chosen);
    var query = params.toString();
    history.replaceState(null, "", query ? "?" + query : location.pathname);

    return firstRevealed;
  }

  // A new search or category starts again from the first batch
  function filter() {
    limit = BATCH;
    apply();
  }

  var initial = new URLSearchParams(location.search);
  search.value = initial.get("q") || "";
  category.value = initial.get("category") || "";
  if (category.selectedIndex === -1) category.value = "";

  form.hidden = false;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  search.addEventListener("input", filter);
  category.addEventListener("change", filter);

  if (moreButton) {
    moreButton.addEventListener("click", function () {
      limit += BATCH;
      var first = apply();
      // The button may now be gone, and what was asked for is further down the
      // list. Move focus to the first new skill so a keyboard or screen reader
      // user carries on from there instead of being dropped at the top.
      var link = first && first.querySelector("a");
      if (link) link.focus();
    });
  }

  apply(true);
})();
