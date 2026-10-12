'use client'

import { useEffect, useRef } from 'react'
import Link from '@/components/Link'
import PostLink from '@/components/PostLink'
import { formatDate } from 'pliny/utils/formatDate'
import type { LocalizedListItem } from '@/lib/posts'
import { useUI } from '@/components/useUI'
import { useLanguage } from '@/components/LanguageProvider'
import { useSettleOnView } from '@/components/hooks/useSettleOnView'

/** 0% when the pointer is on the left half of `el`, 100% on the right half: the side an underline grows from or retracts to. */
const side = (el: Element, e: PointerEvent) => {
  const r = el.getBoundingClientRect()
  return e.clientX < r.left + r.width / 2 ? '0%' : '100%'
}

export default function WritingSection({ posts }: { posts: LocalizedListItem[] }) {
  const ui = useUI()
  const { lang } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  useSettleOnView(titleRef)

  // The rule above each featured post and the underline under its title draw from the side the pointer arrives
  // and retract to the side it leaves (--rh-o); each list row keeps a light under the pointer (--rh-mx). REF index.html 767 to 776.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const off: Array<() => void> = []
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void
    ) => {
      el.addEventListener(type, fn)
      off.push(() => el.removeEventListener(type, fn))
    }
    section.querySelectorAll<HTMLElement>('.rh-feat article').forEach((article) => {
      const link = article.querySelector<HTMLElement>('h3 a')
      for (const el of [article, link]) {
        if (!el) continue
        const set = (e: PointerEvent) => el.style.setProperty('--rh-o', side(el, e))
        on(el, 'pointerenter', set)
        on(el, 'pointerleave', set)
      }
    })
    section.querySelectorAll<HTMLElement>('.rh-rows a').forEach((a) => {
      on(a, 'pointermove', (e) => {
        a.style.setProperty(
          '--rh-mx',
          `${(e.clientX - a.getBoundingClientRect().left).toFixed(0)}px`
        )
      })
    })
    return () => off.forEach((fn) => fn())
  }, [posts])

  const pick = (en: string, ko?: string) => (lang === 'ko' && ko ? ko : en)
  const dateLocale = lang === 'ko' ? 'ko-KR' : 'en-US'
  const featured = posts.slice(0, 2)
  const rest = posts.slice(2, 5)
  return (
    <section className="rh-sec" aria-labelledby="posts-h" ref={sectionRef}>
      <div className="rh-sec-head">
        <span className="rh-sec-no">02</span>
        <h2 id="posts-h" ref={titleRef}>
          {ui.home.posts}
        </h2>
        <Link className="rh-sec-link" href="/posts">
          {ui.sections.allPosts}
        </Link>
      </div>
      <p className="rh-lede">{ui.sections.writingIntro}</p>
      <div className="rh-feat">
        {featured.map((post) => {
          const tags = post.tags?.slice(0, 2).join(' / ')
          return (
            <article key={post.slug}>
              <p className="rh-meta">
                <b>{formatDate(post.date, dateLocale)}</b> · {post.readingTime.text}
                {tags ? ` · ${tags}` : ''}
              </p>
              <h3>
                <PostLink slug={post.slug}>{pick(post.title, post.titleKo)}</PostLink>
              </h3>
              {post.summary && <p className="rh-sum">{pick(post.summary, post.summaryKo)}</p>}
            </article>
          )
        })}
      </div>
      <ul className="rh-rows">
        {rest.map((post) => (
          <li key={post.slug}>
            <PostLink slug={post.slug}>
              <span>{pick(post.title, post.titleKo)}</span>
              <time dateTime={post.date}>{formatDate(post.date, dateLocale)}</time>
            </PostLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
