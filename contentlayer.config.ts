import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
import { writeFileSync } from 'fs'
import readingTime from 'reading-time'
import GithubSlugger, { slug } from 'github-slugger'
import path from 'path'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import { readFileSync, readdirSync } from 'fs'
import siteMetadata from './data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'

const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'
const disableMermaid = process.env.DISABLE_REHYPE_MERMAID === 'true'

function hasMermaidBlocks(): boolean {
  const postsDir = path.join(root, 'data', 'posts')
  try {
    return readdirSync(postsDir).some((file) => {
      if (!file.endsWith('.mdx')) return false
      return readFileSync(path.join(postsDir, file), 'utf-8').includes('```mermaid')
    })
  } catch {
    return false
  }
}

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'string', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
function createTagCount(allBlogs) {
  const tagCount: Record<string, number> = {}
  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag: string) => {
        const formattedTag = slug(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })
  writeFileSync('./app/tag-data.json', JSON.stringify(tagCount))
}

function createSearchIndex(allBlogs) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'posts/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'json' },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
    topic: { type: 'string' },
    stage: { type: 'enum', options: ['seedling', 'budding', 'evergreen'], default: 'budding' },
  },
  computedFields: {
    ...computedFields,
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

// Lazy-load rehype-mermaid: wraps the real plugin behind a function that
// performs the dynamic import on first invocation, so we avoid top-level await
// and skip the import entirely when no mermaid blocks exist in posts.
function lazyRehypeMermaid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let transformer: any = null
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (tree: any, file: any) => {
      try {
        if (!transformer) {
          const mod = await import('rehype-mermaid')
          // rehype-mermaid exports a unified attacher; call with dummy context to get the transformer
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const attacher = mod.default as any
          transformer = attacher({ strategy: 'inline-svg' })
        }
        return transformer(tree, file)
      } catch (error) {
        const source = file?.path || 'unknown-file'
        const message = error instanceof Error ? error.message : String(error)
        console.warn(`[contentlayer] rehype-mermaid skipped for ${source}: ${message}`)
        return tree
      }
    }
  }
}

const useMermaid = !disableMermaid && hasMermaidBlocks()

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      remarkCodeTitles,
      remarkMath,
      remarkImgToJsx,
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeAutolinkHeadings,
      // rehypeKatex,
      // @ts-ignore
      [rehypeCitation, { path: path.join(root, 'data') }],
      ...(useMermaid ? [lazyRehypeMermaid()] : []),
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      // rehypePresetMinify,
    ],
  },
  onSuccess: async (importData) => {
    const { allDocuments } = await importData()
    createTagCount(allDocuments)
    createSearchIndex(allDocuments)
    const { generateKBData } = await import('./scripts/generate-kb-data.mjs')
    generateKBData(allDocuments)
  },
})
