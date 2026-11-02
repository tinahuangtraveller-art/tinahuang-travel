export type Deal = {
  active: boolean;
  label: string;
  discount: string;
  code?: string;
  validUntil: string;
  bookingUrl: string;
};

export type Stay = {
  slug: string;
  name: string;
  location: string;
  country: "japan" | "taiwan";
  city: string;
  checkInDate: string;
  cover?: string;
  summary: string;
  status: "experienced" | "sponsored";
  articleUrl: string;
  deal?: Deal;
};

export const stays: Stay[] = [
  {
    slug: "miaoli-dahu-four-season",
    name: "四季山宿",
    location: "苗栗 · 大湖",
    country: "taiwan",
    city: "苗栗",
    checkInDate: "2026-03",
    cover: "/images/miaoli-dahu-four-season/dscf5816.webp",
    summary: "6–30 人包棟、山景遼闊，一樓有親子房與寵物房。回來最想念那片山景。",
    status: "sponsored",
    articleUrl: "/articles/miaoli-dahu-four-season",
    deal: {
      active: true,
      label: "粉絲專屬",
      discount: "現省 30%",
      code: "TINA168",
      validUntil: "2026-12-31",
      bookingUrl: "https://booking.lakeze.com/season",
    },
  },
  {
    slug: "yilan-villa-conch",
    name: "村卻國際溫泉酒店",
    location: "宜蘭 · 羅東",
    country: "taiwan",
    city: "宜蘭",
    checkInDate: "2026-10",
    cover: "/images/yilan-conch-hotspring/image.webp",
    summary: "18 坪星隅客房房內有雙湯池，不用再跑大眾湯；頂樓可看蘭陽夜景。",
    status: "sponsored",
    articleUrl: "/articles/yilan-conch-hotspring",
    deal: {
      active: true,
      label: "粉絲限定升等",
      discount: "一泊一食 NT$6,400 起",
      validUntil: "2027-01-31",
      bookingUrl: "https://tlathena.ec-hotel.net/webhotel-v4/0761/rmProjects/0245/lucky",
    },
  },
];

export const getActiveDeals = () =>
  stays.filter((s) => s.deal?.active && new Date(s.deal.validUntil) >= new Date());
