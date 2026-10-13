'use client'

import type { ReactNode } from 'react'
import { useUI } from './useUI'

/**
 * A table wider than the column scrolls inside this box. The box takes focus so the keyboard can scroll it, and a focusable box
 * needs a role and a name to be announced as something.
 */
const TableWrapper = ({ children }: { children?: ReactNode }) => {
  const ui = useUI()
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className="w-full overflow-x-auto" tabIndex={0} role="region" aria-label={ui.post.table}>
      <table>{children}</table>
    </div>
  )
}

export default TableWrapper
