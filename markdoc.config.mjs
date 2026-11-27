import { defineMarkdocConfig, component, nodes, Markdoc } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
  nodes: {
    link: {
      ...nodes.link,
      attributes: {
        ...nodes.link.attributes,
        target: { type: String },
        rel: { type: String },
      },
      transform(node, config) {
        const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);
        return new Markdoc.Tag("a", {
          ...attributes,
          target: "_blank",
          rel: "noopener noreferrer",
        }, children);
      },
    },
  },
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
    PhotoRow: {
      render: component("./src/components/PhotoRow.astro"),
      attributes: {
        img1Src: { type: String },
        img1Alt: { type: String },
        img2Src: { type: String },
        img2Alt: { type: String },
        img3Src: { type: String },
        img3Alt: { type: String },
      },
    },
  },
});
