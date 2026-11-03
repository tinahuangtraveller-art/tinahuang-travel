import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
  tags: {
    Figure: {
      render: component("./src/components/Figure.astro"),
      attributes: {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        size: {
          type: String,
          matches: ["sm", "md", "lg", "full"],
          default: "md",
        },
        align: {
          type: String,
          matches: ["left", "right", "center"],
          default: "center",
        },
        caption: { type: String },
      },
    },
    Affiliate: {
      render: component("./src/components/AffiliateInline.astro"),
      attributes: {
        slug: { type: String, required: true },
      },
    },
    Reel: {
      render: component("./src/components/IgReel.astro"),
      attributes: {
        url: { type: String, required: true },
        cover: { type: String },
        caption: { type: String },
        variant: {
          type: String,
          matches: ["card", "mini"],
          default: "card",
        },
      },
    },
  },
});
