import { slug } from 'github-slugger'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { canonicalBlogs, listedBlogs, localizedList } from '@/lib/posts'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'
import { Metadata } from 'next'

/**
 * The tag as it is written in tag-data.json. generateStaticParams hands out encodeURI(tag), and Next 16.2 gives
 * generateMetadata that string but the page itself an encoded copy of it (a Hangul tag arrives as %25EB%25B9...), so a
 * single decodeURI left the page with a title of %EB%B9%85... and no posts. Decode until no escape is left: slugs never
 * contain a literal %.
 */
function decodeTag(param: string) {
  let tag = param
  for (let i = 0; i < 3 && /%[0-9A-Fa-f]{2}/.test(tag); i++) {
    try {
      tag = decodeURIComponent(tag)
    } catch {
      break
    }
  }
  return tag
}

export async function generateMetadata(props: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const params = await props.params
  const tag = decodeTag(params.tag)
  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`,
      },
    },
  })
}

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const paths = tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }))
  return paths
}

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params
  const tag = decodeTag(params.tag)
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const filteredPosts = localizedList(
    canonicalBlogs().filter((post) => post.tags && post.tags.map((t) => slug(t)).includes(tag))
  )
  // the band and the gauge scale describe the whole log; only the latest date is this tag's
  const listed = localizedList(listedBlogs())
  const stats = {
    listedTotal: listed.length,
    tagTotal: Object.keys(tagData as Record<string, number>).length,
    latest: filteredPosts[0]?.date ?? '',
    maxMinutes: Math.max(1, ...listed.map((p) => Math.ceil(p.readingTime.minutes))),
  }
  return <ListLayout posts={filteredPosts} title={title} stats={stats} />
}
