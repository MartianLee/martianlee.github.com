import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force'
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force'
import type { GraphLink, GraphNode } from './graphModel.ts'

export interface Point {
  x: number
  y: number
}

export const LAYOUT_SEED = 1337
export const LAYOUT_TICKS = 300
const ANCHOR_RX = 250
const ANCHOR_RY = 180

/** Neighbouring topics sit next to each other around the anchor ellipse. */
export const ANCHOR_ORDER = [
  'ai-infrastructure',
  'llm-research',
  'backend-architecture',
  'backend',
  'devops-cloud',
  'algorithms',
  'software-engineering',
  'uncategorized',
  'dev-life',
  'web-frontend',
]

export function topicAnchor(topic?: string): Point {
  const i = ANCHOR_ORDER.indexOf(topic || '')
  if (i < 0) return { x: 0, y: 0 }
  const a = (i / ANCHOR_ORDER.length) * Math.PI * 2 - Math.PI / 2
  return { x: Math.cos(a) * ANCHOR_RX, y: Math.sin(a) * ANCHOR_RY }
}

/** Small seeded PRNG so the layout is identical on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface SimNode extends SimulationNodeDatum {
  id: string
  kind: 'note' | 'tag'
  topic?: string
  degree: number
  radius: number
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  kind: 'link' | 'tag'
}

function anchorStrength(d: SimNode): number {
  if (d.kind !== 'note') return 0.005
  return d.degree === 0 ? 0.03 : 0.005
}

/**
 * Static force layout: runs LAYOUT_TICKS iterations synchronously and returns positions.
 * Nodes present in `previous` start from their old position so filter changes feel stable.
 */
export function computeLayout(
  nodes: GraphNode[],
  links: GraphLink[],
  previous: Map<string, Point> = new Map()
): Map<string, Point> {
  const rnd = mulberry32(LAYOUT_SEED)
  const simNodes: SimNode[] = nodes.map((n) => {
    const prev = previous.get(n.id)
    const anchor = n.kind === 'note' ? topicAnchor(n.topic) : { x: 0, y: 0 }
    return {
      id: n.id,
      kind: n.kind,
      topic: n.topic,
      degree: n.degree,
      radius: n.radius,
      x: prev ? prev.x : anchor.x + (rnd() - 0.5) * 120,
      y: prev ? prev.y : anchor.y + (rnd() - 0.5) * 120,
    }
  })
  const ids = new Set(simNodes.map((n) => n.id))
  const simLinks: SimLink[] = links
    .filter((l) => ids.has(l.source) && ids.has(l.target))
    .map((l) => ({ source: l.source, target: l.target, kind: l.kind }))

  const sim = forceSimulation<SimNode>(simNodes)
    .randomSource(rnd)
    .force('charge', forceManyBody<SimNode>().strength(-70).distanceMax(400))
    .force(
      'link',
      forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance((l) => (l.kind === 'link' ? 72 : 110))
        .strength((l) => (l.kind === 'link' ? 0.05 : 0.015))
    )
    .force(
      'collide',
      forceCollide<SimNode>((d) => d.radius + 4)
    )
    .force(
      'x',
      forceX<SimNode>((d) => (d.kind === 'note' ? topicAnchor(d.topic).x : 0)).strength(
        anchorStrength
      )
    )
    .force(
      'y',
      forceY<SimNode>((d) => (d.kind === 'note' ? topicAnchor(d.topic).y : 0)).strength(
        anchorStrength
      )
    )
    .stop()
  // No forceCenter: it ignores alpha and would drag a lone node to the origin; the anchors and
  // the view's fit() already keep the picture centred.
  sim.tick(LAYOUT_TICKS)

  const out = new Map<string, Point>()
  for (const s of simNodes) out.set(s.id, { x: s.x ?? 0, y: s.y ?? 0 })
  return out
}
