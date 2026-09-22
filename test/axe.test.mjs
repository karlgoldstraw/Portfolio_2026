// Every exercise deliberately breaks WCAG inside its demo. This suite checks
// that the breakage stays where it is meant to be:
//
//   1. With the barrier containers excluded, no page has any violation. The
//      page around the exercise has to be exemplary.
//   2. The barriers that axe can detect are still detectable, so a tidy-up
//      never quietly removes the point of the exercise.
//
// Two of the barriers are invisible to axe by their nature: colour used as
// the only cue, and a div behaving as a button. Those are covered by
// exercises.test.mjs instead, which is a fair reminder of how much an
// automated checker misses.
import fs from "node:fs";
import { createRequire } from "node:module";
import { PAGES } from "./helpers.mjs";

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve("axe-core"), "utf8");

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

const EXPECTED_BARRIERS = {
  "/accessibility-discovery/low-contrast/": ["color-contrast"],
  "/accessibility-discovery/form-controls/": ["color-contrast", "label"],
  "/accessibility-discovery/target-size/": ["target-size"],
};

async function analyse(page, context) {
  return page.evaluate(
    async ([runContext, tags]) =>
      (await window.axe.run(runContext, { runOnly: { type: "tag", values: tags } })).violations.map(
        (violation) => ({
          id: violation.id,
          impact: violation.impact,
          targets: violation.nodes.map((node) => node.target.join(" ")),
        })
      ),
    [context, TAGS]
  );
}

export default async function run({ context, base, ok, note }) {
  for (const path of PAGES) {
    const page = await context.newPage();
    await page.goto(base + path, { waitUntil: "load" });
    await page.addScriptTag({ content: axeSource });

    const outside = await analyse(page, { exclude: [["[data-barrier]"]] });
    ok(
      `${path} is clean outside the barrier`,
      outside.length === 0,
      outside.map((v) => `${v.id} (${v.targets[0]})`).join(", ")
    );

    const expected = EXPECTED_BARRIERS[path];
    if (expected) {
      const inside = await analyse(page, { include: [["[data-barrier]"]] });
      const found = inside.map((violation) => violation.id);
      const missing = expected.filter((id) => !found.includes(id));
      ok(
        `${path} still demonstrates its barrier`,
        missing.length === 0,
        missing.length ? "no longer detected: " + missing.join(", ") : found.join(", ")
      );
    }

    await page.close();
  }

  note("axe cannot see the colour-only or div-as-button barriers; those are checked by hand.");
}
