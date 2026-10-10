'use client'

import { useEffect, useState } from 'react'
import { marsClock, type MarsClock } from '@/lib/mars/clock'
import { formatClock, formatLightTime, formatMsd } from '@/lib/mars/format'
import { useUI } from '../useUI'
import { useLanguage } from '../LanguageProvider'

/** REF's readout pads the seconds ("13 min 05 s"; the shared formatter does not). Korean has no REF and keeps the natural "13분 5초". */
function lightTime(sec: number, lang: 'en' | 'ko'): string {
  if (lang === 'ko') return formatLightTime(sec, 'ko')
  const whole = Math.round(sec)
  return `${Math.floor(whole / 60)} min ${String(whole % 60).padStart(2, '0')} s`
}

/** Live Mars telemetry: Jezero local solar time, MTC, sol date, season and Earth-Mars light time, once a second. */
export default function MarsHud() {
  const ui = useUI()
  const { lang } = useLanguage()
  // null on the server and for the first client render, so the static export never bakes in a build-time clock
  const [c, setC] = useState<MarsClock | null>(null)
  useEffect(() => {
    const tick = () => setC(marsClock(Date.now()))
    tick()
    const id = window.setInterval(() => {
      if (!document.hidden) tick()
    }, 1000)
    return () => window.clearInterval(id)
  }, [])
  const dash = '—'
  return (
    <aside className={c ? 'rh-hud rh-hud-on' : 'rh-hud'} aria-label="Live Mars telemetry">
      <p className="rh-live">
        <i aria-hidden="true" />
        {ui.hud.live}
      </p>
      <dl>
        <dt>{ui.hud.lmst}</dt>
        <dd>{c ? formatClock(c.lmstJezero) : dash}</dd>
        <dt className="rh-opt">{ui.hud.mtc}</dt>
        <dd className="rh-opt">{c ? formatClock(c.mtc) : dash}</dd>
        <dt className="rh-opt">{ui.hud.msd}</dt>
        <dd className="rh-opt">{c ? formatMsd(c.msd) : dash}</dd>
        <dt>{ui.hud.season}</dt>
        <dd>
          {c ? `MY ${c.my} · Ls ${c.ls.toFixed(1)}°` : dash}
          {c && (
            <span className="rh-opt">
              {' '}
              · {ui.hud.northern} {ui.hud.seasons[c.season]}
            </span>
          )}
        </dd>
        <dt>{ui.hud.light}</dt>
        <dd>{c ? lightTime(c.lightSec, lang) : dash}</dd>
      </dl>
    </aside>
  )
}
