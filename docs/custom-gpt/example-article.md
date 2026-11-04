# 範本文章｜天橋立 10 個玩法

> 這是「標準格式」範本，產出新文章時可以當作結構和語氣的參考。
> 這篇是真實的「experienced」類型多景點景點攻略，涵蓋 frontmatter 大多數常用欄位、locations 多 pin、Markdoc Affiliate/Figure tag、交通建議等常見元素。
>
> 注意副檔名是 `.mdoc`，不是 `.md`。

---

## 完整檔案內容（`src/content/articles/amanohashidate-10-ways.mdoc`）

```mdoc
---
title: 天橋立 10 個吃喝玩法｜原來京都可以這樣玩 EP3
excerpt: 實際走訪天橋立整理的 10 個玩法：吊椅、飛龍觀、海邊踩水、蟹肉飯、咖啡廳與交通。
date: 2026-10-21
updated: 2026-10-21

country: japan
region: kansai
city: 京都
area: amanohashidate

type: guide
status: experienced

tags: [天橋立, 京都近郊, 一日遊]

locations:
  - id: viewland-base
    name: 天橋立 View Land 山下乘車處
    gmaps: https://maps.app.goo.gl/xCmoz6JLeKeEjgSj9
    category: transport
    lat: 35.5618
    lng: 135.1950
  - id: sandbar
    name: 天橋立沙洲
    gmaps: https://maps.app.goo.gl/VnV7DomqouayTuLE7
    category: attraction
    lat: 35.5660
    lng: 135.1897
  - id: cafe-du-pin
    name: Cafe du Pin（廻旋橋旁水岸咖啡）
    gmaps: https://maps.app.goo.gl/xLzAXjujJ7rWFY847
    category: food
    lat: 35.5631
    lng: 135.1910

affiliates:
  - klook-jr-kansai-wide-pass
  - klook-amanohashidate-ine-tour
---

> 🌊 **原來京都可以這樣玩！EP3｜天橋立 10 個吃喝玩法**
>
> 這 10 個是我實際走訪天橋立後整理的玩法（空中腳踏車是現場拍攝，沒有親自搭乘）。
> 除了經典的飛龍觀，還有空中腳踏車、海邊踩水、蟹肉飯與水岸咖啡廳。
> 可以依自己喜好挑選，不一定要全部排進同一天。

## 🚠 ①–⑥ 天橋立 View Land

### ① 登山吊椅｜我很推薦的上山方式

導航山下乘車處，可搭吊椅或單軌列車上下山；依當天天氣與現場公告選擇。

{% Figure
  src="/images/content/IMAGE:chairlift-up.webp"
  alt="天橋立登山吊椅視角，兩旁是松林"
  size="md"
  align="center"
  caption="搭吊椅上山時可以用腳體感高度，建議穿長褲" /%}

### ③ 空中腳踏車｜從高處看風景

找「サイクルカー」。參考費用：單人 ¥400、雙人 ¥800。

> 📝 這個我有拍到體驗畫面，但**不是我親自搭乘**，價格請以現場為準。

{% Figure
  src="/images/content/IMAGE:cycle-car.webp"
  alt="空中腳踏車架設在軌道上，背景是天橋立風景"
  size="md"
  align="right" /%}

[... 其餘 section 省略 ...]

## 🚌 交通怎麼選？

### 🚆 自由行：JR 特急 + 京都丹後鐵道

京都出發可搭特急 HASHIDATE 前往天橋立。買 {% Affiliate slug="klook-jr-kansai-wide-pass" /%} 可以涵蓋這段。

**如果只去天橋立一天，先比較單買來回車票是否更省錢**。

### 🧳 不想研究交通：天橋立 + 伊根舟屋一日遊

從大阪/京都直接參加 {% Affiliate slug="klook-amanohashidate-ine-tour" /%} 一日團，不用自己研究時刻表。

> ⚠️ 各團停留時間、集合地點及包含項目可能不同。
> 一日團僅供比較，**不代表我親自參加過這個團**。

---

**資訊核對：2026/10/21。** 票價、營業、交通班次及各項設施開放情況可能調整，請以出發當日官方公告為準。
```

---

## 結構拆解

| 段落 | 作用 |
|---|---|
| frontmatter | 所有結構化資料。網站會根據這個產生：OG image、相關文章、城市 chip、景點地圖、badge |
| 開頭 blockquote | 引言、情境設定 + 事實說明（哪些親身哪些拍攝） |
| H2 分區 | 內容的大主題。每個 H2 下方會有橘色短線 |
| H3 子題 | 細節點 |
| 內文 blockquote `📝` | 誠信揭露、不確定資訊 |
| 內文 blockquote `⚠️` | 給讀者的警告或提醒 |
| `{% Figure src="..." alt="..." size="..." align="..." /%}` | 單張圖片 block tag，可控大小/對齊/圖說 |
| `{% PhotoGrid cols="2" %}...{% /PhotoGrid %}` | 2-3 張同主題圖並排 wrapper，內部用 `![alt](src)` |
| `{% Affiliate slug="..." /%}` | 聯盟商品 inline tag，網站會渲染成卡片 |
| 文末資訊核對日期 | 讓讀者知道這篇是什麼時候整理的 |

## 其他常見類型快速參考

### Researched 類型文章開頭

```markdown
> ✈️ **最重要提醒**：XXX
>
> 本攻略依官方公告整理，**不是黃踢那親自實測的心得**。

**資料查核日期：YYYY/MM/DD｜適用：XXX**
```

### Sponsored stay 類型 frontmatter 範例

```yaml
---
title: XXX 飯店｜黃踢那粉絲住房優惠 + 實住攻略
type: stay
status: sponsored

stay:
  shortName: XXX 飯店
  checkInDate: 2026-10
  rooms: 雙人房、親子房
  priceRange: $$$

deal:
  active: true
  label: 粉絲專屬
  discount: 現省 20%
  code: TINA2026
  validUntil: 2027-01-31
  bookingUrl: https://...
---
```

### 混合型（experienced + 1 段 researched）範例

```markdown
## 1. 這家餐廳我吃過

[親身心得...]

## 2. 這家我沒去過

> 📝 這段是整理，我沒親自去過，但有去過的粉絲回饋還不錯。

[基本資訊...]
```
