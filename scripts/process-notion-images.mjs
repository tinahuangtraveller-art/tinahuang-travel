import { readdir, mkdir, stat } from "node:fs/promises";
import { resolve, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const [, , srcArg, slugArg] = process.argv;
if (!srcArg || !slugArg) {
  console.error("usage: node scripts/process-notion-images.mjs <src-dir> <slug>");
  process.exit(1);
}

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const projectRoot = resolve(__dirname, "..");
const outDir = resolve(projectRoot, "public/images", slugArg);

const MAX_WIDTH = 1600;
const QUALITY = 78;
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"]);

await mkdir(outDir, { recursive: true });

const files = (await readdir(srcArg))
  .filter((f) => IMG_EXT.has(extname(f)))
  .sort();

console.log(`\n→ processing ${files.length} images from`);
console.log(`  ${srcArg}`);
console.log(`→ output to /public/images/${slugArg}/\n`);

const mapping = [];
let totalIn = 0;
let totalOut = 0;

for (let i = 0; i < files.length; i++) {
  const src = resolve(srcArg, files[i]);
  const stats = await stat(src);
  totalIn += stats.size;

  const paddedIndex = String(i + 1).padStart(2, "0");
  const outName = `${paddedIndex}.webp`;
  const outPath = resolve(outDir, outName);

  await sharp(src)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(outPath);

  const outStats = await stat(outPath);
  totalOut += outStats.size;

  mapping.push({ src: files[i], out: outName });

  const srcKb = (stats.size / 1024).toFixed(0);
  const outKb = (outStats.size / 1024).toFixed(0);
  const saved = ((1 - outStats.size / stats.size) * 100).toFixed(0);
  console.log(
    `  ${paddedIndex}. ${files[i].padEnd(50)} ${srcKb.padStart(5)}KB → ${outKb.padStart(4)}KB  (-${saved}%)`
  );
}

console.log(`\n  total: ${(totalIn / 1024 / 1024).toFixed(1)}MB → ${(totalOut / 1024 / 1024).toFixed(1)}MB`);
console.log(`  saved: ${((1 - totalOut / totalIn) * 100).toFixed(1)}%\n`);

console.log("--- mapping (old → new) ---");
for (const m of mapping) {
  console.log(`  ${m.src}  →  /images/${slugArg}/${m.out}`);
}
