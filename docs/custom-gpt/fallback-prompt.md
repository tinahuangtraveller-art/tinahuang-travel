# 沒有 ChatGPT Plus 時的替代方案

Custom GPT 需要 ChatGPT Plus 或 Team 訂閱。如果沒有，有三個替代方案：

---

## 方案 1：Claude Projects（我推薦）

Claude.ai 的 Projects 功能，Pro 用戶可用：

1. 到 claude.ai → Projects → Create project
2. 命名為「黃踢那攻略寫手」
3. Instructions 欄位貼 `instructions.md` 全部內容
4. Knowledge base 上傳：
   - brand-guidelines.md
   - frontmatter-schema.md
   - banned-words.md
   - example-article.md
5. 之後在這個 Project 下開新對話，自動套用設定

---

## 方案 2：一般 ChatGPT／Claude 對話，每次貼 prompt

每次開新對話，第一則訊息貼完整 prompt：

```
以下是我的旅遊 blog 寫手指南，接下來這整個對話中請完全遵守：

<貼 instructions.md 全部內容>

另外補充品牌規則：
<貼 brand-guidelines.md 全部內容>

Frontmatter 完整 schema：
<貼 frontmatter-schema.md 全部內容>

禁用與可用字詞：
<貼 banned-words.md 全部內容>

範本文章：
<貼 example-article.md 全部內容>

---

我現在要開始寫一篇新攻略，請依照指南問我問題。
```

每次新對話都要重貼。麻煩但可用。

---

## 方案 3：免費工具組合

**Google Gemini（免費）+ 這組文件**：

1. 進 Gemini
2. 用 Gems 功能建一個自訂 GPT 類似物
3. System prompt 貼 instructions.md
4. 開新對話時貼 context（brand-guidelines + frontmatter-schema 等）

Gemini 的中文品質近年追上來，可以試試看。但 Custom GPT 的 Knowledge files 機制 Gemini Gems 目前沒那麼成熟。

---

## 我個人的建議順序

1. **有 ChatGPT Plus** → Custom GPT（最順）
2. **有 Claude Pro** → Claude Project（我覺得 Claude 寫中文更自然）
3. **都沒有** → 一般 ChatGPT 對話 + 貼 prompt 的方案 2
4. **想完全免費** → Gemini Gems

### Claude vs ChatGPT 寫中文旅遊內容的 feel

- **Claude**：語氣比較自然口語化，不會太有 AI 腔，描述具體細節會很有感
- **ChatGPT**：結構清楚，但容易寫出「超美、必去、CP 值超高」這種罐頭句（我們禁用詞的意義就是壓住這個）

**兩邊都要盯著禁用詞清單**，不然都會偶爾犯規。
