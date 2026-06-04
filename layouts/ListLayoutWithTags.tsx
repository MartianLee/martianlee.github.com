'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname.split('/')[1]
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages
  return (
    <nav className="border-line mt-10 flex items-center justify-between border-t pt-6 font-mono text-sm">
      {prevPage ? (
        <Link
          href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
          rel="prev"
          className="hover:text-accent"
        >
          ← Newer
        </Link>
      ) : (
        <span className="text-muted/40">← Newer</span>
      )}
      <span className="text-muted">
        {currentPage} / {totalPages}
      </span>
      {nextPage ? (
        <Link
          href={`/${basePath}/page/${currentPage + 1}`}
          rel="next"
          className="hover:text-accent"
        >
          Older →
        </Link>
      ) : (
        <span className="text-muted/40">Older →</span>
      )}
    </nav>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <div>
      <div className="pt-2 pb-8">
        <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{title}</h1>
      </div>
      <div className="grid gap-10 md:grid-cols-[180px_1fr]">
        <aside className="hidden md:block">
          <div className="sec-num mb-3">Tags</div>
          <div className="flex flex-col gap-1.5 font-mono text-sm">
            <Link
              href="/posts"
              className={
                pathname.startsWith('/posts') && !pathname.includes('/tags/')
                  ? 'text-accent'
                  : 'text-muted hover:text-accent'
              }
            >
              All
            </Link>
            {sortedTags.map((t) => (
              <Link
                key={t}
                href={`/tags/${slug(t)}`}
                className={
                  pathname.split('/tags/')[1] === slug(t)
                    ? 'text-accent'
                    : 'text-muted hover:text-accent'
                }
              >
                {t} <span className="opacity-50">({tagCounts[t]})</span>
              </Link>
            ))}
          </div>
        </aside>
        <div>
          {displayPosts.map((post) => {
            const { path, date, title, summary, tags } = post
            return (
              <article
                key={path}
                className="list-row flex-col items-start sm:flex-row sm:items-baseline"
              >
                <div className="sm:pr-8">
                  <h2 className="text-xl font-bold tracking-tight">
                    <Link href={`/${path}`} className="hover:text-accent transition-colors">
                      {title}
                    </Link>
                  </h2>
                  {summary && (
                    <p className="text-muted mt-1.5 max-w-[60ch] font-serif">{summary}</p>
                  )}
                  {tags && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <Tag key={t} text={t} />
                      ))}
                    </div>
                  )}
                </div>
                <time
                  dateTime={date}
                  className="text-muted mt-2 shrink-0 font-mono text-xs sm:mt-0"
                >
                  {formatDate(date, siteMetadata.locale)}
                </time>
              </article>
            )
          })}
          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}
