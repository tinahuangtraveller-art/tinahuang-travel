# Markdoc Tags 詳細語法參考

這份 knowledge 檔補充 `instructions.md` 裡 Markdoc tag 的完整範例。
Instructions 已有「何時用」的摘要，這裡是「怎麼寫」的樣板。

---

## 1. `{% Affiliate %}` — 聯盟商品 inline tag

**用途**：引用 Klook / Agoda / KKday 等聯盟商品，網站自動 render 成樣式化卡片。

**語法**：

```markdown
需要票券的話可以參考 {% Affiliate slug="klook-sagano-romantic-train" /%}，現場買也可以。

買 {% Affiliate slug="klook-jr-kansai-wide-pass" /%} 可以涵蓋這段。
```

**規則**：
- 大寫 `A`，自閉合用 `/%}` 結尾（不是 `%}`）
- slug 命名：`<平台>-<商品描述>`，全小寫、連字號分隔
- 範例：`klook-haruka-ticket`、`agoda-kyoto-hotel-xxx`、`kkday-kansai-airport-express`
- inline tag，可以塞在句子中間，也可以獨占一行
- **絕對不要**在內文寫死 Klook / Agoda 的真實 URL
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

## 4. Google Maps locations（**不是 Markdoc tag**，放 frontmatter）

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
