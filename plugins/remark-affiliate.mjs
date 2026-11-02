import { visit } from "unist-util-visit";

const AFFILIATE_RE = /\{\{AFFILIATE:([a-z0-9-]+)\}\}/g;

export default function remarkAffiliate() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (!AFFILIATE_RE.test(node.value)) return;
      AFFILIATE_RE.lastIndex = 0;

      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = AFFILIATE_RE.exec(node.value)) !== null) {
        const [full, slug] = match;
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            value: node.value.slice(lastIndex, match.index),
          });
        }
        parts.push({
          type: "html",
          value: `<a href="#" data-affiliate="${slug}" class="affiliate-stub" rel="noopener noreferrer sponsored"><span aria-hidden="true">📎</span><span>${slug}</span><span class="affiliate-stub__note">· 連結建置中</span></a>`,
        });
        lastIndex = match.index + full.length;
      }

      if (lastIndex < node.value.length) {
        parts.push({ type: "text", value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...parts);
    });
  };
}
