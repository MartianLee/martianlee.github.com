'use client'

import { fill } from '@/lib/ui-strings'
import { useUI } from './useUI'

/** Tag count for the /tags band telemetry line, localized (the page itself is a server component). */
export default function TagCountTele({ count }: { count: number }) {
  const ui = useUI()
  return <span>{fill(ui.band.tagCount, { n: count })}</span>
}
