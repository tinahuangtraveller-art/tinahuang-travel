export type Affiliate = {
  slug: string;
  title: string;
  platform: "klook" | "kkday" | "other";
  url?: string;
  note?: string;
};

export const affiliates: Record<string, Affiliate> = {
  "klook-sagano-romantic-train": {
    slug: "klook-sagano-romantic-train",
    title: "嵯峨野觀光小火車預約",
    platform: "klook",
  },
  "klook-haruka-ticket": {
    slug: "klook-haruka-ticket",
    title: "關西機場 Haruka 特急票",
    platform: "klook",
  },
  "klook-jr-kansai-wide-pass": {
    slug: "klook-jr-kansai-wide-pass",
    title: "JR 關西廣域鐵路周遊券",
    platform: "klook",
  },
  "klook-amanohashidate-ine-tour": {
    slug: "klook-amanohashidate-ine-tour",
    title: "天橋立＋伊根舟屋一日遊",
    platform: "klook",
  },
};

export const getAffiliate = (slug: string): Affiliate | undefined =>
  affiliates[slug];
