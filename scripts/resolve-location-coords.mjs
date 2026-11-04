// Resolve lat/lng for every location in src/content/articles/*.mdoc by
// following its gmaps short URL (maps.app.goo.gl/*) to the canonical Google
// Maps URL and extracting the !3d<lat>!4d<lng> coordinate pair.
//
// URLs of the form maps.google.com/?q=... are search queries and cannot be
// resolved to an exact pin — they are reported as skipped.
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

const SHORT_URL = /^https:\/\/maps\.app\.goo\.gl\//;

async function resolveCoords(shortUrl) {
  const res = await fetch(shortUrl, { method: "HEAD", redirect: "follow" });
  const m = res.url.match(/!3d([\d.]+)!4d([\d.]+)/);
  return m ? { lat: m[1], lng: m[2] } : null;
}

// Parse a mdoc file's `locations:` block into an array of items and track
// each field's line index so we can edit lat/lng in place without touching
// surrounding YAML formatting.
function parseLocations(lines) {
  const start = lines.findIndex((l) => /^locations:\s*$/.test(l));
  if (start === -1) return { items: [] };
  const items = [];
  let current = null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("  - ")) {
      if (current) items.push(current);
      current = { urlLine: -1, latLine: -1, lngLine: -1, url: null };
      const idMatch = line.match(/- id:\s*(\S+)/);
      if (idMatch) current.id = idMatch[1];
    } else if (line.startsWith("    ")) {
      if (!current) continue;
      const urlMatch = line.match(/^\s+gmaps:\s*(\S+)/);
      const latMatch = line.match(/^\s+lat:\s*([\d.-]+)/);
      const lngMatch = line.match(/^\s+lng:\s*([\d.-]+)/);
      if (urlMatch) {
        current.urlLine = i;
        current.url = urlMatch[1];
      }
      if (latMatch) {
        current.latLine = i;
        current.lat = latMatch[1];
      }
      if (lngMatch) {
        current.lngLine = i;
        current.lng = lngMatch[1];
      }
    } else if (line.length === 0 || /^[a-zA-Z-]/.test(line)) {
      end = i;
      break;
    }
  }
  if (current) items.push(current);
  return { items, start, end };
}

const files = (await readdir(articlesDir)).filter((f) => f.endsWith(".mdoc"));
let totalFixed = 0;
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
    if (!item.url || !SHORT_URL.test(item.url)) {
      changes.push({
        status: "skip",
        id: item.id,
        reason: item.url ? "not a maps.app.goo.gl URL" : "no gmaps field",
        url: item.url,
      });
      totalSkipped++;
      continue;
    }
    try {
      const r = await resolveCoords(item.url);
      if (!r) {
        changes.push({ status: "skip", id: item.id, reason: "no !3d!4d in redirect", url: item.url });
        totalSkipped++;
        continue;
      }
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
    } catch (e) {
      changes.push({ status: "skip", id: item.id, reason: e.message, url: item.url });
      totalSkipped++;
    }
  }

  const fixes = changes.filter((c) => c.status === "fix");
  const skips = changes.filter((c) => c.status === "skip");
  if (fixes.length === 0 && skips.length === 0) continue;

  console.log(`\n${fname}`);
  for (const f of fixes) {
    console.log(`  ⚠️  ${f.id}: ${f.oldLat},${f.oldLng} → ${f.newLat},${f.newLng}`);
  }
  for (const s of skips) {
    console.log(`  ⏭  ${s.id}: skip (${s.reason})`);
  }

  if (!checkOnly && fixes.length > 0) {
    for (const f of fixes) {
      lines[f.latLine] = lines[f.latLine].replace(
        /lat:\s*[\d.-]+/,
        `lat: ${f.newLat}`
      );
      lines[f.lngLine] = lines[f.lngLine].replace(
        /lng:\s*[\d.-]+/,
        `lng: ${f.newLng}`
      );
    }
    await writeFile(path, lines.join("\n"), "utf-8");
    totalFixed += fixes.length;
  }
}

console.log(
  `\nDone. ${checkOnly ? "(check mode) " : ""}fixed ${totalFixed}, already-correct ${totalOk}, skipped ${totalSkipped}`
);
