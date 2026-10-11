'use client'

import { useEffect, type RefObject } from 'react'

/** Starts a section title slightly loose (.rh-pre) and lets it settle when it scrolls into view. Readable in both states. */
export function useSettleOnView(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) return // already visible: never animate content that is on screen
    el.classList.add('rh-pre')
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.remove('rh-pre')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      // never leave a title loose with nobody watching it (effect re-run, Fast Refresh, unmount)
      el.classList.remove('rh-pre')
    }
  }, [ref])
}
