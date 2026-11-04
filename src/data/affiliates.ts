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
    url: "https://affiliate.klook.com/sl/1LEfsTD",
  },
  "klook-haruka-ticket": {
    slug: "klook-haruka-ticket",
    title: "關西機場 Haruka 特急票",
    platform: "klook",
    url: "https://affiliate.klook.com/sl/XEebAOn",
  },
  "klook-jr-kansai-wide-pass": {
    slug: "klook-jr-kansai-wide-pass",
    title: "JR 關西廣域鐵路周遊券",
    platform: "klook",
    url: "https://affiliate.klook.com/sl/167Fy2u",
  },
  "klook-amanohashidate-ine-tour": {
    slug: "klook-amanohashidate-ine-tour",
    title: "天橋立＋伊根舟屋一日遊",
    platform: "klook",
    url: "https://affiliate.klook.com/sl/swYkrSU",
  },
  "klook-miyama-amanohashidate-tour": {
    slug: "klook-miyama-amanohashidate-tour",
    title: "美山＋天橋立一日遊",
    platform: "klook",
    url: "https://affiliate.klook.com/sl/17dhxWO",
  },
  "klook-katsuoji-miyama-arashiyama-tour": {
    slug: "klook-katsuoji-miyama-arashiyama-tour",
    title: "勝尾寺＋美山＋嵐山一日遊",
    platform: "klook",
    url: "https://affiliate.klook.com/sl/sUHkTqd",
  },
};

export const getAffiliate = (slug: string): Affiliate | undefined =>
  affiliates[slug];
