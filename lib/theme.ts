// The site theme is the `dark` class next-themes puts on <html>. No React here, so the WebGL renderers in lib/mars can follow the
// theme too; components/hooks/useDarkTheme.ts wraps the same watcher in a hook. Both functions touch the DOM only when called.

export const isDarkNow = (): boolean => document.documentElement.classList.contains('dark')

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
