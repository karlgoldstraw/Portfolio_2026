// Defaults for every project page in this folder.
// Projects appear as cards on the home page, sorted by `order`.
export default {
  layout: "layouts/page.njk",
  tags: ["projects"],
  permalink: "/projects/{{ page.fileSlug }}/",
};
