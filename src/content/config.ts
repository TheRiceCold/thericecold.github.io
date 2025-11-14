import {defineCollection,z} from 'astro:content'
import {getLanguages} from '../scripts/getters'

const baseSchema = z.object({
  title: z.string(),
  pubDate: z.date(),
  description: z.string(),
  lang: z.enum(getLanguages()),
  updatedDate: z.date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  sidebar: z.object({
    title: z.string(),
    items: z.array(z.object({label:z.string(),link:z.string()}))
  })
});

const learn = defineCollection({
  type: 'content',
  schema: baseSchema.extend({
    prologue: z.string().optional(),
  }),
})

const writings = defineCollection({
  type: 'content',
  scheme: baseSchema
})

export const collections = {learn, writings}
