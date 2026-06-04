import 'katex/dist/katex.css'
import { allCoreContent } from 'pliny/utils/contentlayer'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { canonicalBlogs, postBySlug, hasBothLanguages } from '@/lib/posts'
import PostView from '@/components/PostView'

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug)
  if (!post) return
  const both = hasBothLanguages(slug)
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
      url: './',
      images: [siteMetadata.socialBanner],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.summary },
  }
}

export const generateStaticParams = async () =>
  canonicalBlogs().map((p) => ({ slug: p.slug.split('/') }))

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug)
  if (!post) return notFound()
  const list = allCoreContent(canonicalBlogs())
  const i = list.findIndex((p) => p.slug === slug)
  return <PostView post={post} prev={list[i + 1]} next={list[i - 1]} />
}
