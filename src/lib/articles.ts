import { getCollection, type CollectionEntry } from "astro:content";
import { getThemesForArticle } from "./themes";

export type ArticleEntry = CollectionEntry<"articles">;

const notDraft = ({ data }: ArticleEntry) => !data.draft;

export const getAllArticles = async () => {
  const list = await getCollection("articles", notDraft);
  return list.sort((a, b) => +b.data.date - +a.data.date);
};

export const getArticlesByCountry = async (country: "japan" | "taiwan") => {
  const all = await getAllArticles();
  return all.filter((a) => a.data.country === country);
};

export const getArticlesByCity = async (city: string) => {
  const all = await getAllArticles();
  return all.filter((a) => a.data.city === city);
};

export const slugOf = (article: ArticleEntry) =>
  article.id.replace(/\.md$/, "");

export const hrefOf = (article: ArticleEntry) =>
  `/articles/${slugOf(article)}`;

export const groupByCity = (articles: ArticleEntry[]) => {
  const map = new Map<string, ArticleEntry[]>();
  for (const a of articles) {
    const city = a.data.city || "其他";
    if (!map.has(city)) map.set(city, []);
    map.get(city)!.push(a);
  }
  return map;
};

export const countryLabel = (c: "japan" | "taiwan") =>
  c === "japan" ? "日本" : "台灣";

export const getRelatedArticles = async (
  current: ArticleEntry,
  limit = 4
) => {
  const all = await getAllArticles();
  const others = all.filter((a) => a.id !== current.id);

  const currentThemeKeys = new Set(
    getThemesForArticle(current).map((t) => t.key)
  );

  const score = (a: ArticleEntry) => {
    let s = 0;
    if (a.data.city && a.data.city === current.data.city) s += 4;
    if (a.data.country === current.data.country) s += 1;
    const themeMatch = getThemesForArticle(a).some((t) =>
      currentThemeKeys.has(t.key)
    );
    if (themeMatch) s += 3;
    return s;
  };

  return others
    .map((a) => ({ a, s: score(a) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || +y.a.data.date - +x.a.data.date)
    .slice(0, limit)
    .map((x) => x.a);
};
