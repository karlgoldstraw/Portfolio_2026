// Defaults for every blog post in this folder.
// Name files YYYY-MM-DD-my-post-title.md and the date is taken from the filename.
export default {
  layout: "layouts/post.njk",
  tags: ["posts"],
  permalink: "/design-snippets/{{ page.fileSlug | slugify }}/",
};
