const pad2 = (n: number): string => String(n).padStart(2, '0')

export function formatClock(hours: number, withSeconds = true): string {
  const total = Math.floor((((hours % 24) + 24) % 24) * 3600)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return withSeconds ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`
}

/**
 * "13 min 5 s" / "13분 5초". `pad` keeps the English seconds two digits wide ("13 min 05 s") for a readout that ticks in place;
 * Korean has no such reference and stays natural.
 */
export function formatLightTime(
  sec: number,
  lang: 'en' | 'ko',
  opts: { pad?: boolean } = {}
): string {
  const whole = Math.round(sec)
  const m = Math.floor(whole / 60)
  const s = whole % 60
  if (lang === 'ko') return `${m}분 ${s}초`
  return `${m} min ${opts.pad ? pad2(s) : s} s`
}

export function formatMsd(msd: number): string {
  return msd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
