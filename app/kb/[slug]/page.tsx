import { allBlogs } from '.contentlayer/generated'
import type { Blog } from '.contentlayer/generated'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import KBShell from '@/components/kb/KBShell'
import KBSidebar from '@/components/kb/KBSidebar'
import KBContextPanel from '@/components/kb/KBContextPanel'
import kbData from 'app/kb-data.json'
import Link from '@/components/Link'
import type { KBData } from '@/components/kb/types'

const data = kbData as KBData

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const post = allBlogs.find((p) => p.slug === slug)
  if (!post) return

  return {
    title: `${post.title} — KB`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'ko_KR',
      type: 'article',
    },
  }
}

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({
    slug: p.slug,
  }))
}

export default async function KBNotePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const post = allBlogs.find((p) => p.slug === slug) as Blog
  if (!post) return notFound()

  const mainContent = coreContent(post)
  const noteInfo = data.postIndex.find((p) => p.slug === slug)
  const readingTime = (post as Blog & { readingTime: { text: string } }).readingTime

  // Prev/next within same topic
  const sortedPosts = allCoreContent(sortPosts(allBlogs))
  const topicNotes = sortedPosts.filter(
    (p) => data.postIndex.find((n) => n.slug === p.slug)?.topic === noteInfo?.topic
  )
  const currentIdx = topicNotes.findIndex((p) => p.slug === slug)
  const prev = topicNotes[currentIdx + 1]
  const next = topicNotes[currentIdx - 1]

  return (
    <div className="kb-breakout">
      <KBShell
        sidebar={<KBSidebar activeSlug={slug} />}
        breadcrumb={
          <>
            <span>{noteInfo?.topic || 'uncategorized'}</span>
            <span>/</span>
            <span className="max-w-[200px] truncate" style={{ color: 'var(--kb-text-strong)' }}>
              {mainContent.title}
            </span>
          </>
        }
        main={
          <article className="mx-auto max-w-none px-4 py-4 sm:px-10 sm:py-8 lg:px-16">
            {/* Note Header */}
            <header className="mb-8">
              <h1
                className="mb-3 text-3xl leading-tight font-normal tracking-tight sm:text-4xl"
                style={{
                  color: 'var(--kb-text-strong)',
                  fontFamily: 'var(--font-family-serif)',
                }}
              >
                {mainContent.title}
              </h1>
              <div
                className="flex flex-wrap items-center gap-3 font-mono text-xs"
                style={{ color: 'var(--kb-text-muted)' }}
              >
                <time dateTime={mainContent.date}>
                  {new Date(mainContent.date).toLocaleDateString('ko-KR')}
                </time>
                {readingTime && (
                  <>
                    <span>&middot;</span>
                    <span>{readingTime.text}</span>
                  </>
                )}
                {noteInfo && (
                  <>
                    <span>&middot;</span>
                    <span style={{ color: 'var(--kb-accent)' }}>{noteInfo.topic}</span>
                  </>
                )}
              </div>
            </header>

            {/* Note Content */}
            <div className="prose dark:prose-invert max-w-none break-words">
              <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
            </div>

            {/* Prev/Next in topic */}
            {(prev || next) && (
              <nav
                className="mt-12 flex justify-between gap-4 border-t pt-6 font-mono text-xs"
                style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}
              >
                {prev ? (
                  <Link
                    href={`/kb/${prev.slug}`}
                    className="min-w-0 truncate hover:text-[var(--kb-accent)]"
                  >
                    &larr; {prev.title}
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={`/kb/${next.slug}`}
                    className="min-w-0 truncate text-right hover:text-[var(--kb-accent)]"
                  >
                    {next.title} &rarr;
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </article>
        }
        context={
          <KBContextPanel
            slug={slug}
            toc={post.toc as unknown as { value: string; url: string; depth: number }[]}
          />
        }
        statusBar={
          <div className="flex w-full items-center gap-4">
            <span style={{ color: 'var(--kb-accent)' }}>&#9679; KB</span>
            <span>{noteInfo?.topic || 'uncategorized'}</span>
            <span>&middot;</span>
            <span className="max-w-[150px] truncate">{slug}</span>
            {readingTime && <span className="ml-auto">{readingTime.text}</span>}
          </div>
        }
      />
    </div>
  )
}
