'use client'

import { useEffect, useRef, useState } from 'react'
import { marsClock, type MarsClock } from '@/lib/mars/clock'
import { formatClock } from '@/lib/mars/format'
import type { GlobeHandle } from '@/lib/mars/globe-renderer'
import { fill } from '@/lib/ui-strings'
import { useUI } from '@/components/useUI'

/** Rounded to 2 decimals, never "-0", so the server and every browser print the same attribute. */
const r2 = (v: number): number => Math.round(v * 100) / 100 + 0

// Reticle ticks every 10°, longer every 30° (drawn here, not by the renderer: they are part of the first paint).
const TICKS = Array.from({ length: 36 }, (_, i) => {
  const a = (i * 10 * Math.PI) / 180
  const r0 = 102
  const r1 = (i * 10) % 30 ? 105 : 109
  const c = Math.cos(a)
  const s = Math.sin(a)
  return { key: i, x1: r2(c * r0), y1: r2(s * r0), x2: r2(c * r1), y2: r2(s * r1) }
})

const dash = '…'
const degrees = (v: number, plus: string, minus: string): string =>
  `${Math.abs(v).toFixed(1)}°${v >= 0 ? plus : minus}`

/**
 * The About page's eyepiece: Mars as the Sun lights it right now, an SVG still first, the WebGL canvas fading in over it,
 * then the caption with the live numbers and the controls. The renderer is a lazy chunk (lib/mars/globe-renderer.ts).
 */
export default function MarsGlobe() {
  const ui = useUI()
  const portRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stillRef = useRef<SVGSVGElement>(null)
  const pinRef = useRef<HTMLSpanElement>(null)
  const pinTextRef = useRef<HTMLSpanElement>(null)
  const sunMarkRef = useRef<SVGGElement>(null)
  const handleRef = useRef<GlobeHandle | null>(null)
  // null on the server and for the first client render, so the static export never bakes in a build-time clock
  const [reading, setReading] = useState<{ at: number; clock: MarsClock } | null>(null)
  // true while the canvas is showing: only then can the controls do anything
  const [live, setLive] = useState(false)

  // the caption's numbers, and the Sun's position for the renderer, every 5 seconds (and at once when the tab comes back)
  useEffect(() => {
    const tick = () => {
      const at = Date.now()
      const clock = marsClock(at)
      setReading({ at, clock })
      handleRef.current?.update(clock)
    }
    const tickIfVisible = () => {
      if (!document.hidden) tick()
    }
    tick()
    const id = window.setInterval(tickIfVisible, 5000)
    document.addEventListener('visibilitychange', tickIfVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tickIfVisible)
    }
  }, [])

  useEffect(() => {
    // a visitor who asked to save data keeps the still (the controls stay hidden): the WebGL chunk is not fetched at all
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData === true) return
    let cancelled = false
    const start = async () => {
      let mod: typeof import('@/lib/mars/globe-renderer')
      try {
        mod = await import('@/lib/mars/globe-renderer')
      } catch {
        // the chunk did not load (offline, or a stale page after a deploy): the SVG still stays and the controls stay hidden
        return
      }
      const port = portRef.current
      const canvas = canvasRef.current
      const still = stillRef.current
      const pin = pinRef.current
      const pinText = pinTextRef.current
      const sunMark = sunMarkRef.current
      if (cancelled || !port || !canvas || !still || !pin || !pinText || !sunMark) return
      handleRef.current = mod.mountGlobe(
        { port, canvas, still, pin, pinText, sunMark },
        {
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          dark: document.documentElement.classList.contains('dark'),
          clock: marsClock(Date.now()),
          onLive: setLive,
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
      handleRef.current?.destroy()
      handleRef.current = null
      setLive(false)
    }
  }, [])

  const c = reading?.clock
  const utc = reading ? new Date(reading.at).toISOString().slice(11, 16) : dash
  return (
    <figure className="rh-about-globe">
      <div
        className="rh-about-port"
        ref={portRef}
        // a custom widget: the renderer attaches the drag and arrow-key handlers, which the rule cannot see
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="application"
        aria-roledescription="globe"
        aria-label={ui.about.globeLabel}
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
        aria-describedby="rh-about-cap"
      >
        <svg
          className="rh-about-still"
          ref={stillRef}
          viewBox="-100 -100 200 200"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id="rh-about-st-body" cx="34%" cy="34%" r="74%">
              <stop offset="0" stopColor="#e2a06a" />
              <stop offset=".62" stopColor="#b8693f" />
              <stop offset="1" stopColor="#5f2f1c" />
            </radialGradient>
            <linearGradient id="rh-about-st-night" x1="0" x2="1">
              <stop offset="0" stopColor="#050302" stopOpacity=".9" />
              <stop offset=".42" stopColor="#050302" stopOpacity=".7" />
              <stop offset=".6" stopColor="#050302" stopOpacity="0" />
            </linearGradient>
            <clipPath id="rh-about-st-clip">
              <circle r="76" />
            </clipPath>
          </defs>
          <circle r="76" fill="url(#rh-about-st-body)" />
          <g clipPath="url(#rh-about-st-clip)" fill="#4a2c1f" opacity=".5">
            <path d="M18 -8q8 18 2 40-14 6-22-4 4-20 20-36z" />
            <ellipse cx="-30" cy="-44" rx="26" ry="11" />
            <ellipse cx="6" cy="34" rx="70" ry="9" transform="rotate(-6)" />
          </g>
          <ellipse
            cx="22"
            cy="44"
            rx="17"
            ry="11"
            fill="#e9c8a2"
            opacity=".55"
            clipPath="url(#rh-about-st-clip)"
          />
          <ellipse
            cx="0"
            cy="-70"
            rx="34"
            ry="9"
            fill="#efe9df"
            clipPath="url(#rh-about-st-clip)"
          />
          <circle r="76" fill="url(#rh-about-st-night)" />
        </svg>
        <canvas className="rh-about-canvas" ref={canvasRef} aria-hidden="true" />
        <svg
          className="rh-about-reticle"
          viewBox="-100 -100 200 200"
          aria-hidden="true"
          focusable="false"
        >
          <g stroke="currentColor" strokeWidth=".6">
            {TICKS.map((t) => (
              <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
            ))}
          </g>
          <text x="0" y="-114" textAnchor="middle">
            N
          </text>
          <text x="117" y="2.5" textAnchor="middle">
            E
          </text>
          <text x="0" y="118" textAnchor="middle">
            S
          </text>
          <text x="-117" y="2.5" textAnchor="middle">
            W
          </text>
          <g className="rh-about-sun" ref={sunMarkRef}>
            <circle cx="0" cy="-104.5" r="2.4" />
          </g>
        </svg>
        {/* rh-away is the renderer's: it toggles it from the projection, and React never re-applies this className.
            aria-hidden: the caption below says the same (Jezero local time). */}
        <span className="rh-about-pin rh-away" ref={pinRef} aria-hidden="true">
          <span>
            {ui.about.jezero} · <span ref={pinTextRef} />
          </span>
        </span>
      </div>
      <figcaption className="rh-about-cap" id="rh-about-cap">
        <p className="rh-about-live">
          <i aria-hidden="true" />
          <span>{fill(ui.about.litAt, { time: utc })}</span>
        </p>
        <dl>
          <dt>{ui.about.subsolar}</dt>
          <dd>
            {c
              ? `${degrees(c.subsolarLatDeg, 'N', 'S')} ${c.subsolarLonEastDeg.toFixed(1)}°E`
              : dash}
          </dd>
          <dt>{ui.about.jezeroTime}</dt>
          <dd>{c ? `${formatClock(c.lmstJezero, false)} LMST` : dash}</dd>
          <dt>{ui.about.season}</dt>
          <dd>
            {c ? (
              // two chunks, so a narrow caption wraps between them, with the separator staying on the first line
              <>
                <span className="rh-nw">{`MY ${c.my} · Ls ${c.ls.toFixed(1)}° ·`}</span>{' '}
                <span className="rh-nw">{`${ui.hud.northern} ${ui.hud.seasons[c.season]}`}</span>
              </>
            ) : (
              dash
            )}
          </dd>
        </dl>
        <div className={live ? 'rh-about-ctl rh-on' : 'rh-about-ctl'}>
          <button type="button" onClick={() => handleRef.current?.faceSun()}>
            {ui.about.faceSun}
          </button>
          <button type="button" onClick={() => handleRef.current?.faceJezero()}>
            {ui.about.faceJezero}
          </button>
          <span className="rh-about-hint">{ui.about.drag}</span>
        </div>
      </figcaption>
    </figure>
  )
}
