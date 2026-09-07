'use client'

import { createContext, useContext } from 'react'
import type { KBData } from '@/components/kb/types'
import type { GraphFilters, GraphLink, GraphNode } from './graphModel'

export interface FocusRequest {
  id: string
  seq: number
}

export interface KBGraphState {
  data: KBData
  nodes: GraphNode[]
  links: GraphLink[]
  filters: GraphFilters
  setFilters: (f: GraphFilters) => void
  query: string
  setQuery: (q: string) => void
  hoverId: string | null
  setHoverId: (id: string | null) => void
  selectedId: string | null
  select: (id: string | null, opts?: { focus?: boolean }) => void
  focusRequest: FocusRequest | null
  hubs: Set<string>
  orphans: string[]
  isolated: Set<string>
}

export const KBGraphContext = createContext<KBGraphState | null>(null)

export function useKBGraph(): KBGraphState {
  const ctx = useContext(KBGraphContext)
  if (!ctx) throw new Error('useKBGraph must be used inside <KBGraphView>')
  return ctx
}
