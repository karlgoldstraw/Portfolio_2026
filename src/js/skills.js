// Search and category filter for /accessibility-skills/.
// The full list is in the HTML, so the page works without this. The filter
// form starts hidden and is only shown once the script is running.
(function () {
  var form = document.querySelector("[data-skill-filter]");
  var list = document.querySelector("[data-skill-list]");
  if (!form || !list) return;

  var search = form.querySelector("#skill-search");
  var category = form.querySelector("#skill-category");
  var count = document.querySelector("[data-skill-count]");
  var empty = document.querySelector("[data-skill-empty]");
  var items = Array.prototype.map.call(list.children, function (item) {
    return {
      element: item,
      category: item.dataset.category,
      // The card shows the first sentence; search covers the whole description
      text: (item.textContent + " " + (item.dataset.search || "")).toLowerCase().replace(/\s+/g, " "),
    };
  });
  var announce;

  function apply() {
    var words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    var chosen = category.value;
    var shown = 0;

    items.forEach(function (item) {
      var match =
        (!chosen || item.category === chosen) &&
        words.every(function (word) {
          return item.text.indexOf(word) !== -1;
        });
      item.element.hidden = !match;
      if (match) shown += 1;
    });

    empty.hidden = shown !== 0;
    list.hidden = shown === 0;

    // Wait for a pause in typing, so a screen reader hears one count, not five
    clearTimeout(announce);
    announce = setTimeout(function () {
      count.textContent =
        shown === items.length
          ? shown + " skills, most installed first"
          : "Showing " + shown + " of " + items.length + " skills";
    }, 400);

    // Keep the filter in the address, so a filtered list can be shared
    var params = new URLSearchParams();
    if (search.value.trim()) params.set("q", search.value.trim());
    if (chosen) params.set("category", chosen);
    var query = params.toString();
    history.replaceState(null, "", query ? "?" + query : location.pathname);
  }

  var initial = new URLSearchParams(location.search);
  search.value = initial.get("q") || "";
  category.value = initial.get("category") || "";
  if (category.selectedIndex === -1) category.value = "";

  form.hidden = false;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  search.addEventListener("input", apply);
  category.addEventListener("change", apply);
  if (search.value || category.value) apply();
})();
