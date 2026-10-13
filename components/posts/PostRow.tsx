'use client'

import type { CSSProperties } from 'react'
import { slug } from 'github-slugger'
import Link from '@/components/Link'
import PostLink from '@/components/PostLink'
import { useLanguage } from '@/components/LanguageProvider'
import { useUI } from '@/components/useUI'
import { fill } from '@/lib/ui-strings'
import { formatPostDate } from '@/lib/post-date'
import type { LocalizedListItem } from '@/lib/posts'

const MAX_CHIPS = 3

/**
 * One row of the posts list: date and reading-time gauge, the title as the row's link, a two-line summary, the first tags.
 * The date and the title link carry rh- classes (rh-prow-date, rh-prow-link) so the reduced-motion rule, which only
 * matches rh- classes, also stops their transitions.
 */
export default function PostRow({
  post,
  maxMinutes,
}: {
  post: LocalizedListItem
  maxMinutes: number
}) {
  const ui = useUI()
  const { lang } = useLanguage()
  const pick = (en: string, ko?: string) => (lang === 'ko' && ko ? ko : en)
  const minutes = Math.max(1, Math.ceil(post.readingTime.minutes))
  const tags = post.tags ?? []
  const shown = tags.slice(0, MAX_CHIPS)
  const hidden = tags.length - shown.length
  const summary = pick(post.summary ?? '', post.summaryKo)

  return (
    <li className="rh-prow">
      <p className="rh-prow-meta">
        <time className="rh-prow-date" dateTime={post.date}>
          {formatPostDate(post.date, lang)}
        </time>
        <span
          className="rh-gauge"
          role="img"
          aria-label={fill(ui.list.readGauge, { n: minutes })}
          style={{ '--rh-v': Math.min(1, minutes / maxMinutes) } as CSSProperties}
        >
          <i />
        </span>
        <span className="rh-rt" aria-hidden="true">
          {fill(ui.list.readMin, { n: minutes })}
        </span>
      </p>
      <div className="rh-prow-main">
        <h2 className="rh-prow-title">
          <PostLink slug={post.slug} className="rh-prow-link">
            {pick(post.title, post.titleKo)}
          </PostLink>
        </h2>
        {summary && <p className="rh-prow-sum">{summary}</p>}
        {shown.length > 0 && (
          <p className="rh-prow-tags">
            {shown.map((t) => (
              <Link key={t} className="rh-tagchip" href={`/tags/${slug(t)}`}>
                {t.split(' ').join('-')}
              </Link>
            ))}
            {hidden > 0 && (
              <span
                className="rh-more"
                role="img"
                aria-label={fill(ui.list.moreTags, { n: hidden })}
              >
                +{hidden}
              </span>
            )}
          </p>
        )}
      </div>
    </li>
  )
}
