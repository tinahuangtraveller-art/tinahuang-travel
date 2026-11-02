# 跟著黃踢那出發吧！

> 日本、台灣真實旅行體驗、自由行攻略與旅宿分享

Live: <https://tinahuang-travel.pages.dev>（部署中）

## Tech stack

- **Astro 5** — static site + Cloudflare adapter for admin routes
- **Tailwind v4** — brand tokens via `@theme`
- **Leaflet + OpenStreetMap** — multi-pin article maps
- **Google Maps Embed** — single-point Place cards (no API key)
- **Keystatic** — content admin (cloud mode, Phase 9)
- **Sharp** — image optimization (resize + WebP)

## Local dev

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build
```

## Writing new articles

Two paths:

### Via Custom GPT（推薦，手機也能寫）

See `docs/custom-gpt/README.md`. Set up once in ChatGPT, then every new article is ~15 min from idea to live.

### Via Keystatic cloud admin（Phase 9）

Visit `/keystatic` on the live site — Cloudflare Access gates the page with email + PIN.

### Via code (manual)

Add `.md` to `src/content/articles/`, follow the frontmatter schema in `docs/custom-gpt/frontmatter-schema.md`.

## Image workflow

```bash
# From a folder of photos
npm run images ~/path/to/photos <article-slug>

# From a Notion markdown export (handles both images + md)
npm run migrate "/path/to/notion.md" <article-slug>
```

See `scripts/` for details.

## Project structure

```
blog/
├── src/
│   ├── components/      # UI components (AuthorCard, StayCard, ArticleMap, etc.)
│   ├── content/         # Articles collection (markdown)
│   ├── data/            # site + stays config
│   ├── layouts/         # Layout.astro (header + footer + FAB)
│   ├── lib/             # Helpers (articles query)
│   ├── pages/           # Routes
│   └── styles/          # global.css (brand tokens + prose)
├── public/
│   ├── fonts/           # Jason Handwriting 2 subset (155KB)
│   └── images/          # Article images (WebP, max 1600px)
├── docs/
│   └── custom-gpt/      # Custom GPT setup files
├── scripts/             # Image processing + font subsetting
└── plugins/             # remark-affiliate (markdown transform)
```

## Deployment

- Platform: **Cloudflare Pages**
- Build command: `npm run build`
- Output: `dist`
- Node version: 22+

Every push to `main` triggers auto-deploy.

## License

Content © Tina Huang. Code structure released under MIT.
