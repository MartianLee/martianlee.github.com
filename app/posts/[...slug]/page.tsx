import 'katex/dist/katex.css'
import { allCoreContent } from 'pliny/utils/contentlayer'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { canonicalBlogs, postBySlug } from '@/lib/posts'
import { buildPostMetadata } from '@/lib/postMeta'
import PostView from '@/components/PostView'

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug)
  if (!post) return
  return buildPostMetadata(post)
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
