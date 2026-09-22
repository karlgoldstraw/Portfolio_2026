// Defaults for the accessibility discovery exercises.
// Each exercise is one page, ordered by `order`, and listed on the hub page.
export default {
  layout: "layouts/exercise.njk",
  tags: ["exercises"],
  permalink: "/accessibility-discovery/{{ page.fileSlug }}/",
};
