// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import keystatic from "@keystatic/astro";
import cloudflare from "@astrojs/cloudflare";
import remarkAffiliate from "./plugins/remark-affiliate.mjs";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: cloudflare({ imageService: "passthrough" }),
  integrations: [react(), keystatic()],
  markdown: {
    remarkPlugins: [remarkAffiliate],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
