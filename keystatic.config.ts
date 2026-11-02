import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  ui: {
    brand: { name: "黃踢那後台" },
  },
  collections: {
    articles: collection({
      label: "攻略文章",
      slugField: "title",
      path: "src/content/articles/*",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "city", "status"],
      schema: {
        title: fields.slug({
          name: {
            label: "標題",
            validation: { length: { min: 1, max: 100 } },
          },
          slug: {
            label: "網址 slug（英文、kebab-case）",
            description: "URL 的英文代碼，發布後盡量不要改",
          },
        }),

        excerpt: fields.text({
          label: "摘要",
          description: "80 字以內，顯示在卡片與 SEO description",
          multiline: true,
          validation: { length: { max: 100 } },
        }),

        cover: fields.image({
          label: "封面圖",
          description: "顯示在文章頁最上方與列表卡片",
          directory: "public/images/covers",
          publicPath: "/images/covers/",
        }),

        date: fields.date({
          label: "發布日期",
          defaultValue: { kind: "today" },
        }),

        updated: fields.date({
          label: "更新日期",
          description: "每次改大內容時更新",
        }),

        country: fields.select({
          label: "國家",
          options: [
            { label: "日本", value: "japan" },
            { label: "台灣", value: "taiwan" },
          ],
          defaultValue: "japan",
        }),

        region: fields.text({
          label: "地區（region）",
          description: "例：kansai, kanto, yilan, miaoli",
        }),

        city: fields.text({
          label: "城市",
          description: "例：京都、宜蘭、苗栗",
        }),

        area: fields.text({
          label: "細部地區",
          description: "例：arashiyama、大湖",
        }),

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
          description:
            "親身體驗 = 我真的去過；資料整理 = 沒去過只整理；商業合作 = 有合作方案",
          options: [
            { label: "🧳 親身體驗", value: "experienced" },
            { label: "📋 資料整理", value: "researched" },
            { label: "🤝 商業合作", value: "sponsored" },
          ],
          defaultValue: "experienced",
        }),

        tags: fields.array(
          fields.text({ label: "標籤" }),
          {
            label: "標籤",
            itemLabel: (props) => props.value,
            description: "3 個最相關的中文標籤",
          }
        ),

        locations: fields.array(
          fields.object({
            id: fields.text({
              label: "ID（英文 kebab-case）",
              validation: { length: { min: 1 } },
            }),
            name: fields.text({
              label: "地點名稱（中文）",
              validation: { length: { min: 1 } },
            }),
            gmaps: fields.url({ label: "Google Maps 連結" }),
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
            lat: fields.number({ label: "緯度 lat" }),
            lng: fields.number({ label: "經度 lng" }),
          }),
          {
            label: "景點清單",
            itemLabel: (props) => props.fields.name.value || "新景點",
            description: "有 lat/lng 的景點會自動顯示在文章頂部的互動地圖",
          }
        ),

        affiliates: fields.array(
          fields.text({ label: "聯盟 slug" }),
          {
            label: "聯盟商品 slug",
            itemLabel: (props) => props.value,
            description: "例：klook-sagano-romantic-train、agoda-kyoto-hotel-xxx",
          }
        ),

        stay: fields.conditional(
          fields.checkbox({
            label: "這是住宿類文章（stay）",
            defaultValue: false,
          }),
          {
            true: fields.object({
              shortName: fields.text({ label: "住宿簡稱" }),
              checkInDate: fields.text({
                label: "入住月份（YYYY-MM）",
              }),
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
          fields.checkbox({
            label: "有商業合作優惠（deal）",
            defaultValue: false,
          }),
          {
            true: fields.object({
              active: fields.checkbox({
                label: "優惠進行中",
                defaultValue: true,
              }),
              label: fields.text({ label: "標籤（例：粉絲專屬）" }),
              discount: fields.text({ label: "折扣描述（例：現省 30%）" }),
              code: fields.text({ label: "折扣碼（選填）" }),
              validUntil: fields.date({ label: "到期日" }),
              bookingUrl: fields.url({ label: "訂房連結" }),
            }),
            false: fields.empty(),
          }
        ),

        draft: fields.checkbox({
          label: "草稿（勾選後不會顯示在網站）",
          defaultValue: false,
        }),

        content: fields.markdoc({
          label: "文章內文",
          extension: "md",
          description:
            "Notion-like 編輯器。禁用詞請見 docs/custom-gpt/banned-words.md",
        }),
      },
    }),
  },
});
