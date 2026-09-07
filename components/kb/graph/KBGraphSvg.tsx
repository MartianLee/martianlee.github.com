'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useKBGraph } from './KBGraphContext'
import { computeLayout, type Point } from './layout'
import {
  labelTier,
  neighbourIds,
  placeLabels,
  searchIds,
  LABEL_GAP,
  type GraphLink,
  type GraphNode,
  type LabelCandidate,
} from './graphModel'
import { STAGE_ICON, topicColor, topicLabel } from './topicColors'

interface View {
  k: number
  x: number
  y: number
}

const MIN_K = 0.25
const MAX_K = 4
const FOCUS_K = 2
const TIP_W = 300

function ZoomButton({
  label,
  title,
  onClick,
}: {
  label: string
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="h-6 w-6 rounded border text-[13px] leading-none transition-colors hover:text-[var(--kb-accent)]"
      style={{
        background: 'var(--kb-surface)',
        borderColor: 'var(--kb-border)',
        color: 'var(--kb-text-muted)',
      }}
    >
      {label}
    </button>
  )
}

export default function KBGraphSvg() {
  const g = useKBGraph()
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const positionsRef = useRef<Map<string, Point>>(new Map())
  const [positions, setPositions] = useState<Map<string, Point>>(new Map())
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ sx: number; sy: number; vx: number; vy: number; moved: boolean } | null>(
    null
  )
  const [tip, setTip] = useState<{ node: GraphNode; x: number; y: number } | null>(null)

  const size = useCallback(
    () => ({ w: svgRef.current?.clientWidth || 800, h: svgRef.current?.clientHeight || 600 }),
    []
  )

  const fit = useCallback(
    (pos: Map<string, Point>) => {
      if (pos.size === 0) return
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const p of pos.values()) {
        minX = Math.min(minX, p.x)
        maxX = Math.max(maxX, p.x)
        minY = Math.min(minY, p.y)
        maxY = Math.max(maxY, p.y)
      }
      const { w, h } = size()
      const bw = maxX - minX + 120
      const bh = maxY - minY + 80
      const k = Math.max(0.35, Math.min(1.8, Math.min(w / bw, h / bh)))
      setView({ k, x: w / 2 - ((minX + maxX) / 2) * k, y: h / 2 - ((minY + maxY) / 2) * k })
    },
    [size]
  )

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const k = Math.max(MIN_K, Math.min(MAX_K, v.k * factor))
      return { k, x: cx - (cx - v.x) * (k / v.k), y: cy - (cy - v.y) * (k / v.k) }
    })
  }, [])

  // Recompute the layout whenever the node/link set changes; surviving nodes keep their place.
  useEffect(() => {
    const next = computeLayout(g.nodes, g.links, positionsRef.current)
    positionsRef.current = next
    setPositions(next)
    fit(next)
  }, [g.nodes, g.links, fit])

  // Zoom to a node when the panel or sidebar asks for it.
  useEffect(() => {
    if (!g.focusRequest) return
    const p = positionsRef.current.get(g.focusRequest.id)
    if (!p) return
    const { w, h } = size()
    setView({ k: FOCUS_K, x: w / 2 - p.x * FOCUS_K, y: h / 2 - p.y * FOCUS_K })
  }, [g.focusRequest, size])

  // Wheel zoom needs a non-passive listener so the page does not scroll.
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const focusId = g.hoverId ?? g.selectedId
  const nodeIds = useMemo(() => new Set(g.nodes.map((n) => n.id)), [g.nodes])
  const focus = useMemo(
    () => (focusId && nodeIds.has(focusId) ? neighbourIds(g.links, focusId) : null),
    [focusId, nodeIds, g.links]
  )
  const match = useMemo(() => searchIds(g.nodes, g.query), [g.nodes, g.query])

  const shownLabels = useMemo(() => {
    const cands: LabelCandidate[] = []
    for (const n of g.nodes) {
      const p = positions.get(n.id)
      if (!p) continue
      if (focus && !focus.has(n.id)) continue
      if (match && !match.has(n.id)) continue
      const forced = Boolean((focus && focus.has(n.id)) || (match && match.has(n.id)))
      const tier = labelTier(n, view.k, forced, g.hubs)
      if (tier === null) continue
      cands.push({
        id: n.id,
        tier,
        priority: n.degree,
        x: p.x,
        y: p.y,
        radius: n.radius,
        text: n.label,
      })
    }
    return placeLabels(cands, view.k)
  }, [g.nodes, positions, view.k, focus, match, g.hubs])

  const nodeClass = (n: GraphNode) => {
    const inFocus = focus ? focus.has(n.id) : true
    const inMatch = match ? match.has(n.id) : true
    const dim = !inFocus || (match !== null && !inMatch && !(focus && focus.has(n.id)))
    return [
      'kb-graph-node',
      n.kind,
      dim ? 'dim' : '',
      n.id === g.selectedId ? 'sel' : '',
      n.id === g.hoverId ? 'hover' : '',
      match && inMatch ? 'match' : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  const edgeClass = (l: GraphLink) => {
    const touches = focus !== null && (l.source === focusId || l.target === focusId)
    const dim =
      (focus !== null && !touches) ||
      (match !== null && focus === null && !(match.has(l.source) || match.has(l.target)))
    return ['kb-graph-edge', l.kind, touches ? 'hi' : '', dim ? 'dim' : '']
      .filter(Boolean)
      .join(' ')
  }

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest('.kb-graph-node')) return
    dragRef.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }))
  }
  const onPointerUp = () => {
    const d = dragRef.current
    dragRef.current = null
    setDragging(false)
    if (d && !d.moved) g.select(null)
  }

  const showTip = (n: GraphNode, e: ReactPointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({ node: n, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }
  const toggleSelect = (n: GraphNode) => g.select(n.id === g.selectedId ? null : n.id)
  const onNodeKey = (n: GraphNode) => (e: ReactKeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleSelect(n)
    }
  }

  const tipStyle = (): CSSProperties => {
    if (!tip) return {}
    const rect = wrapRef.current?.getBoundingClientRect()
    const w = rect?.width ?? 800
    const h = rect?.height ?? 600
    const left = tip.x + 14 + TIP_W > w ? tip.x - 14 - TIP_W : tip.x + 14
    const top = tip.y + 60 > h ? tip.y - 60 : tip.y + 14
    return { left, top, maxWidth: TIP_W }
  }

  const svgStyle = { background: 'var(--kb-bg)', '--kb-graph-k': view.k } as CSSProperties

  return (
    <div ref={wrapRef} className="relative min-h-0 flex-1">
      <svg
        ref={svgRef}
        role="application"
        aria-label="Knowledge graph. Drag to pan, scroll to zoom, click a node to select it."
        className={`kb-graph h-full w-full touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={svgStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          <g>
            {g.links.map((l) => {
              const a = positions.get(l.source)
              const b = positions.get(l.target)
              if (!a || !b) return null
              return (
                <line
                  key={`${l.source}>${l.target}`}
                  className={edgeClass(l)}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                />
              )
            })}
          </g>
          <g>
            {g.nodes.map((n) => {
              const p = positions.get(n.id)
              if (!p) return null
              return (
                <g
                  key={n.id}
                  className={nodeClass(n)}
                  transform={`translate(${p.x},${p.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={n.title}
                  aria-pressed={n.id === g.selectedId}
                  onPointerEnter={(e) => {
                    g.setHoverId(n.id)
                    showTip(n, e)
                  }}
                  onPointerMove={(e) => showTip(n, e)}
                  onPointerLeave={() => {
                    g.setHoverId(null)
                    setTip(null)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelect(n)
                  }}
                  onKeyDown={onNodeKey(n)}
                >
                  <circle className="ring" r={n.radius + 4} />
                  <circle className="hit" r={Math.max(n.radius + 6, 10)} />
                  <circle
                    className="mark"
                    r={n.radius}
                    style={n.kind === 'note' ? { fill: topicColor(n.topic) } : undefined}
                  />
                </g>
              )
            })}
          </g>
          <g>
            {g.nodes.map((n) => {
              if (!shownLabels.has(n.id)) return null
              const p = positions.get(n.id)
              if (!p) return null
              return (
                <text
                  key={n.id}
                  className={`kb-graph-label ${n.kind}`}
                  x={p.x + n.radius + LABEL_GAP}
                  y={p.y}
                >
                  {n.label}
                </text>
              )
            })}
          </g>
        </g>
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 rounded border px-2 py-1.5 text-[11px] shadow-lg"
          style={{
            ...tipStyle(),
            background: 'var(--kb-surface)',
            borderColor: 'var(--kb-border)',
            color: 'var(--kb-text)',
          }}
        >
          <div className="font-medium" style={{ color: 'var(--kb-text-strong)' }}>
            {tip.node.title}
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: 'var(--kb-text-muted)' }}>
            {tip.node.kind === 'tag'
              ? `${tip.node.degree} notes share this tag`
              : `${topicLabel(tip.node.topic)} · ${STAGE_ICON[tip.node.stage || ''] || ''} ${tip.node.stage} · ${(tip.node.date || '').slice(0, 10)} · ↓${tip.node.inDegree} ↑${tip.node.outDegree}${tip.node.degree === 0 ? ' · orphan' : ''}`}
          </div>
        </div>
      )}

      {g.nodes.length === 0 && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          No notes match the current filters.
        </div>
      )}

      <div className="absolute right-3 bottom-3 flex flex-col gap-0.5">
        <ZoomButton
          label="+"
          title="Zoom in"
          onClick={() => zoomAt(1.3, size().w / 2, size().h / 2)}
        />
        <ZoomButton
          label="−"
          title="Zoom out"
          onClick={() => zoomAt(1 / 1.3, size().w / 2, size().h / 2)}
        />
        <ZoomButton label="⤢" title="Fit to view" onClick={() => fit(positionsRef.current)} />
      </div>
    </div>
  )
}
