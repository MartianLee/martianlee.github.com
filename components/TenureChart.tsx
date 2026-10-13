'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import Link from '@/components/Link'
import { useLanguage } from '@/components/LanguageProvider'
import { useUI } from '@/components/useUI'
import type { Career } from '@/data/careerData'
import { fill } from '@/lib/ui-strings'
import { activeRoles, barSpan, scrubYears, tenureAxis, yearFraction } from '@/lib/tenure'

const STEP: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }
/** How long a touch reading stays on screen after the finger lifts. */
const TOUCH_HOLD_MS = 2600

/**
 * Whole-year bars on one axis, with a scrubber (REF index.html 253 to 280 and 779 to 829).
 * Hover or tap a bar track or the axis, or focus the axis and use the arrow keys, Home and End, to read any year.
 */
export default function TenureChart({
  roles,
  initialYear,
}: {
  roles: Career[]
  initialYear: number
}) {
  const ui = useUI()
  const { lang } = useLanguage()
  // The server's year (the one the static page was built in) is what the first client render uses, so it matches the HTML even for a
  // page built before New Year and opened after it; the effect swaps in the visitor's year. The fraction of the year differs on
  // every render, so it waits for the effect as well.
  const [nowYear, setNowYear] = useState(initialYear)
  const [now, setNow] = useState(initialYear + 0.5)
  const [year, setYear] = useState(initialYear)
  const [scrub, setScrub] = useState(false)
  const [lit, setLit] = useState(false)
  const [readoutLeft, setReadoutLeft] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const axisRef = useRef<HTMLDivElement>(null)
  const readoutRef = useRef<HTMLOutputElement>(null)
  const holdTimer = useRef(0)

  const axis = tenureAxis(roles, nowYear)
  const span = axis.to - axis.from
  const pct = (y: number) => ((y - axis.from) / span) * 100
  const years = scrubYears(axis, nowYear)
  const at = pct(year)
  const byStart = (a: Career, b: Career) => a.startYear - b.startYear
  const chronological = [...roles].sort(byStart)
  const active = activeRoles(roles, year, nowYear).sort(byStart)
  const roleName = (r: Career) => (lang === 'ko' && r.roleKo ? r.roleKo : r.role)
  // the last stop is today: REF's reading says "Now" there instead of the year
  const stop = year === nowYear ? ui.tenure.now : String(year)
  const readout = active.length
    ? fill(ui.tenure.readout, {
        year: stop,
        roles: active.map((r) => `${r.company}, ${roleName(r)}`).join(' · '),
      })
    : stop

  const yearAt = (clientX: number) => {
    const r = axisRef.current?.getBoundingClientRect()
    if (!r || r.width === 0) return null
    const y = Math.round(axis.from + ((clientX - r.left) / r.width) * span)
    return Math.min(nowYear, Math.max(axis.from, y))
  }
  const release = () => {
    // the reading stays up while the axis has keyboard focus (a click focuses it too, but that is not keyboard focus)
    if (!axisRef.current?.matches(':focus-visible')) setScrub(false)
  }
  const read = (e: PointerEvent<HTMLElement>) => {
    window.clearTimeout(holdTimer.current)
    setScrub(true)
    const y = yearAt(e.clientX)
    if (y !== null) setYear(y)
  }
  const leave = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch') holdTimer.current = window.setTimeout(release, TOUCH_HOLD_MS)
    else release()
  }
  const pointerProps = { onPointerMove: read, onPointerDown: read, onPointerLeave: leave }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = STEP[e.key]
    let next: number | null = null
    if (step) next = year + step
    else if (e.key === 'Home') next = axis.from
    else if (e.key === 'End') next = nowYear
    if (next === null) return
    e.preventDefault()
    setScrub(true)
    setYear(Math.min(nowYear, Math.max(axis.from, next)))
  }

  useEffect(() => {
    const today = new Date()
    if (today.getFullYear() !== initialYear) {
      setNowYear(today.getFullYear())
      setYear(today.getFullYear())
    }
    setNow(yearFraction(today))
    return () => window.clearTimeout(holdTimer.current)
  }, [initialYear])

  // the bars glow once, the first time the chart is mostly in view (they are drawn either way)
  useEffect(() => {
    const el = rootRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLit(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // the reading follows the scrub line, kept inside the axis
  useEffect(() => {
    const place = () => {
      const axisEl = axisRef.current
      const out = readoutRef.current
      if (!axisEl || !out) return
      const aw = axisEl.clientWidth
      const ow = out.offsetWidth
      setReadoutLeft(Math.round(Math.max(0, Math.min(aw - ow, (at / 100) * aw - ow / 2))))
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [at, readout, scrub])

  // built here, not inside className: prettier-plugin-tailwindcss trims the spaces of class strings written in the attribute
  const rootClass = ['rh-xp', scrub && 'rh-scrub', lit && 'rh-lit'].filter(Boolean).join(' ')
  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={{ '--rh-scrub': `${at.toFixed(3)}%` } as CSSProperties}
    >
      <ol className="rh-exp">
        {roles.map((r) => {
          const { left, width } = barSpan(r, axis, Math.min(now, axis.to))
          return (
            <li key={r.company} className={active.includes(r) ? 'rh-on' : undefined}>
              <h3>
                {r.href ? <Link href={r.href}>{r.company}</Link> : r.company}
                {/* the company and the role run together in the markup: a reader would announce "UJETSoftware Engineer 2" */}
                <span className="sr-only">{', '}</span>
                <span className="rh-role">{roleName(r)}</span>
              </h3>
              <span className="rh-period">{r.period}</span>
              <p>{lang === 'ko' && r.descriptionKo ? r.descriptionKo : r.description}</p>
              {r.techStack && <p className="rh-stack">{r.techStack.join(' · ')}</p>}
              <div className="rh-track" aria-hidden="true" {...pointerProps}>
                <i
                  className="rh-bar"
                  style={
                    {
                      '--rh-a': `${left.toFixed(3)}%`,
                      '--rh-w': `${width.toFixed(3)}%`,
                      '--rh-i': chronological.indexOf(r),
                    } as CSSProperties
                  }
                >
                  {r.endYear === null && <b className="rh-now" />}
                </i>
                <b className="rh-mark" />
              </div>
            </li>
          )
        })}
      </ol>
      <div
        ref={axisRef}
        className="rh-axis"
        tabIndex={0}
        role="slider"
        aria-label={ui.tenure.label}
        aria-valuemin={axis.from}
        aria-valuemax={nowYear}
        aria-valuenow={year}
        aria-valuetext={readout}
        onKeyDown={onKeyDown}
        onFocus={(e) => {
          if (e.currentTarget.matches(':focus-visible')) setScrub(true)
        }}
        onBlur={() => setScrub(false)}
        {...pointerProps}
      >
        {years.map((y, i) => (
          <span
            key={y}
            className={i % 2 ? 'rh-tick rh-odd' : 'rh-tick'}
            style={{ left: `${pct(y).toFixed(3)}%` }}
          >
            {y}
          </span>
        ))}
        <b className="rh-mark" aria-hidden="true" />
        <output
          ref={readoutRef}
          className="rh-readout"
          aria-hidden="true"
          style={{ left: readoutLeft }}
        >
          {readout}
        </output>
      </div>
      <p className="rh-hint">{ui.tenure.hint}</p>
    </div>
  )
}
