# karlgoldstraw.com

Karl Goldstraw's personal website and blog, built with [Eleventy (11ty)](https://www.11ty.dev/). Styles are ported from the old Jekyll site ([jfolio](https://github.com/karlgoldstraw/jfolio)).

## Getting started

```bash
npm install
npm start        # dev server at http://localhost:8080, with live reload (shows drafts)
npm run build    # production build into _site/ (drafts left out)
npm test         # builds, then checks the accessibility discovery exercises
```

## Where things live

```
src/
  _data/site.js              Site title, description, email, social links
  _includes/layouts/         base.njk (HTML shell), home, page and post layouts
  _includes/partials/        nav.njk and footer.njk
  css/style.css              All styles (colours are CSS variables at the top)
  assets/img/                Images
  index.njk                  Home page, cards come from the projects
  about-me.md                About me
  blog/index.njk             Blog listing
  blog/posts/                Blog posts
  projects/                  Project pages (one card each on the home page)
  accessibility-discovery/   The accessibility discovery exercises
  cv.njk                     CV (hidden from nav and search engines)
```

## Writing a blog post

Create `src/blog/posts/YYYY-MM-DD-your-post-title.md`:

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

- The date comes from the filename and the URL becomes `/blog/your-post-title/`.
- `draft: true` posts only appear with `npm start`. Remove it (or set `false`) to publish.
- Posts are included in the Atom feed at `/feed.xml`.

## Adding a project

Create `src/projects/project-name.md` with `title`, `intro`, `order`, `cardTitle`, `cardImage` and `cardAlt` in the front matter. It shows up as a card on the home page, sorted by `order`.

## Accessibility discovery exercises

`/accessibility-discovery/` is a set of hands-on exercises for running accessibility
discovery sessions with a team. It is deliberately left out of the main navigation so
it can be linked to from a blog post; add `eleventyNavigation` to
`src/accessibility-discovery/index.njk` if you ever want it in the nav.

```
src/accessibility-discovery/
  index.njk                  The hub page, lists the exercises
  facilitator-guide.njk      How to run a session
  low-contrast.njk           One file per exercise, ordered by `order`
  ...
src/css/discovery.css        Styles, loaded only on these pages
src/js/discovery/            common.js plus one script per exercise
```

To add an exercise, create a file in `src/accessibility-discovery/` with `title`,
`order`, `summary`, `scenario`, `tasks`, `time`, `barrier`, `criterion` and `script`
in the front matter. The `order` value is what puts it in the list, so the hub page
and the facilitator guide (which have no `order`) stay out of it.

Each exercise shows a barrier and a working version side by side. The switch between
them is a `fieldset.mode-toggle` with `data-mode-toggle`, and the two versions are
elements with `data-mode="broken"` and `data-mode="fixed"`. `common.js` wires that up
and fires a `modechange` event on the surrounding `.activity`.

**The broken demos fail WCAG on purpose.** Each one sits in a container labelled as
such so that anyone using a screen reader knows the barriers are the exercise. Keep
that labelling on anything new, keep the failures inside the demo, and never build a
real keyboard trap.

## Tests

`npm test` builds the site and runs three suites against `_site/` in a headless
browser. They cover the accessibility discovery exercises, which are the only part
of the site with enough behaviour to be worth testing.

```
test/run.mjs               Serves _site, runs the suites, exits non-zero on failure
test/axe.test.mjs          axe-core over every exercise page
test/exercises.test.mjs    Works each exercise the way somebody in a session would
test/keyboard.test.mjs     Tabs through every page looking for keyboard traps
```

The axe suite is the important one. Because the exercises break WCAG on purpose, it
checks two separate things: that **nothing outside a `data-barrier` container has any
violation**, so the page around the exercise stays exemplary; and that the barriers
axe can detect are **still** detectable, so tidying up never quietly removes the
point of an exercise. Colour used as the only cue and a div standing in for a button
are invisible to axe, which is why `exercises.test.mjs` checks those by hand.

Chromium comes from Playwright. If it has not been downloaded yet:

```bash
npx playwright install chromium
```

If that is not possible (a locked-down CI image, say), the tests fall back to any
Chromium already on the machine, including one under `PLAYWRIGHT_BROWSERS_PATH`.

## Adding a page to the navigation

Add this to a page's front matter:

```yaml
eleventyNavigation:
  key: Page name
  order: 3
```

## Deploying

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to `master`. You can also run it by hand from the **Actions** tab.

The custom domain (`karlgoldstraw.com`) is set in the repo's **Settings → Pages**, with **Source** set to **GitHub Actions**. GitHub ignores the `CNAME` file for sites deployed by Actions, so that setting is what counts.
