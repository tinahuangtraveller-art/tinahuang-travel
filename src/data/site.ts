export const site = {
  name: "跟著黃踢那出發吧！",
  tagline: "每次更新，都可能是你的下一趟旅行",
  description:
    "每次更新，都可能是你的下一趟旅行！日本、台灣真實旅行體驗、自由行攻略與旅宿分享。",
  author: {
    name: "Tina",
    handle: "黃踢那",
    bio: {
      hook: "2026 裸辭了 👀",
      body: "離開年薪百萬的工程師主管，給自己一年，挑戰靠旅行與攝影養活自己。",
      now: "帶媽京都 30 天",
      content: "台日旅行・在地故事・實住旅宿",
    },
  },
  social: {
    instagram: "https://www.instagram.com/tinahuang.traveller/",
    instagramDM: "https://ig.me/m/tinahuang.traveller",
    threads: "https://www.threads.com/@tinahuang.traveller",
    facebook: "https://www.facebook.com/profile.php?id=61592672927713",
    lineCommunity: "https://reurl.cc/KE4eny",
    email: "tinahuang.traveller@gmail.com",
  },
  nav: [
    { label: "日本", href: "/japan" },
    { label: "台灣", href: "/taiwan" },
    { label: "行前準備", href: "/prepare" },
    { label: "關於", href: "/about" },
  ],
} as const;
