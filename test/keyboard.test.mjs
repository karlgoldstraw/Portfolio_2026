// The exercises demonstrate barriers, but they must never trap anybody. A
// real keyboard trap has no way out except closing the tab, so this walks
// each page with Tab and checks that focus always moves on and eventually
// wraps back round to the top.
import { PAGES } from "./helpers.mjs";

const PRESSES = 70;

// Each stop is identified by its position in the document as well as its tag,
// so two adjacent links are never mistaken for the same element twice.
function describeActiveElement() {
  const active = document.activeElement;
  if (!active || active === document.body) return "body";
  const index = [...document.querySelectorAll("*")].indexOf(active);
  const label = (active.textContent || active.value || "").trim().slice(0, 30).replace(/\s+/g, " ");
  return `${index}:${active.tagName.toLowerCase()}${active.id ? "#" + active.id : ""} [${label}]`;
}

export default async function run({ context, base, ok }) {
  for (const path of PAGES) {
    const page = await context.newPage();
    await page.goto(base + path, { waitUntil: "load" });

    const stops = [];
    for (let i = 0; i < PRESSES; i++) {
      await page.keyboard.press("Tab");
      stops.push(await page.evaluate(describeActiveElement));
    }

    let run = 0;
    let longest = 0;
    let stuckOn = "";
    for (let i = 1; i < stops.length; i++) {
      if (stops[i] === stops[i - 1]) {
        run += 1;
        if (run > longest) {
          longest = run;
          stuckOn = stops[i];
        }
      } else {
        run = 0;
      }
    }

    const unique = new Set(stops).size;
    const wrapped = stops.lastIndexOf(stops[0]) > 0;

    ok(
      `${path} never traps focus`,
      longest === 0,
      longest ? `stuck ${longest + 1} presses on ${stuckOn}` : `${unique} stops`
    );
    ok(`${path} wraps back to the top`, wrapped);

    await page.close();
  }
}
