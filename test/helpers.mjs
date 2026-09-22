// Shared plumbing for the test suites: a static server for _site, a browser,
// and a very small assertion collector.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".xml": "application/xml",
  ".json": "application/json",
};

// Serves the built site. Kept in here rather than added as a dependency:
// the tests need one directory served over HTTP and nothing else.
export function serve(root) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (file.endsWith("/")) file = path.join(file, "index.html");
    if (!file.startsWith(path.resolve(root))) {
      response.writeHead(403).end();
      return;
    }
    fs.readFile(file, (error, body) => {
      if (error) {
        response.writeHead(404, { "content-type": "text/plain" }).end("Not found");
        return;
      }
      response.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
      response.end(body);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        base: `http://127.0.0.1:${port}`,
        stop: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

// Playwright's own Chromium if it has been downloaded, otherwise one that is
// already on the machine. CI images and sandboxes often ship a browser but
// pin a different build number to the Playwright version in package.json.
function installedChromium() {
  const candidates = [];

  const browsers = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (browsers && fs.existsSync(browsers)) {
    for (const entry of fs.readdirSync(browsers)) {
      if (!/^chromium-\d+$/.test(entry)) continue;
      candidates.push(
        path.join(browsers, entry, "chrome-linux", "chrome"),
        path.join(browsers, entry, "chrome-win", "chrome.exe"),
        path.join(browsers, entry, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium")
      );
    }
  }

  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);

  candidates.push(
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  );

  return candidates.find((candidate) => fs.existsSync(candidate));
}

export async function launch() {
  try {
    return await chromium.launch();
  } catch (error) {
    const executablePath = installedChromium();
    if (executablePath) {
      console.log(`  (using the Chromium already installed at ${executablePath})`);
      return chromium.launch({ executablePath });
    }
    console.error(
      "\nCould not start Chromium. Install it once with:\n\n  npx playwright install chromium\n"
    );
    throw error;
  }
}

// A results collector, so a failing check reports and carries on rather than
// stopping the run at the first problem.
export function collector() {
  const failures = [];
  return {
    failures,
    ok(name, passed, detail = "") {
      console.log(`  ${passed ? "pass" : "FAIL"}  ${name}${detail ? "  ->  " + detail : ""}`);
      if (!passed) failures.push(name);
    },
    note(text) {
      console.log(`        ${text}`);
    },
  };
}

// Every page under test, hub and guide included.
export const PAGES = [
  "/accessibility-discovery/",
  "/accessibility-discovery/facilitator-guide/",
  "/accessibility-discovery/low-contrast/",
  "/accessibility-discovery/form-controls/",
  "/accessibility-discovery/keyboard-only/",
  "/accessibility-discovery/colour-alone/",
  "/accessibility-discovery/screen-reader/",
  "/accessibility-discovery/target-size/",
];
