'use client'

import Link from '@/components/Link'
import { mossText } from '@/components/climate/styles'
import { useUI } from '@/components/useUI'

/**
 * Entry point to /climate from the About page. The nav bar deliberately omits
 * Climate until the hub has more content, so this is the only in-site door to it
 * besides the TomorrowUse row in Experience.
 */
export default function ClimateCallout() {
  const c = useUI().about.climate
  return (
    <aside className="border-line bg-surface rounded-lg border border-l-[3px] border-l-[#8fae6c] p-4 sm:p-5 dark:border-l-[#5b7040]">
      <p className={`font-mono text-[11px] tracking-[0.16em] uppercase ${mossText}`}>{c.eyebrow}</p>
      <p className="text-ink/80 mt-2 font-serif text-base leading-relaxed break-keep">{c.body}</p>
      <Link
        href="/climate"
        className="editorial-link mt-3 inline-block font-mono text-xs font-semibold"
      >
        {c.link}
      </Link>
    </aside>
  )
}
