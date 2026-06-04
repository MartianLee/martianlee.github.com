'use client'

import Link from '@/components/Link'
import PostLink from '@/components/PostLink'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import type { LocalizedListItem } from '@/lib/posts'
import { useUI } from '@/components/useUI'
import { useLanguage } from '@/components/LanguageProvider'

export default function WritingSection({ posts }: { posts: LocalizedListItem[] }) {
  const ui = useUI()
  const { lang } = useLanguage()
  const pick = (en: string, ko?: string) => (lang === 'ko' && ko ? ko : en)
  const featured = posts.slice(0, 2)
  const rest = posts.slice(2, 5)
  return (
    <section className="py-12">
      <div className="sec-head">
        <span className="sec-num">{ui.sections.writing}</span>
        <Link href="/posts" className="text-muted hover:text-accent font-mono text-xs">
          {ui.sections.allPosts}
        </Link>
      </div>
      <p className="text-muted mb-8 max-w-[60ch] font-serif text-lg">{ui.sections.writingIntro}</p>
      <div className="flex flex-col gap-7">
        {featured.map((post) => (
          <article key={post.slug}>
            <div className="text-muted font-mono text-[11px] tracking-wide">
              {formatDate(post.date, siteMetadata.locale)} · {post.readingTime.text} ·{' '}
              {post.tags?.slice(0, 2).join(' / ')}
            </div>
            <h3 className="mt-1.5 text-2xl leading-tight font-bold tracking-tight">
              <PostLink slug={post.slug} className="hover:text-accent transition-colors">
                {pick(post.title, post.titleKo)}
              </PostLink>
            </h3>
            {post.summary && (
              <p className="text-muted mt-2 max-w-[64ch] font-serif">
                {pick(post.summary, post.summaryKo)}
              </p>
            )}
          </article>
        ))}
      </div>
      <div className="mt-8">
        {rest.map((post) => (
          <div key={post.slug} className="list-row items-baseline">
            <PostLink
              slug={post.slug}
              className="hover:text-accent text-[17px] font-semibold transition-colors"
            >
              {pick(post.title, post.titleKo)}
            </PostLink>
            <span className="text-muted shrink-0 font-mono text-xs">
              {formatDate(post.date, siteMetadata.locale)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
