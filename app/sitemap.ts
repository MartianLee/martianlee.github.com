import { MetadataRoute } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { canonicalBlogs, hasBothLanguages } from '@/lib/posts'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl.replace(/\/+$/, '')

  const blogRoutes: MetadataRoute.Sitemap = []
  for (const post of canonicalBlogs()) {
    blogRoutes.push({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: post.lastmod || post.date,
    })
    if (hasBothLanguages(post.slug)) {
      blogRoutes.push({
        url: `${siteUrl}/ko/posts/${post.slug}`,
        lastModified: post.lastmod || post.date,
      })
    }
  }

  const routes = ['', 'posts', 'projects', 'tags'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogRoutes]
}
