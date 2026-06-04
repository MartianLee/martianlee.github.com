'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import Link from '@/components/Link'
import PostLink from '@/components/PostLink'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'
import type { LocalizedListItem } from '@/lib/posts'
import { useUI } from '@/components/useUI'
import { useLanguage } from '@/components/LanguageProvider'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: LocalizedListItem[]
  title: string
  titleKo?: string
  initialDisplayPosts?: LocalizedListItem[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const ui = useUI()
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
          {ui.list.newer}
        </Link>
      ) : (
        <span className="text-muted/40">{ui.list.newer}</span>
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
          {ui.list.older}
        </Link>
      ) : (
        <span className="text-muted/40">{ui.list.older}</span>
      )}
    </nav>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  titleKo,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const ui = useUI()
  const { lang } = useLanguage()
  const pick = (en: string, ko?: string) => (lang === 'ko' && ko ? ko : en)
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <div>
      <div className="pt-2 pb-8">
        <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
          {pick(title, titleKo)}
        </h1>
      </div>
      <div className="grid gap-10 md:grid-cols-[180px_1fr]">
        <aside className="hidden md:block">
          <div className="sec-num mb-3">{ui.list.tags}</div>
          <div className="flex flex-col gap-1.5 font-mono text-sm">
            <Link
              href="/posts"
              className={
                pathname.startsWith('/posts') && !pathname.includes('/tags/')
                  ? 'text-accent'
                  : 'text-muted hover:text-accent'
              }
            >
              {ui.list.all}
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
            const { path, date, summary, tags } = post
            return (
              <article
                key={path}
                className="list-row flex-col items-start sm:flex-row sm:items-baseline"
              >
                <div className="sm:pr-8">
                  <h2 className="text-xl font-bold tracking-tight">
                    <PostLink slug={post.slug} className="hover:text-accent transition-colors">
                      {pick(post.title, post.titleKo)}
                    </PostLink>
                  </h2>
                  {summary && (
                    <p className="text-muted mt-1.5 max-w-[60ch] font-serif">
                      {pick(summary, post.summaryKo)}
                    </p>
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
