'use client'

import { useEffect, useState } from 'react'

const isDarkNow = (): boolean => document.documentElement.classList.contains('dark')

/** Calls `cb` whenever next-themes flips the `dark` class on <html>. Returns an unsubscribe function. */
export function watchDarkTheme(cb: (dark: boolean) => void): () => void {
  const root = document.documentElement
  let last = isDarkNow()
  const obs = new MutationObserver(() => {
    const now = isDarkNow()
    if (now !== last) {
      last = now
      cb(now)
    }
  })
  obs.observe(root, { attributes: true, attributeFilter: ['class'] })
  return () => obs.disconnect()
}

/** React state that follows the site theme (false during SSR and the first client render). */
export function useDarkTheme(): boolean {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    setDark(isDarkNow())
    return watchDarkTheme(setDark)
  }, [])
  return dark
}
