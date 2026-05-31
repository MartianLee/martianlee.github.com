'use client'

import { ReactNode } from 'react'

/** Opens the KB search palette by dispatching the event KBSearchPalette listens for. */
export default function KBSearchTrigger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event('kb:open-search'))}
    >
      {children}
    </button>
  )
}
