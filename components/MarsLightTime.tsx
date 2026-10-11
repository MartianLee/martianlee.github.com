'use client'

import { useEffect, useState } from 'react'
import { marsClock } from '@/lib/mars/clock'
import { formatLightTime } from '@/lib/mars/format'
import { fill } from '@/lib/ui-strings'
import { useUI } from './useUI'
import { useLanguage } from './LanguageProvider'

const seoulTime = (d: Date): string =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(d)

/** Live sentence: Seoul time + Earth→Mars light time. Renders nothing until mounted (no build-time values). */
export default function MarsLightTime({ variant }: { variant: 'contact' | 'notFound' }) {
  const ui = useUI()
  const { lang } = useLanguage()
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  if (!now) return <span className="rh-live-placeholder" aria-hidden="true" />
  const d = formatLightTime(marsClock(now.getTime()).lightSec, lang)
  if (variant === 'notFound') return <span>{fill(ui.notFound.mars, { d })}</span>
  return (
    <span>
      {fill(ui.contact.seoul, { time: seoulTime(now) })} {fill(ui.contact.mars, { d })}
    </span>
  )
}
