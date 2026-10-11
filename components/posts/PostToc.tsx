'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { hasNumberedHeadings, type TocEntry } from '@/lib/headings'

interface PostTocProps {
  toc: TocEntry[]
  label: string
}

interface Item {
  url: string
  id: string
  text: string
  depth: number
  /** Section number shown before an h2 ("01"); null when the headings carry their own numbers or for h3. */
  no: string | null
}

/** The TOC extractor keeps raw markdown, so drop the code ticks and emphasis marks the rendered heading does not show. */
const plain = (value: string) =>
  value
    .replace(/`/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .trim()

const idOf = (url: string) => {
  const raw = url.replace(/^#/, '')
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/** h2 and h3 only. Numbers are generated only when the post does not number its own sections (same switch as data-autonum). */
function buildItems(toc: TocEntry[]): Item[] {
  const autonum = !hasNumberedHeadings(toc)
  let n = 0
  return toc
    .filter((h) => h.depth === 2 || h.depth === 3)
    .map((h) => ({
      url: h.url,
      id: idOf(h.url),
      text: plain(h.value),
      depth: h.depth,
      no: autonum && h.depth === 2 ? String(++n).padStart(2, '0') : null,
    }))
}

/**
 * Reading progress hairline (every post) and the "On this page" list (three or more h2/h3):
 * a sticky column with scroll spy and a sliding marker from 1100px up, a <details> below that.
 */
export default function PostToc({ toc, label }: PostTocProps) {
  const items = useMemo(() => buildItems(toc), [toc])
  const showToc = items.length > 2
  const numbered = items.some((it) => it.no)
  const [active, setActive] = useState(-1)
  const bar = useRef<HTMLElement>(null)
  const box = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const mark = useRef<HTMLElement>(null)
  const links = useRef<(HTMLAnchorElement | null)[]>([])

  // One rAF-throttled pass per scroll burst. Progress: 0 when the article top is a quarter down the viewport, 1 when its end
  // has risen to 85%. Spy: the current section is the last heading above 32% of the viewport. The spy reads positions
  // instead of using an IntersectionObserver because an observer only reports a heading while it crosses the band, so it
  // goes stale after a jump (End key, scrollbar drag, anchor link) that lands past several headings at once.
  useEffect(() => {
    const el = bar.current
    const article = document.querySelector<HTMLElement>('.rh-reading')
    if (!el || !article) return
    const heads = showToc
      ? items.flatMap((it, i) => {
          const h = document.getElementById(it.id)
          return h ? [{ h, i }] : []
        })
      : []
    let raf = 0
    let last = -1
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const r = article.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (vh * 0.25 - r.top) / Math.max(r.height - vh * 0.6, 1)))
      el.style.setProperty('--rh-p', p.toFixed(4))
      if (!heads.length) return
      // headings are in document order, so the last one above the line is found by bisection
      let lo = 0
      let hi = heads.length - 1
      let cur = -1
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (heads[mid].h.getBoundingClientRect().top < vh * 0.32) {
          cur = heads[mid].i
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }
      if (cur !== last) {
        last = cur
        setActive(cur)
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // images, viz and diagrams change the article height without a scroll
    const ro = new ResizeObserver(schedule)
    ro.observe(article)
    update()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [items, showToc])

  // Marker: slides to the current link; a long list scrolls inside its sticky box, never the page.
  useEffect(() => {
    const m = mark.current
    const t = track.current
    if (!m || !t) return
    const place = () => {
      const link = links.current[active]
      if (!link) {
        m.style.setProperty('--rh-o', '0')
        return
      }
      m.style.setProperty('--rh-o', '1')
      m.style.setProperty('--rh-y', `${link.offsetTop + (link.offsetHeight - 22) / 2}px`)
    }
    place()
    const b = box.current
    const link = links.current[active]
    if (b && link && b.scrollHeight > b.clientHeight) {
      const br = b.getBoundingClientRect()
      const lr = link.getBoundingClientRect()
      const pad = 48
      if (lr.top < br.top + pad) b.scrollTop -= br.top + pad - lr.top
      else if (lr.bottom > br.bottom - pad) b.scrollTop += lr.bottom - (br.bottom - pad)
    }
    // wrapping changes with the width and when the web font lands, which moves every link
    const ro = new ResizeObserver(place)
    ro.observe(t)
    window.addEventListener('resize', place)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', place)
    }
  }, [active, items])

  const list = (spy: boolean) => (
    <ol className={numbered ? 'rh-toc-list rh-toc-list--n' : 'rh-toc-list'}>
      {items.map((it, i) => (
        <li key={`${it.url}-${i}`}>
          <a
            href={it.url}
            data-depth={it.depth}
            aria-current={spy && i === active ? 'true' : undefined}
            ref={
              spy
                ? (el) => {
                    links.current[i] = el
                  }
                : undefined
            }
          >
            {it.no && (
              <span className="rh-toc-n" aria-hidden="true">
                {it.no}
              </span>
            )}
            {it.text}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <>
      <div className="rh-progress" aria-hidden="true">
        <i ref={bar} />
      </div>
      {showToc && (
        <>
          <nav className="rh-toc" aria-label={label} ref={box}>
            <p className="rh-toc-h">{label}</p>
            <div className="rh-toc-track" ref={track}>
              {list(true)}
              <i className="rh-toc-marker" ref={mark} aria-hidden="true" />
            </div>
          </nav>
          <details className="rh-toc-m">
            <summary>{label}</summary>
            <nav aria-label={label}>{list(false)}</nav>
          </details>
        </>
      )}
    </>
  )
}
