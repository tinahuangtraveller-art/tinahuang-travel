import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.mdoc", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().max(80),
    cover: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),

    country: z.enum(["japan", "taiwan"]),
    region: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),

    type: z.enum(["guide", "stay", "food", "tips", "transport"]),
    status: z.enum(["experienced", "researched", "sponsored"]),

    tags: z.array(z.string()).default([]),

    locations: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          gmaps: z.string().optional(),
          category: z
            .enum(["attraction", "food", "stay", "transport"])
            .optional(),
          lat: z.number().optional(),
          lng: z.number().optional(),
        })
      )
      .default([]),

    affiliates: z.array(z.string()).default([]),

    stay: z
      .object({
        discriminant: z.boolean(),
        value: z
          .object({
            shortName: z.string(),
            checkInDate: z.string(),
            rooms: z.string().optional(),
            priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
          })
          .nullable()
          .optional(),
      })
      .optional(),

    deal: z
      .object({
        discriminant: z.boolean(),
        value: z
          .object({
            active: z.boolean(),
            label: z.string(),
            discount: z.string(),
            code: z.string().optional(),
            validUntil: z.coerce.date(),
            bookingUrl: z.string(),
          })
          .nullable()
          .optional(),
      })
      .optional(),

    draft: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
  }),
});

const affiliates = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/affiliates" }),
  schema: z.object({
    title: z.string(),
    platform: z.enum(["klook", "kkday", "other"]),
    url: z.string().url().optional(),
    note: z.string().optional(),
  }),
});

export const collections = { articles, affiliates };
