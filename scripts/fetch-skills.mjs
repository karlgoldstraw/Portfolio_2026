// Rebuilds src/_data/a11ySkills.json, the list behind /accessibility-skills/.
//
//   npm run skills
//   npm run skills -- --only owner/repo   (re-read just these repos; quick)
//
// 1. Asks the skills.sh search index for accessibility-related skills. That
//    gives the skill name, the GitHub repo it lives in, and an install count.
// 2. Reads each skill's own SKILL.md straight from its GitHub repo (a shallow,
//    blob-less clone, so no GitHub API token or rate limit is involved) to get
//    the description its author wrote and the exact path to link to.
// 3. Drops anything that is not really about accessibility, removes copies of
//    the same skill mirrored into other repos, and writes the JSON.
//
// The JSON is committed, so the site build never depends on the network.
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import matter from "gray-matter";

const run = promisify(execFile);
const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "_data",
  "a11ySkills.json"
);

const QUERIES = [
  "accessibility",
  "a11y",
  "wcag",
  "aria",
  "screen reader",
  "contrast",
  "keyboard navigation",
  "inclusive design",
  "voiceover",
  "alt text",
  "assistive technology",
  // Inclusive design
  "inclusive language",
  "neurodiversity",
  "cognitive accessibility",
  "plain language",
  "easy read",
  "dyslexia",
  "color blind",
  "reduced motion",
  "focus management",
  "semantic html",
  "disability",
  "universal design",
  "section 508",
  "accessible pdf",
  "low vision",
  "accessible forms",
  "accessible components",
];

// A skill has to look like an accessibility skill by name...
const NAME =
  /accessib|a11y|wcag|rgaa|aria|screen-?reader|contrast|keyboard|inclusive|voiceover|talkback|alt-?text|axe|neurodiv|dyslex|cognitive|plain-?language|easy-?read|colou?r-?blind|reduced-?motion|focus-management|semantic-html|disab|assistive|508|vpat|low-vision|universal-design/i;
// ...and say so in its own description.
const DESCRIPTION =
  /accessib|a11y|wcag|rgaa|screen.?reader|assistive|disab|alt.?text|aria\b|inclusive design|neurodiver|plain language|colou?r.?blind|cognitive load|dyslex/i;

// Each category has a pattern for the skill's name and a stricter one for its
// description. Names are tried first, because a description tends to mention
// everything ("...with VoiceOver, alt text and contrast checks").
const CATEGORIES = [
  [
    "Inclusive design",
    /inclus|neurodiv|cognitive|plain-?language|easy-?read|dyslex|readable|persona|disab|universal-design|iso-24495/i,
    /inclusive design|neurodiver|plain language|social model/i,
  ],
  [
    "Mobile and native apps",
    /\bios\b|swift|android|flutter|react-native|mobile|appkit|uikit|compose|capacitor|macos|expo/i,
    /^(?!.*\b(web|html)\b).*(\bios\b|swiftui|android|flutter|react native)/i,
  ],
  [
    "Content and media",
    /alt-?text|caption|transcript|pdf|document|media|email|writing|content|markdown|slides/i,
    /alt text for|captions|transcripts|\bpdfs?\b/i,
  ],
  [
    "Audits and testing",
    /audit|test|scan|review|check|validat|lint|debug|inspect|diag/i,
    /\baudits?\b|\btesting\b|\bscans?\b/i,
  ],
  ["Design", /design|figma|colou?r|contrast|persona|ux|token/i, /figma|design system|designers?\b/i],
  [
    "Standards and compliance",
    /complian|wcag|\bada\b|508|legal|vpat|conformance|rgaa|raweb/i,
    /complian|section 508|en 301 549|vpat|conformance/i,
  ],
];
const DEFAULT_CATEGORY = "Building and fixing";

// Skills almost nobody has installed are mostly experiments and copies.
const MIN_INSTALLS = 10;

// Skills added by hand. These are always listed, whatever the search index
// knows about them and however few installs they have. `repo` and `skillId`
// (the skill's folder name) are needed; `description` and `category` replace
// what the script would otherwise work out for itself.
const EXTRA_SKILLS = [
  {
    repo: "designerzen/a11y-skills",
    skillId: "social-model-of-disability",
    description:
      "Applies the social model of disability to write, review and rewrite content so that language and design remove barriers.",
    category: "Inclusive design",
  },
];

// Repos that are about accessibility or inclusive design from top to bottom.
// Every skill in them that is on topic is listed, whether or not the search
// index knows it and however few installs it has. Found by searching GitHub.
const EXTRA_REPOS = [
  "accesslint/skills",
  "Binclusive/Binclusive-Accessibility-Skills",
  "CFLW-AI/wcag-audit-claude-skill",
  "Community-Access/accessibility-agents",
  "danyuchn/iso-24495-skill",
  "geoffreycrofte/luxembourg-accessibility-skillset",
  "ginader/born-accessible-ui",
  "humbleteam/accessibility-audit",
  "ianho7/ai-friendly-web-design-skill",
  "intopia/intopia-web-accessibility-skill",
  "JackReis/neurodivergent-visual-org",
  "jkense/agent-skills-wcag",
  "kgelster/ecom-a11y-audit",
  "klovaaxel/web-a11y-agent-skills",
  "KreerC/ACCESSIBILITY.md",
  "masuP9/a11y-specialist-skills",
  "mattobee/skills",
  "mgifford/accessibility-skills",
  "mrKanoh/wcag-accessibility-audit-skill",
  "MTeelokee/rgaa-accessibility-audit",
  "owl-listener/inclusive-design-skills",
  "smukh/a11y-agent-skills",
  "stark-contrast/skills",
  "tomaszboloz/WCAG-Accessibility-Skills",
  "weAAAre/a11y-agents-kit",
];

const GITHUB_REPO = /^[\w.-]+\/[\w.-]+$/;
const CONCURRENCY = 6;

async function search(query) {
  const url = new URL("https://skills.sh/api/search");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "100");
  // The index is sometimes slow. Try a few times before giving up, and give
  // up loudly: a list built from half the searches would quietly drop skills.
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    // A plain timer, not AbortSignal.timeout: that one does not keep Node
    // alive, so a stalled request could end the script without an error.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`status ${response.status}`);
      return (await response.json()).skills ?? [];
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`skills.sh search failed for "${query}": ${lastError.message}`);
}

async function git(dir, ...args) {
  // Reading a file fetches it from GitHub, and a stalled fetch would otherwise
  // hang the whole run
  const { stdout } = await run("git", ["-C", dir, ...args], {
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    timeout: 30_000,
    killSignal: "SIGKILL",
  });
  return stdout;
}

function frontMatter(text) {
  try {
    return matter(text).data ?? {};
  } catch {
    return {};
  }
}

function tidy(text) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= 320) return clean;
  return clean.slice(0, 320).replace(/\s+\S*$/, "") + "…";
}

function categorise(skill) {
  for (const [label, name] of CATEGORIES) if (name.test(skill.name)) return label;
  for (const [label, , description] of CATEGORIES) if (description.test(skill.description)) return label;
  return DEFAULT_CATEGORY;
}

// Reads the wanted skills out of one repo. With `whole`, every other skill in
// the repo that is on topic is read too.
async function readRepo(repo, wanted, tmp, whole) {
  const dir = path.join(tmp, repo.replace("/", "__"));
  try {
    await run(
      "git",
      ["clone", "--quiet", "--depth", "1", "--filter=blob:none", "--no-checkout", `https://github.com/${repo}.git`, dir],
      { env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }, timeout: 120_000, killSignal: "SIGKILL" }
    );
  } catch {
    if (whole) console.warn(`  could not clone ${repo}`);
    return [];
  }

  const files = (await git(dir, "ls-tree", "-r", "--name-only", "HEAD"))
    .split("\n")
    .filter((file) => /(^|\/)SKILL\.md$/i.test(file));
  const updated = (await git(dir, "log", "-1", "--format=%cs", "HEAD")).trim();
  const found = [];
  const used = new Set();
  const folderUrl = (file) => {
    const folder = path.dirname(file);
    return `https://github.com/${repo}/tree/HEAD/${folder === "." ? "" : folder.split("/").map(encodeURIComponent).join("/")}`;
  };
  const read = async (file) => {
    try {
      return frontMatter(await git(dir, "show", `HEAD:${file}`));
    } catch {
      return null;
    }
  };

  for (const skill of wanted) {
    const id = skill.skillId.toLowerCase();
    // Usually the folder is named after the skill. Take the shortest such path.
    let candidates = files
      .filter((file) => path.basename(path.dirname(file)).toLowerCase() === id)
      .sort((a, b) => a.length - b.length);
    // A repo that is one skill keeps SKILL.md at the top.
    if (!candidates.length && files.includes("SKILL.md")) candidates = ["SKILL.md"];
    // Otherwise the folder has another name. Look inside the likely files for
    // the one whose own `name` matches.
    let byName = false;
    if (!candidates.length) {
      byName = true;
      candidates = files.filter((file) => NAME.test(file)).slice(0, 20);
    }

    for (const file of byName ? candidates : candidates.slice(0, 3)) {
      const data = await read(file);
      if (!data) continue;
      if (byName && String(data.name ?? "").toLowerCase() !== id) continue;
      const description = skill.description ?? data.description;
      if (typeof description !== "string") continue;
      used.add(file);
      found.push({
        name: skill.name,
        repo,
        url: folderUrl(file),
        description: tidy(description),
        installs: skill.installs,
        ...(skill.extra ? { extra: true, category: skill.category } : {}),
        updated,
        install: `npx skills add ${repo} --skill ${skill.skillId}`,
      });
      break;
    }
  }

  // The rest of a hand-picked repo: anything on topic by name or description
  if (whole) {
    for (const file of files.filter((file) => !used.has(file)).slice(0, 150)) {
      const data = await read(file);
      if (!data || typeof data.description !== "string") continue;
      const folder = path.basename(path.dirname(file));
      const name = String(data.name ?? (folder === "." ? repo.split("/")[1] : folder));
      if (!NAME.test(name) && !DESCRIPTION.test(data.description)) continue;
      found.push({
        name,
        repo,
        url: folderUrl(file),
        description: tidy(data.description),
        installs: 0,
        extra: true,
        updated,
        install: `npx skills add ${repo} --skill ${name}`,
      });
    }
  }

  await fs.rm(dir, { recursive: true, force: true });
  return found;
}

// With `--only owner/repo ...` just those repos are read again and everything
// else in the list is kept as it is. A full run takes several minutes; this
// takes seconds, which is what adding one repo needs.
const onlyAt = process.argv.indexOf("--only");
const only = onlyAt === -1 ? null : new Set(process.argv.slice(onlyAt + 1).map((repo) => repo.toLowerCase()));
if (only && !only.size) throw new Error("--only needs at least one owner/repo");

const candidates = new Map();
// In an --only run the owner's name is searched for, to pick up install counts
for (const query of only ? [...only].map((repo) => repo.split("/")[0]) : QUERIES) {
  for (const skill of await search(query)) {
    if (!GITHUB_REPO.test(skill.source)) continue;
    if (only && !only.has(skill.source.toLowerCase())) continue;
    if (!NAME.test(skill.skillId) && !NAME.test(skill.name)) continue;
    candidates.set(skill.id, skill);
  }
}

// Hand-picked skills join the queue, taking their install count from the
// search index if it has one.
for (const extra of EXTRA_SKILLS) {
  const id = `${extra.repo}/${extra.skillId}`.toLowerCase();
  const indexed = [...candidates.values()].find((skill) => skill.id.toLowerCase() === id);
  if (indexed) candidates.delete(indexed.id);
  candidates.set(id, {
    id,
    source: extra.repo,
    name: extra.skillId,
    installs: indexed?.installs ?? 0,
    ...extra,
    extra: true,
  });
}

const byRepo = new Map();
for (const skill of candidates.values()) {
  if (!byRepo.has(skill.source)) byRepo.set(skill.source, []);
  byRepo.get(skill.source).push(skill);
}
const wholeRepos = new Map(EXTRA_REPOS.map((repo) => [repo.toLowerCase(), repo]));
for (const [key, repo] of wholeRepos) {
  if (![...byRepo.keys()].some((known) => known.toLowerCase() === key)) byRepo.set(repo, []);
}
if (only) {
  for (const repo of [...byRepo.keys()]) if (!only.has(repo.toLowerCase())) byRepo.delete(repo);
  for (const repo of only) {
    if (![...byRepo.keys()].some((known) => known.toLowerCase() === repo)) {
      throw new Error(`${repo} is not in EXTRA_REPOS or EXTRA_SKILLS. Add it there first.`);
    }
  }
}
console.log(`${candidates.size} candidate skills in ${byRepo.size} repos`);

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "a11y-skills-"));
const queue = [...byRepo.entries()];
const skills = [];
let done = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const [repo, wanted] = queue.shift();
      try {
        const whole = wholeRepos.has(repo.toLowerCase());
        const read = await readRepo(repo, wanted, tmp, whole);
        // In a hand-picked repo the install threshold does not apply
        skills.push(...(whole ? read.map((skill) => ({ ...skill, extra: true })) : read));
      } catch (error) {
        console.warn(`  skipped ${repo}: ${error.message.split("\n")[0]}`);
      }
      done += 1;
      if (done % 20 === 0) console.log(`  ${done}/${byRepo.size} repos read`);
    }
  })
);
await fs.rm(tmp, { recursive: true, force: true });

// An --only run keeps every skill already listed from the other repos
if (only) {
  const existing = JSON.parse(await fs.readFile(OUT, "utf8")).skills;
  skills.push(
    ...existing
      .filter((skill) => !only.has(skill.repo.toLowerCase()))
      .map((skill) => ({ ...skill, extra: true }))
  );
}

// Keep the relevant ones, most installed first, and drop mirrored copies.
const seen = new Set();
const kept = skills
  .filter(
    (skill) => skill.extra || (skill.installs >= MIN_INSTALLS && DESCRIPTION.test(skill.description))
  )
  .sort((a, b) => b.installs - a.installs || a.repo.localeCompare(b.repo))
  .filter((skill) => {
    const key = skill.description.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 160);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .map(({ extra, ...skill }) => ({ ...skill, category: skill.category ?? categorise(skill) }));

for (const extra of only ? [] : EXTRA_SKILLS) {
  if (!kept.some((skill) => skill.repo === extra.repo && skill.name === extra.skillId)) {
    console.warn(`  could not read the hand-picked skill ${extra.repo}/${extra.skillId}`);
  }
}

await fs.writeFile(
  OUT,
  JSON.stringify({ generated: new Date().toISOString().slice(0, 10), skills: kept }, null, 2) + "\n"
);
console.log(`Wrote ${kept.length} skills to ${path.relative(process.cwd(), OUT)}`);
