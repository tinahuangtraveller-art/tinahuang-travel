# Markdoc Tags 詳細語法參考

這份 knowledge 檔補充 `instructions.md` 裡 Markdoc tag 的完整範例。
Instructions 已有「何時用」的摘要，這裡是「怎麼寫」的樣板。

---

## 1. `{% Affiliate %}` — 聯盟商品 inline tag

**用途**：引用**已註冊**的聯盟商品 slug（主要是 Klook 票券），網站 render 成樣式化卡片（含商品標題 + 平台 badge），點擊會送 GA4 `affiliate_click` 事件。

**語法**：

```markdown
需要票券的話可以參考 {% Affiliate slug="klook-sagano-romantic-train" /%}，現場買也可以。

買 {% Affiliate slug="klook-jr-kansai-wide-pass" /%} 可以涵蓋這段。
```

### 🔒 現有 slug 清單（封閉集合，別亂編）

這些是 `src/data/affiliates.ts` 已註冊的 slug，GPT 只能用這些：

| slug | 商品 |
|---|---|
| `klook-sagano-romantic-train` | 嵯峨野觀光小火車預約 |
| `klook-haruka-ticket` | 關西機場 Haruka 特急票 |
| `klook-jr-kansai-wide-pass` | JR 關西廣域鐵路周遊券 |
| `klook-amanohashidate-ine-tour` | 天橋立＋伊根舟屋一日遊 |
| `klook-miyama-amanohashidate-tour` | 美山＋天橋立一日遊 |
| `klook-katsuoji-miyama-arashiyama-tour` | 勝尾寺＋美山＋嵐山一日遊 |

**如果需要的商品不在清單裡**：
- **不要亂創新 slug**（會 render 成「合作連結整理中」灰色佔位）
- 在輸出後的「聯盟 slug 檢查清單」備註裡標「待新增：建議 slug 名稱 / 商品名 / 平台 / URL（如有）」
- 讓創作者人工補到 `affiliates.ts` 再上線

### 規則
- 大寫 `A`，自閉合用 `/%}` 結尾（不是 `%}`）
- inline tag，可以塞在句子中間，也可以獨占一行
- **絕對不要**用舊語法 `{{AFFILIATE:slug}}`（已廢除）
- 創作者後台用 Keystatic 的「聯盟商品連結」組件也會產同樣語法

---

## 2. `{% Figure %}` — 單張圖片 block tag

**用途**：插入單張圖片，可控大小、對齊、圖說。

**語法**：

```markdown
{% Figure
  src="/images/content/IMAGE:cover.webp"
  alt="嵐山小火車車票"
  size="full"
  align="center"
  caption="票券長這樣" /%}

{% Figure
  src="/images/content/IMAGE:view-01.webp"
  alt="從車窗看出去的保津川"
  size="md"
  align="right" /%}
```

**屬性**：

| 屬性 | 必填 | 選項 | 預設 |
|---|---|---|---|
| `src` | ✅ | `/images/content/IMAGE:<key>.webp` | — |
| `alt` | ✅ | 描述圖片（SEO + 無障礙） | — |
| `size` | | `sm` (~40%) / `md` (~60%) / `lg` (~85%) / `full` (滿版) | `md` |
| `align` | | `center` / `left`（文繞圖右）/ `right`（文繞圖左） | `center` |
| `caption` | | 圖說文字 | 無 |

**規則**：
- Block tag，前後要空一行
- `src` 統一寫 `/images/content/IMAGE:<key>.webp`，創作者會之後把 `IMAGE:<key>` 替換成真實檔名
- 預設幾乎都用 `size="md" align="center"`，需要文繞圖再改 `left`/`right`
- **封面照通常用 `size="full"`**
- 需要獨立圖說 → 必用 Figure（PhotoGrid 內部不支援 caption）

---

## 3. `{% PhotoGrid %}` — 多張圖並排 wrapper tag

**用途**：同一情境 2-6 張相關照片並排（住宿多角度、美食拼盤）。

**語法**：

```markdown
{% PhotoGrid cols="2" %}

![家庭客房](/images/content/IMAGE:family-room-1.webp)

![家庭房內部](/images/content/IMAGE:family-room-2.webp)

{% /PhotoGrid %}

{% PhotoGrid cols="3" %}

![星隅客房 1](/images/content/IMAGE:suite-1.webp)

![星隅客房 2](/images/content/IMAGE:suite-2.webp)

![星隅客房 3](/images/content/IMAGE:suite-3.webp)

{% /PhotoGrid %}
```

**屬性**：

| 屬性 | 必填 | 選項 | 預設 |
|---|---|---|---|
| `cols` | | `"2"` 或 `"3"`（**字串、雙引號**） | `"2"` |

**規則**：
- Block wrapper，有開頭 `{% PhotoGrid cols="2" %}` + 結尾 `{% /PhotoGrid %}`
- `cols` **必須是字串**（寫 `cols="2"` 不是 `cols=2`），不然 Keystatic 讀不到
- **內部圖片一律用標準 markdown `![alt](src)`**，不要用 `{% Figure %}`（Figure 的 width 會跟 grid 打架）
- 手機自動 fallback 單欄
- **什麼時候用**：
  - ✅ 住宿文章：同一房型多角度、同一設施多畫面
  - ✅ 美食文章：多道菜合拼
  - ❌ 單張主圖、需要獨立圖說的照片 → 用 `Figure`
  - ❌ 7 張以上 → 太擠，分段或改用 `Figure`

---

## 4. 住宿訂房連結 + 內文手寫聯盟連結（**不包 Affiliate tag**）

**除了 `{% Affiliate %}` tag 之外**，網站的 Analytics 會自動識別兩類外部連結並送不同的 GA4 事件。寫作時要用對寫法：

### 4a. 住宿文章的訂房 CTA → `booking_click`

當文章類型是 `type: stay` 且 frontmatter 有 `deal.value.bookingUrl` 時，**內文裡用普通 markdown 連結到同一個 URL**，網站會自動偵測並送 `booking_click`：

```markdown
---
type: stay
deal:
  discriminant: true
  value:
    bookingUrl: https://tlathena.ec-hotel.net/webhotel-v4/0761/rmProjects/0245/lucky
---

...

透過 **[專屬連結](https://tlathena.ec-hotel.net/webhotel-v4/0761/rmProjects/0245/lucky)** 預訂享粉絲優惠。
```

- **不要包 `{% Affiliate %}`**（訂房 URL 不是聯盟商品 slug，這樣做會 render 成「合作連結整理中」）
- URL 要**完全等於** `deal.value.bookingUrl`（含參數），比對是精準比對
- 可以在同一篇文章出現多次（例如首屏 CTA + 文末 CTA），每次點都會送 `booking_click`

### 4b. 內文直接寫 Klook / Agoda / 其他聯盟平台連結 → `affiliate_click`

如果創作者有自己的 Klook / KKday / Agoda / Booking / Trip / Expedia / Hotels 短連結，不在 slug 清單裡也懶得註冊，**可以直接寫 markdown 連結**，網站會依 hostname 自動分類：

```markdown
查房價：[Agoda 房價查詢](https://www.agoda.com/zh-tw/xxx-hotel/hotel/all/xxx.html)
```

- 自動分類為 `affiliate_click`（因為 hostname 在白名單）
- **缺點**：GA4 看不到商品標題，只有 hostname；UI 上也沒有樣式化卡片
- **什麼時候用**：臨時推一個沒要長期維護的商品；或創作者還沒決定要不要正式註冊
- **什麼時候不要用**：會重複出現的主打商品 → 註冊 slug 用 `{% Affiliate %}` 比較好

### 4c. 其他外部連結 → `outbound_click`

連結到飯店官網、新聞、政府網站等**非聯盟平台**，自動分類為 `outbound_click`：

```markdown
詳見[飯店官方網站](https://www.cuncyue.com/)。
```

不用做任何特殊標記。

### 一張決策表

| 情境 | 寫法 |
|---|---|
| 住宿訂房 CTA（有合作，URL 已填 `deal.bookingUrl`） | `[按此訂房](URL)` markdown 連結，不包 Affiliate |
| 已註冊的聯盟商品 slug | `{% Affiliate slug="..." /%}` |
| 聯盟平台連結但沒 slug | `[文字](https://klook.com/...)` markdown 連結 |
| 飯店官網、政府網站、新聞 | `[文字](URL)` markdown 連結 |

---

## 5. Google Maps locations（**不是 Markdoc tag**，放 frontmatter）

**不要在內文**嵌入 Google Maps 連結。改放 frontmatter 的 `locations` 陣列：

```yaml
locations:
  - id: arashiyama-saga
    name: 嵯峨野觀光鐵道 嵯峨站
    gmaps: https://maps.app.goo.gl/<真實短網址>
    category: transport
    lat: 35.0188
    lng: 135.6797
```

- `id`：英文 kebab-case，唯一
- `name`：中文地點名
- `gmaps`：**真實 Google Maps 短網址**（`maps.app.goo.gl/XXXX` 格式，隨機字元），**不要寫 placeholder**（寫 `CuncyueHotel` 這種英文字會 404）
- `category`：`attraction` / `food` / `stay` / `transport`
- `lat` / `lng`：如果沒有 gmaps，有 lat/lng 程式會 fallback 用座標開 Google Maps

網站會自動用這些 locations 渲染「這篇攻略的 N 個景點」互動地圖，不需要在內文重複連結。
