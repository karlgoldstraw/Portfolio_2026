# theturning.co.uk

Karl Goldstraw's personal website and blog, built with [Eleventy (11ty)](https://www.11ty.dev/). Styles are ported from the old Jekyll site ([jfolio](https://github.com/karlgoldstraw/jfolio)).

## Getting started

```bash
npm install
npm start        # dev server at http://localhost:8080, with live reload (shows drafts)
npm run build    # production build into _site/ (drafts left out)
```

## Where things live

```
src/
  _data/site.js              Site title, description, email, social links
  _includes/layouts/         base.njk (HTML shell), home, page and post layouts
  _includes/partials/        nav.njk and footer.njk
  css/style.css              All styles (colours are CSS variables at the top)
  assets/img/                Images
  index.njk                  Home page ("My work"), cards come from the projects
  about-me.md                About me
  design-snippets/index.njk  Blog listing ("Writing")
  design-snippets/posts/     Blog posts
  projects/                  Project pages (one card each on the home page)
  cv.njk                     CV (hidden from nav and search engines)
```

## Writing a blog post

Create `src/design-snippets/posts/YYYY-MM-DD-your-post-title.md`:

```markdown
---
title: Your post title
tags: [Accessibility]
draft: true
---

Write in Markdown. HTML works too.

{% figure "/assets/img/photo.jpg", "Alt text", "Optional caption" %}

{% youtube "VIDEO_ID", "Optional caption" %}

> Blockquotes are styled as inset text.
```

- The date comes from the filename and the URL becomes `/design-snippets/your-post-title/`.
- `draft: true` posts only appear with `npm start`. Remove it (or set `false`) to publish.
- Posts are included in the Atom feed at `/feed.xml`.

## Adding a project

Create `src/projects/project-name.md` with `title`, `intro`, `order`, `cardTitle`, `cardImage` and `cardAlt` in the front matter. It shows up as a card on the home page, sorted by `order`.

## Adding a page to the navigation

Add this to a page's front matter:

```yaml
eleventyNavigation:
  key: Page name
  order: 3
```

## Deploying

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to `master`. In the repo on GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**. The `CNAME` file keeps the `theturning.co.uk` domain.
