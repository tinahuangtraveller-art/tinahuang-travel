# 黃踢那攻略寫手｜Custom GPT 設定說明

這個資料夾放的是**設定 ChatGPT Custom GPT 用的材料**。目的：讓以後寫新文章可以直接在 GPT 裡聊天 → 產出可以貼到網站 repo 的 `.mdoc`（Markdoc）檔。

---

## 📦 這裡有什麼

| 檔案 | 用途 |
|---|---|
| `instructions.md` | **主要指令**（<8000 字元，塞得進 ChatGPT Instructions 欄位） |
| `brand-guidelines.md` | 品牌手冊（knowledge file） |
| `frontmatter-schema.md` | Frontmatter 完整欄位定義（knowledge file） |
| `markdoc-tags.md` | Markdoc 自訂 tag 詳細語法（knowledge file） |
| `banned-words.md` | 禁用與可用字詞清單（knowledge file） |
| `example-article.md` | 範本文章（knowledge file） |
| `starters.md` | 5 個 conversation starters |
| `fallback-prompt.md` | 沒 ChatGPT Plus 時的純 prompt 版 |

---

## 🚀 如何建立 Custom GPT

> **前提**：需要 ChatGPT Plus 或 Team 訂閱才能建 Custom GPT。
> 沒有的話看 `fallback-prompt.md`。

### Step 1：到 ChatGPT 右上角 → My GPTs → Create a GPT

### Step 2：切到 Configure tab，依序填入

- **Name**: `黃踢那攻略寫手`
- **Description**: 看 `instructions.md` 開頭的簡介
- **Instructions**: 整個 `instructions.md` 的內容複製貼上
- **Conversation starters**: 看 `starters.md`

### Step 3：Knowledge → Upload 這 5 個檔案

- `brand-guidelines.md`
- `frontmatter-schema.md`
- `markdoc-tags.md`
- `banned-words.md`
- `example-article.md`

### Step 4：Capabilities

- ✅ Web Browsing（查官方資訊會用到）
- ✅ Code Interpreter & Data Analysis（處理 markdown 格式）
- ❌ DALL-E Image Generation（**關掉**，不要 AI 生圖，違反品牌規則）

### Step 5：儲存 → 開新對話測試

---

## 🔄 每次寫新文章的 workflow

1. 進 ChatGPT，開啟「黃踢那攻略寫手」GPT
2. 點 starter「我要寫一篇新攻略」或直接說想寫哪個主題
3. GPT 會問你一系列問題（地點、是否親身、素材等）
4. 你提供語音逐字稿、筆記、Google Maps 連結
5. GPT 產出完整 `.mdoc` 內容（含 frontmatter + 內文含 `{% Figure %}` `{% Affiliate %}` tags）
6. 複製內容貼到 `src/content/articles/<slug>.mdoc`（**注意副檔名 `.mdoc`**）
7. 用 `npm run images <folder> <slug>` 處理照片，產出到 `/public/images/content/`
8. 把 `{% Figure src="/images/content/IMAGE:xxx.webp" ... /%}` 裡的 `IMAGE:xxx` 換成實際檔名
9. 在 Keystatic 後台檢查一次（圖片 size/align 想微調就在後台直接改）
10. `git push` → 上線

## ✍️ 三種 Markdoc tag

GPT 產出的 `.mdoc` 會用到三種 Markdoc 自訂 tag，知道這三個就夠了：

| Tag | 用法 | 什麼時候出現 |
|---|---|---|
| `{% Figure src="..." alt="..." size="md" align="center" caption="..." /%}` | 單張圖片 block tag，可控大小/對齊/圖說 | 封面、重點單圖、文繞圖 |
| `{% PhotoGrid cols="2" %}...{% /PhotoGrid %}` | 2-3 張同主題照片並排 wrapper（內部用標準 markdown `![alt](src)`） | 住宿多角度、美食拼盤 |
| `{% Affiliate slug="..." /%}` | 聯盟商品 inline tag | 票券、訂房等連結 |

三者都已在 Keystatic 後台有對應的視覺化組件（「圖片」「照片網格」「聯盟商品連結」），事後想改也可以直接在後台點。

---

## 📝 更新 GPT 的時機

- 新增禁用詞 → 更新 `banned-words.md` + 重新上傳
- 文章結構改版 → 更新 `example-article.md` + 重新上傳
- Frontmatter schema 改 → 更新 `frontmatter-schema.md` + 重新上傳
- 品牌規則改 → 更新 `brand-guidelines.md` + 重新上傳
