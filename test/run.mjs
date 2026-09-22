// Runs every suite against the built site in _site.
//
//   npm test
//
// Chromium comes from Playwright. If it is not installed yet:
//
//   npx playwright install chromium
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve, launch, collector } from "./helpers.mjs";

import axeSuite from "./axe.test.mjs";
import exerciseSuite from "./exercises.test.mjs";
import keyboardSuite from "./keyboard.test.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "_site");

if (!fs.existsSync(path.join(root, "accessibility-discovery", "index.html"))) {
  console.error("No build found in _site. Run `npm run build` first, or use `npm test`.");
  process.exit(1);
}

const SUITES = [
  ["Automated checks (axe-core)", axeSuite],
  ["Exercise behaviour", exerciseSuite],
  ["Keyboard traps", keyboardSuite],
];

const { base, stop } = await serve(root);
const browser = await launch();
const context = await browser.newContext();
const { ok, note, failures } = collector();

try {
  for (const [name, suite] of SUITES) {
    console.log(`\n${name}`);
    await suite({ context, base, ok, note, failures });
  }
} finally {
  await context.close();
  await browser.close();
  await stop();
}

console.log("");
if (failures.length) {
  console.log(`${failures.length} check(s) failed:`);
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exit(1);
}
console.log("All checks passed.");
