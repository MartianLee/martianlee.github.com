import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { GraphLink, GraphNode } from './graphModel.ts'
import { computeLayout, topicAnchor, mulberry32 } from './layout.ts'

function n(id: string, over: Partial<GraphNode> = {}): GraphNode {
  return {
    kind: 'note',
    label: id,
    title: id,
    tags: [],
    inDegree: 0,
    outDegree: 0,
    degree: 0,
    radius: 4,
    topic: 'dev-life',
    ...over,
    id,
  }
}

test('mulberry32 is deterministic', () => {
  const a = mulberry32(7)
  const b = mulberry32(7)
  assert.equal(a(), b())
  assert.equal(a(), b())
})

test('topicAnchor spreads topics around an ellipse, unknown topics at the centre', () => {
  const ai = topicAnchor('ai-infrastructure')
  const web = topicAnchor('web-frontend')
  assert.ok(Math.abs(ai.x) <= 250 && Math.abs(ai.y) <= 180)
  assert.notDeepEqual(ai, web)
  assert.deepEqual(topicAnchor('nope'), { x: 0, y: 0 })
})

test('computeLayout positions every node deterministically and pulls linked nodes together', () => {
  const nodes = [
    n('a', { degree: 1, topic: 'ai-infrastructure' }),
    n('b', { degree: 1, topic: 'ai-infrastructure' }),
    n('far', { degree: 0, topic: 'web-frontend' }),
    n('tag:x', { kind: 'tag', degree: 3 }),
  ]
  const links: GraphLink[] = [
    { source: 'a', target: 'b', kind: 'link' },
    { source: 'a', target: 'tag:x', kind: 'tag' },
  ]
  const first = computeLayout(nodes, links)
  const second = computeLayout(nodes, links)
  assert.deepEqual([...first.keys()].sort(), ['a', 'b', 'far', 'tag:x'])
  for (const p of first.values()) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y))
  assert.deepEqual(first, second)
  const dist = (p: string, q: string) =>
    Math.hypot(first.get(p)!.x - first.get(q)!.x, first.get(p)!.y - first.get(q)!.y)
  assert.ok(dist('a', 'b') < dist('a', 'far'))
})

test('computeLayout starts surviving nodes from their previous position', () => {
  const nodes = [n('solo')]
  const fresh = computeLayout(nodes, [])
  const resumed = computeLayout(nodes, [], new Map([['solo', { x: 500, y: 500 }]]))
  // Both runs drift toward the dev-life anchor (x ≈ -238), but the resumed one starts far to
  // the right and never fully converges, so it ends up clearly right of the fresh run.
  assert.notDeepEqual(fresh.get('solo'), resumed.get('solo'))
  assert.ok(resumed.get('solo')!.x > fresh.get('solo')!.x + 10)
})
