import { allBlogs } from '.contentlayer/generated'
import type { Blog } from '.contentlayer/generated'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { notFound } from 'next/navigation'

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({
    slug: p.slug,
  }))
}

export default async function KBPreviewPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const post = allBlogs.find((p) => p.slug === slug) as Blog | undefined
  if (!post) return notFound()

  return (
    <article className="kb-theme min-h-full bg-[var(--kb-bg)] px-4 py-4 sm:px-6 sm:py-6">
      <header className="mb-5 border-b pb-3" style={{ borderColor: 'var(--kb-border)' }}>
        <h1
          className="text-2xl leading-tight font-normal tracking-tight"
          style={{ color: 'var(--kb-text-strong)', fontFamily: 'var(--font-family-serif)' }}
        >
          {post.title}
        </h1>
        <div className="mt-2 font-mono text-xs" style={{ color: 'var(--kb-text-muted)' }}>
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('ko-KR')}</time>
        </div>
      </header>

      <div className="prose dark:prose-invert max-w-none break-words">
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </div>
    </article>
  )
}
