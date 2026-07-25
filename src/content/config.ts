import {defineCollection,z} from "astro:content"
import {parseOrg} from "../scripts/orgParser"
import {readdir,readFile} from "node:fs/promises"
import path from "node:path"

const posts = defineCollection({
  loader: async () => {
    const root = path.resolve("src/content/posts")
    const entries = await readdir(root, {recursive: true, withFileTypes: true})
    const files = entries.filter(e => e.isFile() && e.name.endsWith(".org"))

    return Promise.all(
      files.map(async file => {
        const filename = path.join(file.parentPath, file.name)
        const src = await readFile(filename, "utf8")

        const post = parseOrg(src)

        const relative = path.relative(root, filename)
        const id = relative.replace(/\.org$/, "")

        return {id, ...post.properties, body: post.html}
      })
    )
  },

  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
    tags: z.string(),
    body: z.string(),
    prologue: z.string().optional(),
    description: z.string().optional(),
    sidebar: z.string().optional(),
  }),
})

export const collections = {posts}
