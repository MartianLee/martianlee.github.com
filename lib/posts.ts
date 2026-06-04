import { allBlogs } from '.contentlayer/generated'
import type { Blog } from '.contentlayer/generated'
import { sortPosts, coreContent } from 'pliny/utils/contentlayer'
import type { CoreContent } from 'pliny/utils/contentlayer'

/** A list item carrying both the English (canonical) and Korean title/summary so
 *  listings can switch language client-side via the reading-language toggle. */
export type LocalizedListItem = CoreContent<Blog> & { titleKo?: string; summaryKo?: string }

/** Turn canonical (English-preferred) docs into list items with their Korean counterparts attached. */
export function localizedList(blogs: Blog[]): LocalizedListItem[] {
  return blogs.map((en) => {
    const ko = allBlogs.find((p) => p.slug === en.slug && p.language === 'ko')
    return { ...coreContent(en), titleKo: ko?.title, summaryKo: ko?.summary }
  })
}

/** One doc per slug, English preferred, sorted newest-first. */
export function canonicalBlogs(): Blog[] {
  const isProduction = process.env.NODE_ENV === 'production'
  const source = isProduction ? allBlogs.filter((p) => !p.draft) : allBlogs
  const bySlug = new Map<string, Blog>()
  for (const p of source) {
    const existing = bySlug.get(p.slug)
    if (!existing || p.language === 'en') bySlug.set(p.slug, p)
  }
  return sortPosts([...bySlug.values()]) as Blog[]
}

/** A specific language version, or the canonical (English-preferred) when language omitted. */
export function postBySlug(slug: string, language?: 'en' | 'ko'): Blog | undefined {
  if (language) return allBlogs.find((p) => p.slug === slug && p.language === language)
  return (
    allBlogs.find((p) => p.slug === slug && p.language === 'en') ||
    allBlogs.find((p) => p.slug === slug)
  )
}

/** True when both an English and a Korean version exist for the slug. */
export function hasBothLanguages(slug: string): boolean {
  return (
    allBlogs.some((p) => p.slug === slug && p.language === 'en') &&
    allBlogs.some((p) => p.slug === slug && p.language === 'ko')
  )
}
