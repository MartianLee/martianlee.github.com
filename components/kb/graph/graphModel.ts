import type { KBData, KBPostEntry } from '../types'

export type NodeKind = 'note' | 'tag'

export interface GraphNode {
  id: string
  kind: NodeKind
  /** Text drawn next to the node: shortTitle for notes, "#tag" for tags. */
  label: string
  /** Full title (notes) or tag name (tags) for tooltips and panels. */
  title: string
  topic?: string
  stage?: string
  date?: string
  tags: string[]
  inDegree: number
  outDegree: number
  /** Explicit-link degree for notes; member count for tags. */
  degree: number
  radius: number
}

export interface GraphLink {
  source: string
  target: string
  kind: 'link' | 'tag'
}

export interface GraphFilters {
  /** Empty set = every topic. */
  topics: Set<string>
  /** 'all' or a stage id. */
  stage: string
  /** Show tag nodes and tag links. */
  tags: boolean
}

export const DEFAULT_FILTERS: GraphFilters = { topics: new Set(), stage: 'all', tags: true }

export function nodeRadius(node: { kind: NodeKind; degree: number }): number {
  if (node.kind === 'tag') return Math.min(7, 2.5 + node.degree * 0.3)
  return Math.min(14, 3.5 + 1.5 * Math.sqrt(node.degree))
}

export interface Degrees {
  inDegree: number
  outDegree: number
}

/** Explicit-link degrees for every note in postIndex. */
export function degreesOf(data: KBData): Map<string, Degrees> {
  const m = new Map<string, Degrees>()
  for (const p of data.postIndex) m.set(p.slug, { inDegree: 0, outDegree: 0 })
  for (const [source, targets] of Object.entries(data.forwardLinks)) {
    const s = m.get(source)
    if (!s) continue
    for (const target of targets) {
      const t = m.get(target)
      if (!t || target === source) continue
      s.outDegree += 1
      t.inDegree += 1
    }
  }
  return m
}

/** forwardLinks flattened into directed link objects between known notes. */
export function explicitLinks(data: KBData): GraphLink[] {
  const slugs = new Set(data.postIndex.map((p) => p.slug))
  const out: GraphLink[] = []
  for (const [source, targets] of Object.entries(data.forwardLinks)) {
    if (!slugs.has(source)) continue
    for (const target of targets) {
      if (slugs.has(target) && target !== source) out.push({ source, target, kind: 'link' })
    }
  }
  return out
}

export function noteMatchesFilters(p: KBPostEntry, f: GraphFilters): boolean {
  return (
    (f.topics.size === 0 || f.topics.has(p.topic)) && (f.stage === 'all' || p.stage === f.stage)
  )
}

export function buildGraph(
  data: KBData,
  filters: GraphFilters = DEFAULT_FILTERS
): { nodes: GraphNode[]; links: GraphLink[] } {
  const deg = degreesOf(data)
  const visible = data.postIndex.filter((p) => noteMatchesFilters(p, filters))
  const visibleIds = new Set(visible.map((p) => p.slug))

  const nodes: GraphNode[] = visible.map((p) => {
    const d = deg.get(p.slug) ?? { inDegree: 0, outDegree: 0 }
    const degree = d.inDegree + d.outDegree
    return {
      id: p.slug,
      kind: 'note',
      label: p.shortTitle || p.title,
      title: p.title,
      topic: p.topic,
      stage: p.stage,
      date: p.date,
      tags: p.tags,
      inDegree: d.inDegree,
      outDegree: d.outDegree,
      degree,
      radius: nodeRadius({ kind: 'note', degree }),
    }
  })

  const links: GraphLink[] = explicitLinks(data).filter(
    (l) => visibleIds.has(l.source) && visibleIds.has(l.target)
  )

  if (filters.tags) {
    const tagLinks = data.graph.tagLinks.filter((l) => visibleIds.has(l.source))
    const used = new Set(tagLinks.map((l) => l.target))
    for (const t of data.graph.tagNodes) {
      if (!used.has(t.id)) continue
      nodes.push({
        id: t.id,
        kind: 'tag',
        label: `#${t.label}`,
        title: t.label,
        tags: [],
        inDegree: 0,
        outDegree: 0,
        degree: t.count,
        radius: nodeRadius({ kind: 'tag', degree: t.count }),
      })
    }
    for (const l of tagLinks) links.push({ source: l.source, target: l.target, kind: 'tag' })
  }

  return { nodes, links }
}

/** The node itself plus everything one link away (either direction, any kind). */
export function neighbourIds(links: GraphLink[], id: string): Set<string> {
  const s = new Set<string>([id])
  for (const l of links) {
    if (l.source === id) s.add(l.target)
    else if (l.target === id) s.add(l.source)
  }
  return s
}

/** Notes with no explicit link in or out, in postIndex order. */
export function orphanIds(data: KBData): string[] {
  const deg = degreesOf(data)
  return data.postIndex
    .filter((p) => {
      const d = deg.get(p.slug)
      return !d || d.inDegree + d.outDegree === 0
    })
    .map((p) => p.slug)
}

/** Orphans that are not even attached to a tag node. */
export function isolatedIds(data: KBData): string[] {
  const tagged = new Set(data.graph.tagLinks.map((l) => l.source))
  return orphanIds(data).filter((slug) => !tagged.has(slug))
}

/** Top-n notes by backlinks (ties: total degree, then slug). Notes without backlinks never qualify. */
export function hubIds(data: KBData, n = 8): string[] {
  const deg = degreesOf(data)
  return data.postIndex
    .map((p) => ({ slug: p.slug, ...(deg.get(p.slug) ?? { inDegree: 0, outDegree: 0 }) }))
    .filter((d) => d.inDegree > 0)
    .sort(
      (a, b) =>
        b.inDegree - a.inDegree ||
        b.inDegree + b.outDegree - (a.inDegree + a.outDegree) ||
        a.slug.localeCompare(b.slug)
    )
    .slice(0, n)
    .map((d) => d.slug)
}

export interface RelatedNote {
  slug: string
  title: string
  sharedTags: string[]
}

/**
 * Notes that share at least `minShared` tags with `slug` but have no link in either
 * direction. Most shared tags first, then newest first.
 */
export function relatedUnlinked(
  data: KBData,
  slug: string,
  opts: { minShared?: number; limit?: number } = {}
): RelatedNote[] {
  const { minShared = 2, limit = 5 } = opts
  const me = data.postIndex.find((p) => p.slug === slug)
  if (!me) return []
  const linked = new Set<string>(data.forwardLinks[slug] || [])
  for (const b of data.backlinks[slug] || []) linked.add(b.slug)
  const mine = new Set(me.tags.map((t) => t.toLowerCase()))
  return data.postIndex
    .filter((p) => p.slug !== slug && !linked.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      sharedTags: [...new Set(p.tags.map((t) => t.toLowerCase()))].filter((t) => mine.has(t)),
    }))
    .filter((r) => r.sharedTags.length >= minShared)
    .sort((a, b) => b.sharedTags.length - a.sharedTags.length || b.date.localeCompare(a.date))
    .slice(0, limit)
    .map(({ slug: s, title, sharedTags }) => ({ slug: s, title, sharedTags }))
}

/** Ids matching a free-text query against title, label, id and tags. `null` when the query is blank. */
export function searchIds(nodes: GraphNode[], query: string): Set<string> | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const out = new Set<string>()
  for (const n of nodes) {
    const hay = [n.title, n.label, n.id, ...n.tags].join('\n').toLowerCase()
    if (hay.includes(q)) out.add(n.id)
  }
  return out
}

export type LabelTier = 0 | 1 | 2 | 3

/**
 * 0 = forced (hover/selection neighbourhood, search match), 1 = hubs and tags on 5+ notes,
 * 2 = at 1.3x zoom: notes with 2+ links / tags on 3+ notes, 3 = at 2.2x zoom: everything.
 */
export function labelTier(
  node: GraphNode,
  k: number,
  forced: boolean,
  hubs: Set<string>
): LabelTier | null {
  if (forced) return 0
  if (node.kind === 'tag' ? node.degree >= 5 : hubs.has(node.id)) return 1
  if (k >= 2.2) return 3
  if (k >= 1.3 && (node.kind === 'tag' ? node.degree >= 3 : node.degree >= 2)) return 2
  return null
}

export const LABEL_FONT_PX = 10
export const LABEL_CHAR_W = 6.3
export const LABEL_LINE_H = 13
export const LABEL_GAP = 3

export interface LabelCandidate {
  id: string
  tier: number
  priority: number
  x: number
  y: number
  radius: number
  text: string
}

/**
 * Greedy label placement in graph units. Labels keep a constant on-screen size, so their
 * boxes shrink by 1/k as the view zooms in. Lower tier first, then higher priority.
 */
export function placeLabels(candidates: LabelCandidate[], k: number): Set<string> {
  const sorted = [...candidates].sort(
    (a, b) => a.tier - b.tier || b.priority - a.priority || a.id.localeCompare(b.id)
  )
  const placed: { x0: number; y0: number; x1: number; y1: number }[] = []
  const shown = new Set<string>()
  for (const c of sorted) {
    const w = (c.text.length * LABEL_CHAR_W) / k
    const h = LABEL_LINE_H / k
    const x0 = c.x + c.radius + LABEL_GAP
    const box = { x0, y0: c.y - h / 2, x1: x0 + w, y1: c.y + h / 2 }
    const overlaps = placed.some(
      (b) => !(box.x1 < b.x0 || box.x0 > b.x1 || box.y1 < b.y0 || box.y0 > b.y1)
    )
    if (overlaps) continue
    placed.push(box)
    shown.add(c.id)
  }
  return shown
}
