import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
  tags: {
    Figure: {
      render: component("./src/components/Figure.astro"),
      attributes: {
        src: { type: String },
        alt: { type: String },
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
    PhotoGrid: {
      render: component("./src/components/PhotoGrid.astro"),
      attributes: {
        cols: { type: String, matches: ["2", "3"], default: "2" },
      },
    },
  },
});
