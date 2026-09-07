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
  noteMatchesFilters,
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
    if (id && !id.startsWith('tag:')) {
      const post = data.postIndex.find((p) => p.slug === id)
      // A note hidden by the topic/stage filter cannot be focused; widen the filter so it is drawn.
      if (post) {
        setFilters((f) =>
          noteMatchesFilters(post, f) ? f : { ...f, topics: new Set<string>(), stage: 'all' }
        )
      }
    }
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

  // A selected tag node disappears when tag nodes are switched off; drop the selection with it.
  useEffect(() => {
    if (!filters.tags && selectedId?.startsWith('tag:')) setSelectedId(null)
  }, [filters.tags, selectedId])

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
          sidebar={
            <KBSidebar
              activeSlug={selectedId ?? undefined}
              onSelect={(slug) => select(slug, { focus: true })}
            />
          }
          main={
            <div className="flex h-full min-h-0 flex-col">
              <KBGraphControls />
              <KBGraphSvg />
            </div>
          }
          context={<KBGraphPanel />}
          breadcrumb={<span style={{ color: 'var(--kb-text-strong)' }}>Graph</span>}
          statusBar={
            <div className="flex w-full min-w-0 items-center gap-3 overflow-hidden whitespace-nowrap">
              <span style={{ color: 'var(--kb-accent)' }}>&#9679; KB</span>
              <span>{`${data.postIndex.length} notes`}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="hidden sm:inline">{`${data.topics.length} topics`}</span>
              <span>&middot;</span>
              <span>{`${linked} linked`}</span>
              <span>&middot;</span>
              <span style={{ color: 'var(--kb-accent)' }}>{`${ORPHANS.length} orphans`}</span>
              <span className="ml-auto hidden lg:inline">
                Esc to deselect &middot; / to filter &middot;
              </span>
              <KBSearchTrigger className="hidden transition-colors hover:text-[var(--kb-accent)] sm:ml-auto sm:inline lg:ml-0">
                Cmd+K to search
              </KBSearchTrigger>
            </div>
          }
        />
      </div>
    </KBGraphContext.Provider>
  )
}
