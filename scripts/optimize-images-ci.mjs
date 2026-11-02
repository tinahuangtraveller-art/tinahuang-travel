// CI script: find raw .jpg/.jpeg/.png in public/images/, convert to WebP + resize,
// delete originals, and update markdown references.

import { readFile, writeFile, readdir, stat, unlink } from "node:fs/promises";
import { resolve, extname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const projectRoot = resolve(__dirname, "..");
const imagesDir = resolve(projectRoot, "public/images");
const articlesDir = resolve(projectRoot, "src/content/articles");

const RAW_EXT = /\.(jpe?g|png)$/i;
const MAX_WIDTH = 1600;
const QUALITY = 78;

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (RAW_EXT.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = await walk(imagesDir).catch(() => []);
console.log(`Found ${files.length} raw image(s)`);

let converted = 0;
let totalIn = 0;
let totalOut = 0;

for (const file of files) {
  const parsed = parse(file);
  const webpPath = join(parsed.dir, parsed.name + ".webp");

  const srcStat = await stat(file);
  totalIn += srcStat.size;

  await sharp(file)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(webpPath);

  const outStat = await stat(webpPath);
  totalOut += outStat.size;

  await unlink(file);

  console.log(
    `  ${parsed.base} → ${parsed.name}.webp (${(srcStat.size / 1024).toFixed(0)}KB → ${(outStat.size / 1024).toFixed(0)}KB)`
  );
  converted++;
}

if (converted > 0) {
  console.log(
    `\nTotal: ${(totalIn / 1024 / 1024).toFixed(1)}MB → ${(totalOut / 1024 / 1024).toFixed(1)}MB`
  );
}

// Update markdown references: /images/.../photo.jpg → /images/.../photo.webp
const mdFiles = await walk(articlesDir).catch(() => []);
let mdUpdated = 0;

for (const md of mdFiles) {
  if (!md.endsWith(".md")) continue;
  const content = await readFile(md, "utf-8");
  const updated = content.replace(
    /(\(\/images\/[^)]+?)\.(jpe?g|png)(\))/gi,
    "$1.webp$3"
  );
  if (updated !== content) {
    await writeFile(md, updated, "utf-8");
    console.log(`  updated refs in ${parse(md).base}`);
    mdUpdated++;
  }
}

console.log(
  `\nDone. ${converted} image(s) converted, ${mdUpdated} markdown file(s) updated.`
);
