import type { ArticleEntry } from "./articles";

export type ThemeKey =
  | "hotspring"
  | "family"
  | "food"
  | "roadtrip"
  | "nearby"
  | "oneday";

export type Theme = {
  key: ThemeKey;
  slug: string;
  label: string;
  emoji: string;
  description: string;
  match: (article: ArticleEntry) => boolean;
};

const hasTag = (article: ArticleEntry, keywords: string[]) =>
  article.data.tags.some((t) =>
    keywords.some((k) => t.toLowerCase().includes(k.toLowerCase()))
  );

const titleOrExcerptHas = (article: ArticleEntry, keywords: string[]) => {
  const haystack = `${article.data.title} ${article.data.excerpt}`.toLowerCase();
  return keywords.some((k) => haystack.includes(k.toLowerCase()));
};

export const themes: Theme[] = [
  {
    key: "hotspring",
    slug: "hotspring",
    label: "溫泉",
    emoji: "♨️",
    description: "從北投到羅東、從京都到北海道，實際泡過的溫泉旅宿與湯屋。",
    match: (a) =>
      hasTag(a, ["溫泉", "湯", "hotspring"]) ||
      titleOrExcerptHas(a, ["溫泉", "湯屋", "泡湯"]),
  },
  {
    key: "family",
    slug: "family",
    label: "親子",
    emoji: "👨‍👩‍👧",
    description: "帶爸媽、帶小孩都友善的行程、住宿、交通安排。",
    match: (a) =>
      hasTag(a, ["親子", "家族", "包棟"]) ||
      titleOrExcerptHas(a, ["親子", "帶爸媽", "帶媽"]),
  },
  {
    key: "food",
    slug: "food",
    label: "美食",
    emoji: "🍜",
    description: "吃過才推的台日在地食堂、甜點、咖啡店。",
    match: (a) =>
      a.data.type === "food" ||
      hasTag(a, ["美食", "食堂", "甜點", "咖啡"]),
  },
  {
    key: "roadtrip",
    slug: "roadtrip",
    label: "自駕",
    emoji: "🚗",
    description: "租車、交通動線、停車位置的實地心得。",
    match: (a) =>
      hasTag(a, ["自駕", "租車", "開車"]) ||
      titleOrExcerptHas(a, ["自駕", "租車"]),
  },
  {
    key: "nearby",
    slug: "nearby",
    label: "近郊",
    emoji: "🚆",
    description: "從大城市出發的半日、一日近郊行程。",
    match: (a) =>
      hasTag(a, ["近郊", "郊外"]) || titleOrExcerptHas(a, ["近郊"]),
  },
  {
    key: "oneday",
    slug: "oneday",
    label: "一日遊",
    emoji: "☀️",
    description: "一天內可以收工的順路行程。",
    match: (a) =>
      hasTag(a, ["一日遊", "半日遊"]) || titleOrExcerptHas(a, ["一日遊", "半日"]),
  },
];

export const themeBySlug = (slug: string) =>
  themes.find((t) => t.slug === slug);

export const getArticlesByTheme = (
  articles: ArticleEntry[],
  theme: Theme
): ArticleEntry[] => articles.filter((a) => theme.match(a));

export const getThemesWithCounts = (articles: ArticleEntry[]) =>
  themes.map((t) => ({
    ...t,
    count: getArticlesByTheme(articles, t).length,
  }));

export const getThemesForArticle = (article: ArticleEntry): Theme[] =>
  themes.filter((t) => t.match(article));
