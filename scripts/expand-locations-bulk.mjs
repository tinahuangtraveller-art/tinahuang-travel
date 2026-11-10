// Expand the `locationsImport:` field into `locations:` items, then clear
// `locationsImport:` from the frontmatter.
//
// Workflow:
//   1. User pastes YAML items into Keystatic's "批次匯入景點" field
//   2. On push, this script finds files with non-empty `locationsImport:`
//   3. Appends the pasted items to `locations:` (preserving existing items)
//   4. Removes the `locationsImport:` block
//   5. The subsequent `resolve-location-coords.mjs` step fills in lat/lng
//
// The paste format is raw YAML items (not nested under a parent key):
//   - id: shirahige-shrine
//     name: 白鬚神社
//     gmaps: https://maps.app.goo.gl/XpmsSS61xbzmdm8H7
//     category: attraction
//
// Usage:
//   node scripts/expand-locations-bulk.mjs           # write in place
//   node scripts/expand-locations-bulk.mjs --check   # dry-run

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const articlesDir = resolve(__dirname, "../src/content/articles");
const checkOnly = process.argv.includes("--check");

// Find the `locationsImport:` block header and its multiline content.
// Keystatic serializes multiline text as `locationsImport: |-` / `|` / `>-`
// followed by 2-space-indented lines.
function findImportBlock(lines) {
  const headerIdx = lines.findIndex((l) =>
    /^locationsImport:\s*(\||>-?|\|-)?\s*$/.test(l)
  );
  if (headerIdx === -1) return null;

  const contentLines = [];
  let endIdx = headerIdx;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === "") {
      contentLines.push("");
      endIdx = i;
      continue;
    }
    // Indented 2+ spaces = part of the block
    if (line.startsWith("  ")) {
      contentLines.push(line.substring(2));
      endIdx = i;
      continue;
    }
    // Any non-indented line ends the block
    break;
  }

  const text = contentLines.join("\n").trim();
  return { headerIdx, endIdx, text };
}

// Find the `locations:` block header and its last item's line index (or the
// header itself if there are no items yet).
function findLocationsBlock(lines) {
  const headerIdx = lines.findIndex((l) => /^locations:\s*(\[\])?\s*$/.test(l));
  if (headerIdx === -1) return null;

  let lastItemLine = headerIdx;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("  ")) {
      lastItemLine = i;
      continue;
    }
    if (line === "") continue;
    break;
  }
  return { headerIdx, lastItemLine };
}

// Re-indent a block of raw YAML items (items at col 0) to live under a parent
// key at col 0 (items at col 2, fields at col 4).
function reindentForLocations(text) {
  return text
    .split("\n")
    .map((line) => (line === "" ? "" : "  " + line))
    .join("\n");
}

const files = (await readdir(articlesDir)).filter((f) => f.endsWith(".mdoc"));
let totalFiles = 0;
let totalItems = 0;

for (const fname of files) {
  const path = join(articlesDir, fname);
  const content = await readFile(path, "utf-8");
  const lines = content.split("\n");

  const importBlock = findImportBlock(lines);
  if (!importBlock || importBlock.text === "") continue;

  const locationsBlock = findLocationsBlock(lines);
  if (!locationsBlock) {
    console.log(
      `${fname}: has locationsImport but no 'locations:' field — skipping`
    );
    continue;
  }

  const itemCount = (importBlock.text.match(/^- /gm) || []).length;
  console.log(`${fname}: expanding ${itemCount} item(s) from locationsImport`);
  totalFiles++;
  totalItems += itemCount;

  if (checkOnly) continue;

  const newItems = reindentForLocations(importBlock.text).split("\n");

  const output = [];
  let skipUntil = -1;
  for (let i = 0; i < lines.length; i++) {
    if (i <= skipUntil) continue;
    if (i === importBlock.headerIdx) {
      skipUntil = importBlock.endIdx;
      continue;
    }
    // Normalize `locations: []` → `locations:` so appended items are valid YAML
    if (i === locationsBlock.headerIdx) {
      output.push(lines[i].replace(/^(locations:)\s*\[\]\s*$/, "$1"));
    } else {
      output.push(lines[i]);
    }
    if (i === locationsBlock.lastItemLine) {
      output.push(...newItems);
    }
  }

  await writeFile(path, output.join("\n"), "utf-8");
}

console.log(
  `\nDone. ${checkOnly ? "(check mode) " : ""}expanded ${totalItems} item(s) across ${totalFiles} file(s)`
);
