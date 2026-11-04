# Frontmatter Schema｜文章前置資料欄位完整定義

每篇文章的 `.mdoc` 檔案開頭必須有 frontmatter（YAML 格式，用 `---` 包起來）。

## 完整範例

```yaml
---
title: 嵐山小火車完整攻略｜訂票、座位、下車後怎麼走
excerpt: 實測嵐山小火車坐哪一側風景最好、怎麼訂票、下車 15 分鐘能走到哪些地方。
cover: /images/arashiyama-romantic-train/cover.webp
date: 2026-03-15
updated: 2026-10-20

country: japan
region: kansai
city: 京都
area: arashiyama

type: guide
status: experienced

tags: [嵐山, 小火車, 京都交通]

locations:
  - id: arashiyama-saga
    name: 嵯峨野觀光鐵道 嵯峨站
    gmaps: https://maps.app.goo.gl/example-saga
    category: transport
    lat: 35.0188
    lng: 135.6797
  - id: kinseti-chaya
    name: 琴瀨茶屋
    gmaps: https://maps.app.goo.gl/example-kinseti
    category: food
    lat: 35.0160
    lng: 135.6730

affiliates:
  - klook-sagano-romantic-train
  - klook-haruka-ticket
---
```

## 必填欄位

### `title: 字串`

文章標題。顯示在文章頁 H1、瀏覽器 title、OG image。

**規則**：
- 不含「必去」「超美」「爆款」等字眼
- 建議格式：`主題｜補充描述` 或 `地點 + 類型｜要點`
- 範例：
  - ✅ `嵐山小火車完整攻略｜訂票、座位、下車後怎麼走`
  - ✅ `天橋立 10 個吃喝玩法｜原來京都可以這樣玩 EP3`
  - ❌ `京都必去！嵐山超美小火車推薦`

### `excerpt: 字串，最長 80 字`

摘要。顯示在文章卡、OG description、meta description。

**規則**：
- 1-2 句，講這篇在幹嘛
- 不是標題換句話說，要補充具體細節
- 範例：`實測嵐山小火車坐哪一側風景最好、怎麼訂票、下車 15 分鐘能走到哪些地方。`

### `date: YYYY-MM-DD`

文章首次發布日期。排序用。

### `country: "japan" | "taiwan"`

目前只有這兩個值。

### `type: "guide" | "stay" | "food" | "tips" | "transport"`

文章類型：

- `guide`：景點、路線、玩法攻略
- `stay`：住宿心得
- `food`：餐廳、咖啡廳介紹（純美食主題）
- `tips`：旅行知識、行前準備（如免稅攻略）
- `transport`：交通攻略（如 JR Pass 比較）

### `status: "experienced" | "researched" | "sponsored"`

內容類型（詳見 brand-guidelines.md）：
- `experienced`：親身體驗
- `researched`：純資料整理
- `sponsored`：商業合作（通常搭配 type: stay）

## 強烈建議欄位

### `cover: 絕對路徑字串`

封面圖。顯示在文章頁最上方、文章卡列表、OG image。

**格式**：`/images/<slug>/封面檔名.webp`

範例：`/images/arashiyama-romantic-train/cover.webp`

- 建議是真實有情境的照片
- 不要用 stock photo 或 AI 生圖
- 檔案通常是 .webp 格式（經過我們的 image script 處理後）
- 省略的話文章卡會顯示 fallback 文字

### `updated: YYYY-MM-DD`

最後更新日期。如果和 date 同一天可省略，否則請填。文章頁會顯示「更新於 XXX」。

### `city: 字串`

城市名（中文）。範例：`京都`, `宜蘭`, `苗栗`。

**為什麼重要**：
- 文章頁右側「延伸閱讀」會自動撈同 city 的文章
- `/japan`、`/taiwan` 頁面會顯示 city chip filter
- 動態路由 `/japan/[city]` 需要這個欄位

**省略的時機**：全國性內容（例：免稅攻略、JR Pass 比較）可以省略 city。

### `area: 字串`

更細的地區（例：`arashiyama`, `大湖`）。省略也 OK。

### `region: 字串`

地區（例：`kansai`, `yilan`, `miaoli`）。英文或中文都可，但建議統一。

### `tags: [字串陣列]`

3 個相關中文標籤。範例：`[嵐山, 小火車, 京都交通]`。

### `locations: 陣列`

景點清單。每個 location 包含：

```yaml
- id: unique-slug           # 英文 kebab-case，當 pin 的 anchor
  name: 中文地點名            # 顯示在地圖 popup 和列表
  gmaps: 短網址               # 創作者會提供
  category: attraction | food | stay | transport  # 顯示 icon
  lat: 緯度                   # 可留空，之後補
  lng: 經度                   # 可留空，之後補
```

**category 影響的 icon**：
- `attraction`：📍
- `food`：🍽
- `stay`：🏨
- `transport`：🚉

有 locations（且有 lat/lng）→ 文章頁會自動在 hero 後顯示「這篇攻略的 N 個景點」互動地圖，底部顯示「此行景點」卡片列。

### `affiliates: [slug 陣列]`

聯盟商品 slug 清單，例：`[klook-sagano-romantic-train, klook-haruka-ticket]`。

命名規則：`<平台>-<商品描述>`，全小寫、連字號分隔。

這些 slug 會在內文的 `{% Affiliate slug="..." /%}` Markdoc tag 被對應渲染（新版用 Markdoc，不再用舊的 `{{AFFILIATE:slug}}` placeholder）。

frontmatter 的 `affiliates: []` 陣列是「這篇用到哪些聯盟商品」的 index，網站之後會用來查文章關聯。內文裡的 `{% Affiliate ... /%}` 才是實際 render 卡片的地方。

## 可選欄位（type 為 stay 時用）

### `stay: 物件`

```yaml
stay:
  shortName: 四季山宿
  checkInDate: 2026-03
  rooms: 寵物房、親子房、包棟
  priceRange: $$  # $ 到 $$$$
```

### `deal: 物件`（有商業合作時）

```yaml
deal:
  active: true
  label: 粉絲專屬
  discount: 現省 30%
  code: TINA168
  validUntil: 2026-12-31
  bookingUrl: https://...
```

網站會自動：
- 顯示 FanDealBadge（含到期倒數，剩 7 天內顯示「⏳ 剩 X 天」）
- 到期後 badge 自動消失，文章繼續存在（降級為一般實住心得）

## 其他

### `draft: true`

草稿模式。設為 true 時文章不會上線、不會出現在列表、不會產出 route。

寫完才改為 false（或刪除此行）。

## 檔名規則

`src/content/articles/<slug>.mdoc`（注意副檔名是 `.mdoc`，不是 `.md`）

**slug 命名**：
- 英文 kebab-case
- 盡量語意化
- 範例：
  - `arashiyama-romantic-train`
  - `kyoto-miyama-kayabuki`
  - `yilan-conch-hotspring`
  - `japan-tax-free-2026`

**不要用**：
- 中文、日文（會造成 URL 編碼問題）
- 底線 `_`（SEO 慣例用連字號）
- 大寫字母

檔案 slug = URL 的 slug，發布後幾乎不能改（SEO 會斷）。命名時要慎重。
