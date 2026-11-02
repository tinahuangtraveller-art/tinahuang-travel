# 黃踢那攻略寫手｜Custom GPT 設定說明

這個資料夾放的是**設定 ChatGPT Custom GPT 用的材料**。目的：讓以後寫新文章可以直接在 GPT 裡聊天 → 產出可以貼到網站 repo 的 markdown。

---

## 📦 這裡有什麼

| 檔案 | 用途 |
|---|---|
| `instructions.md` | **主要指令**。設定 Custom GPT 時貼到 Instructions 欄位 |
| `brand-guidelines.md` | 品牌手冊（上傳成 knowledge file） |
| `frontmatter-schema.md` | Frontmatter 完整欄位定義（上傳成 knowledge file） |
| `banned-words.md` | 禁用與可用字詞清單（上傳成 knowledge file） |
| `example-article.md` | 範本文章（上傳成 knowledge file） |
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

### Step 3：Knowledge → Upload 這 4 個檔案

- `brand-guidelines.md`
- `frontmatter-schema.md`
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
5. GPT 產出完整 markdown
6. 複製 markdown 貼到 `src/content/articles/<slug>.md`
7. 用 `npm run images <folder> <slug>` 處理照片
8. 把 markdown 裡的 `![placeholder]()` 換成實際圖片路徑
9. `git push` → 上線

---

## 📝 更新 GPT 的時機

- 新增禁用詞 → 更新 `banned-words.md` + 重新上傳
- 文章結構改版 → 更新 `example-article.md` + 重新上傳
- Frontmatter schema 改 → 更新 `frontmatter-schema.md` + 重新上傳
- 品牌規則改 → 更新 `brand-guidelines.md` + 重新上傳
