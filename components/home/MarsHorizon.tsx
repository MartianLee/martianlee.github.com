'use client'

import { Fragment, useEffect, useRef } from 'react'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import type { HorizonHandle } from '@/lib/mars/horizon-renderer'
import MarsHud from './MarsHud'
import { useUI } from '../useUI'

export default function MarsHorizon() {
  const ui = useUI()
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fallbackRef = useRef<SVGSVGElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // save-data visitors still load the small renderer chunk: it starts no WebGL for them and draws the still fitted
    // to the measured name (the markup still is not)
    let handle: HorizonHandle | null = null
    let cancelled = false
    const start = async () => {
      let mod: typeof import('@/lib/mars/horizon-renderer')
      try {
        mod = await import('@/lib/mars/horizon-renderer')
      } catch {
        // the chunk did not load (offline, or a stale page after a deploy): show the same still as without JavaScript
        if (!cancelled) fallbackRef.current?.classList.add('rh-on')
        return
      }
      const hero = heroRef.current
      const canvas = canvasRef.current
      const fallback = fallbackRef.current
      const title = titleRef.current
      if (cancelled || !hero || !canvas || !fallback || !title) return
      handle = mod.mountHorizon(
        { hero, canvas, fallback, title },
        {
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          dark: document.documentElement.classList.contains('dark'),
        }
      )
    }
    // the WebGL chunk is not needed for first paint: load it when the browser is idle (Safari has no requestIdleCallback)
    let cancelIdle: () => void
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => void start(), { timeout: 1200 })
      cancelIdle = () => window.cancelIdleCallback(id)
    } else {
      const id = window.setTimeout(() => void start(), 60)
      cancelIdle = () => window.clearTimeout(id)
    }
    return () => {
      cancelled = true
      cancelIdle()
      handle?.destroy()
    }
  }, [])

  return (
    <section className="rh-hero" id="hero" aria-label="Introduction" ref={heroRef}>
      <div className="rh-sky" aria-hidden="true" />
      <p className="rh-lead">{ui.masthead.tagline}</p>
      <div className="rh-title" ref={titleRef}>
        <p className="rh-eyebrow">
          {ui.masthead.eyebrow.split(' · ').map((part, i) => (
            <Fragment key={part}>
              {i > 0 && ' · '}
              <span className="rh-nw">{part}</span>
            </Fragment>
          ))}
        </p>
        {/* The renderer's measure() reads this h1 and the .rh-w1, .rh-w2, .rh-dot and .rh-bl inside the title div to place the
            skyline, the sun and the horizon, and silently skips the placement when one of them is missing: these class names
            are load-bearing. */}
        <h1>
          <span className="rh-w1">MARTIAN</span> <br className="rh-br" />
          <span className="rh-w2">
            LEE<span className="rh-dot">.</span>
            <i className="rh-bl" aria-hidden="true" />
          </span>
        </h1>
      </div>
      <svg
        className="rh-dunes"
        ref={fallbackRef}
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          style={{ fill: 'var(--rh-far)' }}
          d="M0 72V19h118l16 21 16 4q100-14 180-6l62 8 12-18h96l14 19 46-2q40 2 90 13l2 2h288l15-17q20-10 45-9v51z"
        />
        <path
          style={{ fill: 'var(--rh-sand-d)' }}
          d="M0 400V84c80-22 150-24 230-10s150 8 230-14 170-20 250 0 160 22 290 6V400z"
        />
      </svg>
      <noscript>
        <style>{'.rh-dunes{display:block!important}'}</style>
      </noscript>
      <canvas className="rh-mars-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="rh-fade" aria-hidden="true" />
      <div className="rh-hero-foot">
        <nav className="rh-cta" aria-label="Start here">
          <a className="rh-cta-main" href="#projects">
            {ui.masthead.viewProjects}
          </a>
          <Link href="/posts">{ui.masthead.writing}</Link>
          <a href={siteMetadata.linkedin}>{ui.cv}</a>
          <a href={siteMetadata.github}>GitHub ↗</a>
        </nav>
        <MarsHud />
      </div>
    </section>
  )
}
