// 用法：node scripts/migrate-notion-article.mjs <notion-md-path> <output-slug>
// 處理一篇 Notion 匯出的 md：
// 1. 壓縮 + 轉 WebP 同資料夾所有圖片 → /public/images/<slug>/
// 2. 讀 md 把圖片路徑改成新路徑
// 3. 輸出處理過的 md 到 /tmp/<slug>.md 供人工微調

import { readFile, writeFile, readdir, mkdir, stat } from "node:fs/promises";
import { resolve, extname, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const [, , mdArg, slugArg] = process.argv;
if (!mdArg || !slugArg) {
  console.error("usage: node scripts/migrate-notion-article.mjs <notion-md-path> <slug>");
  process.exit(1);
}

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const projectRoot = resolve(__dirname, "..");
const outImgDir = resolve(projectRoot, "public/images", slugArg);
const outMdPath = resolve("/tmp", `${slugArg}.md`);

const MAX_WIDTH = 1600;
const QUALITY = 78;
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"]);

const toWebName = (name) => {
  const stem = name.replace(/\.(jpe?g|png|webp)$/i, "");
  return stem.replace(/\s+/g, "-").toLowerCase() + ".webp";
};

const mdDir = dirname(mdArg);
const mdBasename = basename(mdArg, ".md").replace(/ [0-9a-f]{32}$/, "");

const imgSrcDir = resolve(mdDir, mdBasename);

await mkdir(outImgDir, { recursive: true });

const files = (await readdir(imgSrcDir)).filter((f) => IMG_EXT.has(extname(f)));

console.log(`\n→ processing ${files.length} images\n`);

let totalIn = 0;
let totalOut = 0;
const nameMap = new Map();

for (const file of files) {
  const src = resolve(imgSrcDir, file);
  const stats = await stat(src);
  totalIn += stats.size;

  const outName = toWebName(file);
  const outPath = resolve(outImgDir, outName);

  await sharp(src)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(outPath);

  const outStats = await stat(outPath);
  totalOut += outStats.size;

  nameMap.set(file, outName);
  const srcKb = (stats.size / 1024).toFixed(0);
  const outKb = (outStats.size / 1024).toFixed(0);
  console.log(`  ${file.padEnd(50)} ${srcKb.padStart(5)}KB → ${outKb.padStart(4)}KB`);
}

console.log(
  `\n  total: ${(totalIn / 1024 / 1024).toFixed(1)}MB → ${(totalOut / 1024 / 1024).toFixed(1)}MB  (-${((1 - totalOut / totalIn) * 100).toFixed(0)}%)\n`
);

let md = await readFile(mdArg, "utf-8");

const imgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
let replaced = 0;
md = md.replace(imgRe, (full, alt, url) => {
  const decoded = decodeURIComponent(url);
  const name = basename(decoded);
  const newName = nameMap.get(name);
  if (!newName) return full;
  replaced++;
  return `![${alt || name}](/images/${slugArg}/${newName})`;
});

console.log(`→ replaced ${replaced} image references in md`);

await writeFile(outMdPath, md, "utf-8");
console.log(`→ wrote cleaned md to ${outMdPath}`);
console.log(`\nnext step: review ${outMdPath}, add frontmatter, copy to src/content/articles/${slugArg}.md\n`);
