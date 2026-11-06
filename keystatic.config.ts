import { config, fields, collection } from "@keystatic/core";
import { block, inline, wrapper } from "@keystatic/core/content-components";

const isProd = process.env.NODE_ENV === "production";

export default config({
  storage: isProd
    ? {
        kind: "github",
        repo: {
          owner: "tinahuangtraveller-art",
          name: "tinahuang-travel",
        },
      }
    : {
        kind: "local",
      },
  ui: {
    brand: { name: "黃踢那後台" },
  },
  collections: {
    affiliates: collection({
      label: "聯盟商品",
      slugField: "title",
      path: "src/content/affiliates/*",
      format: { data: "yaml" },
      columns: ["title", "platform"],
      schema: {
        title: fields.slug({
          name: {
            label: "商品名稱",
            description: "顯示在文章 CTA 上，例如：嵯峨野觀光小火車預約",
          },
          slug: {
            label: "slug（英文 kebab-case）",
            description:
              "文章 affiliates 欄位用這個 slug 引用，例如：klook-sagano-romantic-train",
          },
        }),
        platform: fields.select({
          label: "平台",
          options: [
            { label: "Klook", value: "klook" },
            { label: "KKday", value: "kkday" },
            { label: "其他", value: "other" },
          ],
          defaultValue: "klook",
        }),
        url: fields.url({
          label: "聯盟連結",
          description: "空白時前端會顯示「合作連結整理中」",
        }),
        note: fields.text({
          label: "內部備註（不會顯示）",
          multiline: true,
        }),
      },
    }),

    articles: collection({
      label: "攻略文章",
      slugField: "title",
      path: "src/content/articles/*",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "city", "status"],
      previewUrl:
        "https://tinahuang-travel.tinahuang-traveller.workers.dev/articles/{slug}",
      schema: {
        title: fields.slug({
          name: {
            label: "標題",
            validation: { length: { min: 1, max: 100 } },
          },
          slug: {
            label: "網址 slug（英文 kebab-case）",
          },
        }),

        excerpt: fields.text({
          label: "摘要",
          description: "80 字內，顯示在卡片與 SEO description",
          multiline: true,
          validation: { length: { max: 100 } },
        }),

        cover: fields.image({
          label: "封面圖",
          directory: "public/images/covers",
          publicPath: "/images/covers/",
        }),

        date: fields.date({
          label: "發布日期",
          defaultValue: { kind: "today" },
        }),

        updated: fields.date({ label: "更新日期" }),

        country: fields.select({
          label: "國家",
          options: [
            { label: "日本", value: "japan" },
            { label: "台灣", value: "taiwan" },
          ],
          defaultValue: "japan",
        }),

        region: fields.text({ label: "地區（region）" }),
        city: fields.text({ label: "城市" }),
        area: fields.text({ label: "細部地區" }),

        type: fields.select({
          label: "文章類型",
          options: [
            { label: "攻略 Guide", value: "guide" },
            { label: "住宿 Stay", value: "stay" },
            { label: "美食 Food", value: "food" },
            { label: "行前知識 Tips", value: "tips" },
            { label: "交通 Transport", value: "transport" },
          ],
          defaultValue: "guide",
        }),

        status: fields.select({
          label: "內容狀態",
          options: [
            { label: "🧳 親身體驗", value: "experienced" },
            { label: "📋 資料整理", value: "researched" },
            { label: "🤝 商業合作", value: "sponsored" },
          ],
          defaultValue: "experienced",
        }),

        tags: fields.array(fields.text({ label: "標籤" }), {
          label: "標籤",
          itemLabel: (p) => p.value,
        }),

        locations: fields.array(
          fields.object({
            id: fields.text({ label: "ID (kebab-case)" }),
            name: fields.text({ label: "地點名稱" }),
            gmaps: fields.url({
              label: "Google Maps 連結",
              description:
                "從 Google Maps app 點「分享」複製 maps.app.goo.gl/... 短網址貼進來。存檔後 CI 會自動解析座標補到 lat/lng。",
            }),
            category: fields.select({
              label: "類型",
              options: [
                { label: "📍 景點", value: "attraction" },
                { label: "🍽 美食", value: "food" },
                { label: "🏨 住宿", value: "stay" },
                { label: "🚉 交通", value: "transport" },
              ],
              defaultValue: "attraction",
            }),
            lat: fields.number({
              label: "lat（可留空，CI 自動填）",
              description: "填了 Google Maps 連結就不用自己填這個",
            }),
            lng: fields.number({
              label: "lng（可留空，CI 自動填）",
              description: "填了 Google Maps 連結就不用自己填這個",
            }),
          }),
          {
            label: "景點清單",
            itemLabel: (p) => p.fields.name.value || "新景點",
          }
        ),

        affiliates: fields.array(fields.text({ label: "聯盟 slug" }), {
          label: "聯盟商品 slug",
          itemLabel: (p) => p.value,
        }),

        stay: fields.conditional(
          fields.checkbox({ label: "是住宿文章 (stay)" }),
          {
            true: fields.object({
              shortName: fields.text({ label: "住宿簡稱" }),
              checkInDate: fields.text({ label: "入住月份 YYYY-MM" }),
              rooms: fields.text({ label: "房型描述" }),
              priceRange: fields.select({
                label: "價位",
                options: [
                  { label: "$", value: "$" },
                  { label: "$$", value: "$$" },
                  { label: "$$$", value: "$$$" },
                  { label: "$$$$", value: "$$$$" },
                ],
                defaultValue: "$$",
              }),
            }),
            false: fields.empty(),
          }
        ),

        deal: fields.conditional(
          fields.checkbox({ label: "有商業合作優惠 (deal)" }),
          {
            true: fields.object({
              active: fields.checkbox({ label: "進行中", defaultValue: true }),
              label: fields.text({ label: "標籤 (ex: 粉絲專屬)" }),
              discount: fields.text({ label: "折扣描述" }),
              code: fields.text({ label: "折扣碼" }),
              validUntil: fields.date({ label: "到期日" }),
              bookingUrl: fields.url({ label: "訂房連結" }),
            }),
            false: fields.empty(),
          }
        ),

        draft: fields.checkbox({
          label: "草稿",
          description:
            "寫作中。列表隱藏，但 preview 按鈕還能打開預覽頁（noindex，Google 不會收錄）。發布時取消勾選。",
        }),

        unpublished: fields.checkbox({
          label: "下架",
          description:
            "團購／活動結束要關掉文章。列表隱藏，網址直接 404。已發布過的文章要下架用這個。",
        }),

        isFeatured: fields.checkbox({
          label: "首頁本月精選（整個網站只會顯示最新一篇勾選的）",
        }),

        content: fields.markdoc({
          label: "文章內文",
          extension: "mdoc",
          components: {
            Figure: block({
              label: "圖片",
              description: "可控制大小與對齊的圖片。小/中/靠左/靠右 時文字會自動環繞。",
              schema: {
                src: fields.image({
                  label: "圖片",
                  directory: "public/images/content",
                  publicPath: "/images/content/",
                  description: "沒傳的話會顯示「圖片待補」佔位框，不會擋 build",
                }),
                alt: fields.text({
                  label: "替代文字 (alt)",
                  description: "描述圖片內容，SEO + 無障礙都需要",
                }),
                size: fields.select({
                  label: "大小",
                  options: [
                    { label: "小 (~40%)", value: "sm" },
                    { label: "中 (~60%)", value: "md" },
                    { label: "大 (~85%)", value: "lg" },
                    { label: "滿版", value: "full" },
                  ],
                  defaultValue: "md",
                }),
                align: fields.select({
                  label: "位置",
                  options: [
                    { label: "置中", value: "center" },
                    { label: "靠左 (文繞圖右)", value: "left" },
                    { label: "靠右 (文繞圖左)", value: "right" },
                  ],
                  defaultValue: "center",
                }),
                caption: fields.text({
                  label: "圖說 (可選)",
                }),
              },
            }),
            Affiliate: inline({
              label: "聯盟商品連結",
              description: "插入聯盟商品 slug，會自動 render 成樣式化的連結",
              schema: {
                slug: fields.text({
                  label: "商品 slug",
                  validation: { isRequired: true },
                }),
              },
            }),
            PhotoGrid: wrapper({
              label: "照片網格",
              description: "包住 2 或 3 張並排的圖片。內容區塊放多個標準 markdown 圖片即可。",
              schema: {
                cols: fields.select({
                  label: "欄數",
                  options: [
                    { label: "2 欄", value: "2" },
                    { label: "3 欄", value: "3" },
                  ],
                  defaultValue: "2",
                }),
              },
            }),
          },
        }),
      },
    }),
  },
});
