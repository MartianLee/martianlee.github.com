'use client'

import { useEffect, useState } from 'react'
import { isDarkNow, watchDarkTheme } from '@/lib/theme'

// the watcher lives in lib/theme.ts (no React); re-exported so imports of it from here keep working
export { watchDarkTheme }

/** React state that follows the site theme (false during SSR and the first client render). */
export function useDarkTheme(): boolean {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    setDark(isDarkNow())
    return watchDarkTheme(setDark)
  }, [])
  return dark
}
