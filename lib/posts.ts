import { allBlogs } from '.contentlayer/generated'
import type { Blog } from '.contentlayer/generated'
import { sortPosts } from 'pliny/utils/contentlayer'

/** One doc per slug, English preferred, sorted newest-first. */
export function canonicalBlogs(): Blog[] {
  const bySlug = new Map<string, Blog>()
  for (const p of allBlogs) {
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
