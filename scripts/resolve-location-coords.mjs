// Resolve lat/lng for every location in src/content/articles/*.mdoc by
// following its gmaps short URL (maps.app.goo.gl/*) to the canonical Google
// Maps URL and extracting the !3d<lat>!4d<lng> coordinate pair.
//
// URLs of the form maps.google.com/?q=... are search queries and cannot be
// resolved to an exact pin — they are reported as skipped.
//
// Handles three cases:
//   1. Item has gmaps URL and wrong lat/lng → fix in place
//   2. Item has gmaps URL and missing lat/lng → insert after category line
//   3. Item has no gmaps URL → skip, report
//
// Usage:
//   bun scripts/resolve-location-coords.mjs           # write fixes in place
//   bun scripts/resolve-location-coords.mjs --check   # dry-run

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const articlesDir = resolve(__dirname, "../src/content/articles");
const checkOnly = process.argv.includes("--check");

const RESOLVABLE = /^https:\/\/(maps\.app\.goo\.gl\/|(www\.)?google\.(com|co\.jp)\/maps\/place\/)/;

async function resolveCoords(url) {
  // Format 1: google.com/maps/place/.../@lat,lng/... or /!3d!4d - coords inline
  const inline =
    url.match(/!3d([\d.]+)!4d([\d.]+)/) ||
    url.match(/\/@([\d.-]+),([\d.-]+)/);
  if (inline) return { lat: inline[1], lng: inline[2] };

  // Format 2: maps.app.goo.gl/* - follow redirect to get canonical URL
  if (/^https:\/\/maps\.app\.goo\.gl\//.test(url)) {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const m = res.url.match(/!3d([\d.]+)!4d([\d.]+)/);
    return m ? { lat: m[1], lng: m[2] } : null;
  }
  return null;
}

function parseLocations(lines) {
  const start = lines.findIndex((l) => /^locations:\s*$/.test(l));
  if (start === -1) return { items: [] };
  const items = [];
  let current = null;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("  - ")) {
      if (current) items.push(current);
      current = {
        startLine: i,
        lastLine: i,
        urlLine: -1,
        latLine: -1,
        lngLine: -1,
      };
      const idMatch = line.match(/- id:\s*(\S+)/);
      if (idMatch) current.id = idMatch[1];
    } else if (line.startsWith("    ")) {
      if (!current) continue;
      current.lastLine = i;
      const urlMatch = line.match(/^\s+gmaps:\s*(\S+)/);
      const latMatch = line.match(/^\s+lat:\s*([\d.-]+|null)?\s*$/);
      const lngMatch = line.match(/^\s+lng:\s*([\d.-]+|null)?\s*$/);
      if (urlMatch) {
        current.urlLine = i;
        current.url = urlMatch[1];
      }
      if (latMatch) {
        current.latLine = i;
        current.lat = latMatch[1] === "null" ? undefined : latMatch[1];
      }
      if (lngMatch) {
        current.lngLine = i;
        current.lng = lngMatch[1] === "null" ? undefined : lngMatch[1];
      }
    } else if (line.length === 0 || /^[a-zA-Z-]/.test(line)) {
      break;
    }
  }
  if (current) items.push(current);
  return { items };
}

const files = (await readdir(articlesDir)).filter((f) => f.endsWith(".mdoc"));
let totalFixed = 0;
let totalInserted = 0;
let totalOk = 0;
let totalSkipped = 0;

for (const fname of files) {
  const path = join(articlesDir, fname);
  const content = await readFile(path, "utf-8");
  const lines = content.split("\n");
  const { items } = parseLocations(lines);
  if (items.length === 0) continue;

  const changes = [];
  for (const item of items) {
    if (!item.url) {
      changes.push({ status: "skip", id: item.id, reason: "no gmaps field" });
      totalSkipped++;
      continue;
    }
    if (!RESOLVABLE.test(item.url)) {
      changes.push({
        status: "skip",
        id: item.id,
        reason: "unresolvable URL format (need maps.app.goo.gl/* or google.com/maps/place/...)",
      });
      totalSkipped++;
      continue;
    }
    try {
      const r = await resolveCoords(item.url);
      if (!r) {
        changes.push({ status: "skip", id: item.id, reason: "no !3d!4d in redirect" });
        totalSkipped++;
        continue;
      }
      const hasLat = item.lat !== undefined;
      const hasLng = item.lng !== undefined;
      if (hasLat && hasLng) {
        const dLat = Math.abs(parseFloat(r.lat) - parseFloat(item.lat));
        const dLng = Math.abs(parseFloat(r.lng) - parseFloat(item.lng));
        if (dLat < 1e-4 && dLng < 1e-4) {
          totalOk++;
          continue;
        }
        changes.push({
          status: "fix",
          id: item.id,
          oldLat: item.lat,
          oldLng: item.lng,
          newLat: r.lat,
          newLng: r.lng,
          latLine: item.latLine,
          lngLine: item.lngLine,
        });
      } else {
        changes.push({
          status: "insert",
          id: item.id,
          newLat: r.lat,
          newLng: r.lng,
          insertAfter: item.lastLine,
        });
      }
    } catch (e) {
      changes.push({ status: "skip", id: item.id, reason: e.message });
      totalSkipped++;
    }
  }

  const hasWork = changes.some(
    (c) => c.status === "fix" || c.status === "insert"
  );
  const relevantSkips = changes.filter((c) => c.status === "skip");
  if (!hasWork && relevantSkips.length === 0) continue;

  console.log(`\n${fname}`);
  for (const c of changes) {
    if (c.status === "fix") {
      console.log(
        `  ⚠️  fix    ${c.id}: ${c.oldLat},${c.oldLng} → ${c.newLat},${c.newLng}`
      );
    } else if (c.status === "insert") {
      console.log(`  ➕  insert ${c.id}: lat/lng → ${c.newLat},${c.newLng}`);
    } else {
      console.log(`  ⏭  skip   ${c.id}: ${c.reason}`);
    }
  }

  if (checkOnly || !hasWork) continue;

  // Apply changes bottom-up so earlier line indices stay valid
  const ops = changes
    .filter((c) => c.status === "fix" || c.status === "insert")
    .sort((a, b) => {
      const aLine = a.status === "fix" ? Math.max(a.latLine, a.lngLine) : a.insertAfter;
      const bLine = b.status === "fix" ? Math.max(b.latLine, b.lngLine) : b.insertAfter;
      return bLine - aLine;
    });
  for (const op of ops) {
    if (op.status === "fix") {
      lines[op.latLine] = lines[op.latLine].replace(
        /lat:\s*([\d.-]+|null)?/,
        `lat: ${op.newLat}`
      );
      lines[op.lngLine] = lines[op.lngLine].replace(
        /lng:\s*([\d.-]+|null)?/,
        `lng: ${op.newLng}`
      );
      totalFixed++;
    } else if (op.status === "insert") {
      lines.splice(
        op.insertAfter + 1,
        0,
        `    lat: ${op.newLat}`,
        `    lng: ${op.newLng}`
      );
      totalInserted++;
    }
  }
  await writeFile(path, lines.join("\n"), "utf-8");
}

console.log(
  `\nDone. ${checkOnly ? "(check mode) " : ""}fixed ${totalFixed}, inserted ${totalInserted}, already-correct ${totalOk}, skipped ${totalSkipped}`
);
