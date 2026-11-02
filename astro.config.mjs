// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import remarkAffiliate from "./plugins/remark-affiliate.mjs";

// https://astro.build/config
export default defineConfig({
  output: "static",
  markdown: {
    remarkPlugins: [remarkAffiliate],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
