import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import site from "./src/_data/site.js";

export default function (eleventyConfig) {
  // Files copied straight to the output
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  eleventyConfig.addWatchTarget("src/css/");

  // Drafts: posts with `draft: true` show up with `npm start`,
  // but are left out of `npm run build` (what gets deployed).
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  // Plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "en",
      title: site.title,
      subtitle: site.description,
      base: site.url,
      author: { name: site.author, email: site.email },
    },
  });

  // Collections
  eleventyConfig.addCollection("projects", (collectionApi) =>
    collectionApi
      .getFilteredByTag("projects")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );

  // Filters
  eleventyConfig.addFilter("readableDate", (date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date)
  );

  eleventyConfig.addFilter("htmlDateString", (date) =>
    date.toISOString().slice(0, 10)
  );

  // Hide the internal "posts"/"projects" tags when listing a post's tags
  eleventyConfig.addFilter("filterTagList", (tags = []) =>
    tags.filter((tag) => !["all", "posts", "projects"].includes(tag))
  );

  // Shortcodes (the 11ty versions of the old Jekyll includes)
  eleventyConfig.addShortcode("figure", (src, alt = "", caption = "") => {
    const figcaption = caption ? `<figcaption>${caption}</figcaption>` : "";
    return `<figure><img src="${src}" alt="${alt}" loading="lazy">${figcaption}</figure>`;
  });

  eleventyConfig.addShortcode("youtube", (id, caption = "") => {
    const figcaption = caption ? `<figcaption>${caption}</figcaption>` : "";
    return `<figure><iframe width="100%" height="315" src="https://www.youtube-nocookie.com/embed/${id}" title="${caption || "YouTube video"}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>${figcaption}</figure>`;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
