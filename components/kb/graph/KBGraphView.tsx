'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import KBShell from '@/components/kb/KBShell'
import KBSidebar from '@/components/kb/KBSidebar'
import KBSearchTrigger from '@/components/kb/KBSearchTrigger'
import kbData from 'app/kb-data.json'
import type { KBData } from '@/components/kb/types'
import { KBGraphContext, type FocusRequest, type KBGraphState } from './KBGraphContext'
import {
  buildGraph,
  DEFAULT_FILTERS,
  hubIds,
  isolatedIds,
  orphanIds,
  type GraphFilters,
} from './graphModel'
import KBGraphSvg from './KBGraphSvg'
import KBGraphControls from './KBGraphControls'
import KBGraphPanel from './KBGraphPanel'

const data = kbData as KBData
const HUBS = new Set(hubIds(data))
const ORPHANS = orphanIds(data)
const ISOLATED = new Set(isolatedIds(data))

export default function KBGraphView() {
  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_FILTERS)
  const [query, setQuery] = useState('')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)
  const graph = useMemo(() => buildGraph(data, filters), [filters])

  const select = useCallback((id: string | null, opts?: { focus?: boolean }) => {
    setSelectedId(id)
    if (id && opts?.focus) setFocusRequest((prev) => ({ id, seq: (prev?.seq ?? 0) + 1 }))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [select])

  const state = useMemo<KBGraphState>(
    () => ({
      data,
      nodes: graph.nodes,
      links: graph.links,
      filters,
      setFilters,
      query,
      setQuery,
      hoverId,
      setHoverId,
      selectedId,
      select,
      focusRequest,
      hubs: HUBS,
      orphans: ORPHANS,
      isolated: ISOLATED,
    }),
    [graph, filters, query, hoverId, selectedId, select, focusRequest]
  )
  const linked = data.postIndex.length - ORPHANS.length

  return (
    <KBGraphContext.Provider value={state}>
      <div className="kb-breakout">
        <KBShell
          sidebar={<KBSidebar activeSlug={selectedId ?? undefined} />}
          main={
            <div className="flex h-full min-h-0 flex-col">
              <KBGraphControls />
              <KBGraphSvg />
            </div>
          }
          context={<KBGraphPanel />}
          breadcrumb={<span style={{ color: 'var(--kb-text-strong)' }}>Graph</span>}
          statusBar={
            <div className="flex w-full items-center gap-3">
              <span style={{ color: 'var(--kb-accent)' }}>&#9679; KB</span>
              <span>{`${data.postIndex.length} notes`}</span>
              <span>&middot;</span>
              <span>{`${data.topics.length} topics`}</span>
              <span>&middot;</span>
              <span>{`${linked} linked`}</span>
              <span>&middot;</span>
              <span style={{ color: 'var(--kb-accent)' }}>{`${ORPHANS.length} orphans`}</span>
              <span className="ml-auto hidden sm:inline">Esc to deselect &middot; / to filter</span>
              <KBSearchTrigger className="transition-colors hover:text-[var(--kb-accent)]">
                &middot; Cmd+K to search
              </KBSearchTrigger>
            </div>
          }
        />
      </div>
    </KBGraphContext.Provider>
  )
}
