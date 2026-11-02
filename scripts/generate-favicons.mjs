import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const projectRoot = resolve(__dirname, "..");
const publicDir = resolve(projectRoot, "public");

const AVATAR_SRC = resolve(publicDir, "avatar.jpg");

// generate PNG favicons from avatar for app icons
const appIconSizes = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

const avatar = sharp(AVATAR_SRC);
const meta = await avatar.metadata();
const square = Math.min(meta.width, meta.height);
const left = Math.floor((meta.width - square) / 2);
const top = Math.floor((meta.height - square) / 2);

for (const { name, size } of appIconSizes) {
  await sharp(AVATAR_SRC)
    .extract({ left, top, width: square, height: square })
    .resize(size, size)
    .png({ quality: 90 })
    .toFile(resolve(publicDir, name));
  console.log(`✓ ${name} (${size}×${size})`);
}

// SVG favicon with brand colors + handwritten T
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" ry="12" fill="#F2AB47"/>
  <path d="M18 20 Q 32 18, 46 20" stroke="#3D210F" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M32 20 L 32 48 Q 32 52, 36 50" stroke="#3D210F" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="48" cy="18" r="2.5" fill="#FFF8F0"/>
</svg>`;
await writeFile(resolve(publicDir, "favicon.svg"), svg, "utf-8");
console.log("✓ favicon.svg (brand T)");

// PNG fallback at 32px from SVG
await sharp(Buffer.from(svg))
  .resize(32, 32)
  .png()
  .toFile(resolve(publicDir, "favicon-32.png"));
console.log("✓ favicon-32.png (SVG fallback)");

await sharp(Buffer.from(svg))
  .resize(16, 16)
  .png()
  .toFile(resolve(publicDir, "favicon-16.png"));
console.log("✓ favicon-16.png (SVG fallback)");

// web manifest for Android add-to-homescreen
const manifest = {
  name: "跟著黃踢那出發吧！",
  short_name: "黃踢那",
  description: "日本、台灣真實旅行體驗、自由行攻略與旅宿分享",
  theme_color: "#F2AB47",
  background_color: "#FFF8F0",
  display: "standalone",
  start_url: "/",
  icons: [
    { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
  ],
};
await writeFile(
  resolve(publicDir, "site.webmanifest"),
  JSON.stringify(manifest, null, 2),
  "utf-8"
);
console.log("✓ site.webmanifest");

console.log("\nDone. Update Layout.astro <head> if not already linked.");
