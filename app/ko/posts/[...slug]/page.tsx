import 'katex/dist/katex.css'
import { allCoreContent } from 'pliny/utils/contentlayer'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { allBlogs } from '.contentlayer/generated'
import { canonicalBlogs, postBySlug, hasBothLanguages } from '@/lib/posts'
import PostView from '@/components/PostView'

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug, 'ko')
  if (!post) return
  const both = hasBothLanguages(slug)
  return {
    title: post.title,
    description: post.summary,
    alternates: both
      ? {
          languages: {
            en: `${siteMetadata.siteUrl}/posts/${slug}`,
            ko: `${siteMetadata.siteUrl}/ko/posts/${slug}`,
            'x-default': `${siteMetadata.siteUrl}/posts/${slug}`,
          },
        }
      : undefined,
  }
}

export const generateStaticParams = async () =>
  allBlogs.filter((p) => p.language === 'ko').map((p) => ({ slug: p.slug.split('/') }))

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug, 'ko')
  if (!post) return notFound()
  const list = allCoreContent(canonicalBlogs())
  const i = list.findIndex((p) => p.slug === slug)
  return <PostView post={post} prev={list[i + 1]} next={list[i - 1]} />
}
