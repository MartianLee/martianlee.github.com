'use client'

import Link from '@/components/Link'
import { useUI } from '@/components/useUI'

/**
 * Entry point to /climate from the About page. The nav bar deliberately omits
 * Climate until the hub has more content, so this is the only in-site door to it
 * besides the TomorrowUse row in Experience. Styled with the About rh-about-climate
 * rules; the moss rule on its left edge is the Climate identity.
 */
export default function ClimateCallout() {
  const c = useUI().about.climate
  return (
    <aside className="rh-about-climate">
      <p className="rh-about-climate-eyebrow">{c.eyebrow}</p>
      <p className="rh-about-climate-body">{c.body}</p>
      <Link href="/climate" className="rh-about-climate-link">
        {c.link}
      </Link>
    </aside>
  )
}
