'use client'

import type { CSSProperties } from 'react'
import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import Link from '@/components/Link'
import HorizonBand from '@/components/HorizonBand'
import PostRow from '@/components/posts/PostRow'
import tagData from 'app/tag-data.json'
import type { LocalizedListItem } from '@/lib/posts'
import { fill } from '@/lib/ui-strings'
import { formatPostDate } from '@/lib/post-date'
import { useUI } from '@/components/useUI'
import { useLanguage } from '@/components/LanguageProvider'

const RAIL_TAGS = 18
/** Titles longer than this many capitals (the dot included) are fitted to the column; shorter ones keep the monument as designed. */
const FIT_FROM = 6

/** Width of a monument string in capital letters: CJK glyphs are wider, so they count a little more. */
const weigh = (s: string) => [...s].reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e7f ? 1.15 : 1), 0)

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListStats {
  listedTotal: number
  tagTotal: number
  /** the newest post's date as stored (ISO); the layout prints it in the reading language */
  latest: string
  maxMinutes: number
}
interface ListLayoutProps {
  posts: LocalizedListItem[]
  title: string
  titleKo?: string
  initialDisplayPosts?: LocalizedListItem[]
  pagination?: PaginationProps
  stats: ListStats
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const ui = useUI()
  const basePath = pathname.split('/')[1]
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages
  return (
    <nav className="rh-pager" aria-label={ui.list.pagination}>
      {prevPage ? (
        <Link
          href={currentPage - 1 === 1 ? `/${basePath}` : `/${basePath}/page/${currentPage - 1}`}
          rel="prev"
        >
          {ui.list.newer}
        </Link>
      ) : (
        <span className="rh-off" aria-disabled="true">
          {ui.list.newer}
        </span>
      )}
      <span className="rh-pos">
        {fill(ui.list.pageOf, { current: currentPage, total: totalPages })}
      </span>
      {nextPage ? (
        <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
          {ui.list.older}
        </Link>
      ) : (
        <span className="rh-off" aria-disabled="true">
          {ui.list.older}
        </span>
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
  stats,
}: ListLayoutProps) {
  const pathname = usePathname()
  const ui = useUI()
  const { lang } = useLanguage()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts
  const onPostsPages = pathname.startsWith('/posts')
  // a tag name can make a long title: the CSS fits the monument to the column from its length and its longest word
  const shown = `${lang === 'ko' && titleKo ? titleKo : title}.`
  const words = shown.split('-').map((w, i, all) => (i < all.length - 1 ? `${w}-` : w))
  const length = weigh(shown)
  const fit = { '--rh-fit': length, '--rh-word': Math.max(...words.map(weigh)) }
  const pageClass = ['rh-page', 'rh-posts', length > FIT_FROM && 'rh-posts--fit']
    .filter(Boolean)
    .join(' ')
  const sep = (
    <span className="rh-sep" aria-hidden="true">
      ·
    </span>
  )

  return (
    <div className={pageClass} style={fit as CSSProperties}>
      <HorizonBand
        title={title}
        titleKo={titleKo}
        tele={
          <>
            <span>{ui.band.writingLog}</span>
            {sep}
            <span>{fill(ui.band.postCount, { n: stats.listedTotal })}</span>
            {sep}
            <span>{fill(ui.band.tagCount, { n: stats.tagTotal })}</span>
            {stats.latest && (
              <>
                {sep}
                <span>{fill(ui.band.latest, { date: formatPostDate(stats.latest, lang) })}</span>
              </>
            )}
          </>
        }
      />
      <div className="rh-wrap">
        {onPostsPages && <p className="rh-lede">{ui.sections.writingIntro}</p>}
        <div className="rh-plist">
          <aside className="rh-rail" aria-label={ui.list.filterByTag}>
            <h2 className="rh-rail-h">{ui.list.tags}</h2>
            <ul className="rh-rail-list">
              <li>
                <Link
                  href="/posts"
                  aria-current={onPostsPages && !pathname.includes('/tags/') ? 'page' : undefined}
                >
                  {ui.list.all}
                  <span>{stats.listedTotal}</span>
                </Link>
              </li>
              {sortedTags.slice(0, RAIL_TAGS).map((t) => (
                <li key={t}>
                  <Link
                    href={`/tags/${slug(t)}`}
                    aria-current={pathname.split('/tags/')[1] === slug(t) ? 'page' : undefined}
                  >
                    {t}
                    <span>{tagCounts[t]}</span>
                  </Link>
                </li>
              ))}
              {/* the "All N tags" link below the list is hidden on phones, where the list is a scroller: its last pill takes over */}
              <li className="rh-rail-all">
                <Link href="/tags">{fill(ui.list.allTags, { n: stats.tagTotal })}</Link>
              </li>
            </ul>
            <Link className="rh-rail-more" href="/tags">
              {fill(ui.list.allTags, { n: stats.tagTotal })}
            </Link>
          </aside>
          <div className="rh-list">
            <h2 className="sr-only">{ui.list.latestPosts}</h2>
            <ol className="rh-prows">
              {displayPosts.map((post) => (
                <PostRow key={post.path} post={post} maxMinutes={stats.maxMinutes} />
              ))}
            </ol>
            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
