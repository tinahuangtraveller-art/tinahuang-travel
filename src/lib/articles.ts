import { getCollection, type CollectionEntry } from "astro:content";

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
