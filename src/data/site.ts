import authorData from "./author/index.json";

export const site = {
  name: "跟著黃踢那出發吧！",
  tagline: "每次更新，都可能是你的下一趟旅行",
  description:
    "每次更新，都可能是你的下一趟旅行！日本、台灣真實旅行體驗、自由行攻略與旅宿分享。",
  author: {
    name: "Tina",
    handle: "黃踢那",
    bio: authorData.bio,
  },
  social: authorData.social,
  nav: [
    { label: "日本", href: "/japan" },
    { label: "台灣", href: "/taiwan" },
    { label: "主題", href: "/themes" },
    { label: "住宿", href: "/stays" },
    { label: "行前準備", href: "/prepare" },
  ],
} as const;
