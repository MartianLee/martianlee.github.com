import { coreContent } from 'pliny/utils/contentlayer'
import { allAuthors } from '.contentlayer/generated'
import type { Authors, Blog } from '.contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { Metadata } from 'next'
import { hasBothLanguages } from './posts'

export function buildPostMetadata(post: Blog): Metadata {
  const slug = post.slug
  const both = hasBothLanguages(slug)
  const authorList = post.authors || ['default']
  const authors = authorList
    .map((a) => coreContent(allAuthors.find((p) => p.slug === a) as Authors)?.name)
    .filter(Boolean) as string[]
  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  let imageList = [siteMetadata.socialBanner]
  if (post.images) imageList = typeof post.images === 'string' ? [post.images] : post.images
  const ogImages = imageList.map((img) => ({
    url: img.includes('http') ? img : siteMetadata.siteUrl + img,
  }))
  return {
    title: post.title,
    description: post.summary,
    keywords: post.tags,
    alternates: both
      ? {
          languages: {
            en: `${siteMetadata.siteUrl}/posts/${slug}`,
            ko: `${siteMetadata.siteUrl}/ko/posts/${slug}`,
            'x-default': `${siteMetadata.siteUrl}/posts/${slug}`,
          },
        }
      : undefined,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: post.language === 'en' ? 'en_US' : 'ko_KR',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}
