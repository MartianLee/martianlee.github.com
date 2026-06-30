'use client'

import { useEffect } from 'react'

/**
 * Client-side fallback for mermaid diagrams.
 *
 * Diagrams are normally rendered to SVG at build time by `rehype-mermaid`
 * (see contentlayer.config.ts). That step needs a Playwright Chromium, whose
 * download deterministically hangs on the GitHub Pages CI runners, so the
 * deploy skips it and the diagrams ship as raw ```mermaid code blocks.
 *
 * This component finds any such un-rendered block on a post page and renders it
 * in the browser with the bundled mermaid library. When build-time rendering
 * succeeds (e.g. locally) there are no `code.language-mermaid` blocks left, so
 * this is a no-op — a safe progressive enhancement either way.
 */
function extractSource(code: Element): string {
  // rehype-prism-plus wraps each source line in a `.code-line` span. Joining
  // those is more reliable than textContent, which can drop the newlines that
  // mermaid's grammar depends on.
  const lines = code.querySelectorAll('.code-line')
  if (lines.length > 0) {
    return Array.from(lines)
      .map((l) => l.textContent ?? '')
      .join('\n')
  }
  return code.textContent ?? ''
}

export default function MermaidRenderer() {
  useEffect(() => {
    const codes = Array.from(document.querySelectorAll('code.language-mermaid')).filter((c) =>
      c.closest('pre')
    )
    if (codes.length === 0) return

    let cancelled = false
    ;(async () => {
      try {
        const mermaid = (await import('mermaid')).default
        const isDark = document.documentElement.classList.contains('dark')
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose', // allow <br/> line breaks inside node labels
        })

        for (let i = 0; i < codes.length; i++) {
          if (cancelled) return
          const pre = codes[i].closest('pre')
          if (!pre) continue
          const source = extractSource(codes[i]).trim()
          if (!source) continue
          try {
            const { svg } = await mermaid.render(`mermaid-render-${i}`, source)
            if (cancelled) return
            const figure = document.createElement('figure')
            figure.className = 'mermaid-rendered my-6 flex justify-center overflow-x-auto'
            figure.innerHTML = svg
            pre.replaceWith(figure)
          } catch {
            // Leave the raw code block in place if a single diagram fails.
          }
        }
      } catch {
        // mermaid failed to load; leave the raw blocks untouched.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
