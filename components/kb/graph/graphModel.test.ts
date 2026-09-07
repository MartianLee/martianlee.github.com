import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { KBData, KBPostEntry } from '../types'
import {
  buildGraph,
  DEFAULT_FILTERS,
  degreesOf,
  hubIds,
  isolatedIds,
  labelTier,
  neighbourIds,
  nodeRadius,
  orphanIds,
  placeLabels,
  relatedUnlinked,
  searchIds,
} from './graphModel.ts'
import type { GraphNode, LabelCandidate } from './graphModel.ts'

function post(over: Partial<KBPostEntry> & { slug: string }): KBPostEntry {
  return {
    title: over.slug.toUpperCase(),
    shortTitle: over.slug.toUpperCase(),
    date: '2026-01-01T00:00:00.000Z',
    topic: 'dev-life',
    stage: 'budding',
    tags: [],
    summary: '',
    ...over,
  }
}

function fixture(): KBData {
  const postIndex = [
    post({
      slug: 'hub',
      topic: 'ai-infrastructure',
      tags: ['llm', 'agent', 'rust'],
      date: '2026-03-01T00:00:00.000Z',
    }),
    post({
      slug: 'a',
      topic: 'ai-infrastructure',
      tags: ['llm', 'agent'],
      date: '2026-02-01T00:00:00.000Z',
    }),
    post({
      slug: 'b',
      topic: 'ai-infrastructure',
      tags: ['llm', 'agent', 'rust'],
      stage: 'seedling',
      date: '2026-04-01T00:00:00.000Z',
    }),
    post({ slug: 'orphan-tagged', topic: 'web-frontend', tags: ['llm'] }),
    post({ slug: 'orphan-alone', topic: 'web-frontend', tags: ['rare'] }),
  ]
  return {
    topics: [],
    postIndex,
    forwardLinks: { hub: [], a: ['hub'], b: ['hub', 'a'], 'orphan-tagged': [], 'orphan-alone': [] },
    backlinks: {
      hub: [
        { slug: 'a', title: 'A' },
        { slug: 'b', title: 'B' },
      ],
      a: [{ slug: 'b', title: 'B' }],
    },
    graph: {
      tagNodes: [
        { id: 'tag:llm', label: 'llm', count: 4 },
        { id: 'tag:agent', label: 'agent', count: 3 },
      ],
      tagLinks: [
        { source: 'hub', target: 'tag:llm' },
        { source: 'hub', target: 'tag:agent' },
        { source: 'a', target: 'tag:llm' },
        { source: 'a', target: 'tag:agent' },
        { source: 'b', target: 'tag:llm' },
        { source: 'b', target: 'tag:agent' },
        { source: 'orphan-tagged', target: 'tag:llm' },
      ],
    },
    generatedAt: '2026-01-01T00:00:00.000Z',
  }
}

test('degreesOf counts explicit links in both directions', () => {
  const deg = degreesOf(fixture())
  assert.deepEqual(deg.get('hub'), { inDegree: 2, outDegree: 0 })
  assert.deepEqual(deg.get('b'), { inDegree: 0, outDegree: 2 })
  assert.deepEqual(deg.get('orphan-alone'), { inDegree: 0, outDegree: 0 })
})

test('nodeRadius grows with degree and is capped', () => {
  assert.equal(nodeRadius({ kind: 'note', degree: 0 }), 3.5)
  assert.equal(nodeRadius({ kind: 'note', degree: 4 }), 6.5)
  assert.equal(nodeRadius({ kind: 'note', degree: 400 }), 14)
  assert.equal(nodeRadius({ kind: 'tag', degree: 5 }), 4)
  assert.equal(nodeRadius({ kind: 'tag', degree: 100 }), 7)
})

test('buildGraph with default filters includes notes, tag nodes and both link kinds', () => {
  const { nodes, links } = buildGraph(fixture(), DEFAULT_FILTERS)
  assert.deepEqual(nodes.map((n) => n.id).sort(), [
    'a',
    'b',
    'hub',
    'orphan-alone',
    'orphan-tagged',
    'tag:agent',
    'tag:llm',
  ])
  assert.equal(links.filter((l) => l.kind === 'link').length, 3)
  assert.equal(links.filter((l) => l.kind === 'tag').length, 7)
  const hub = nodes.find((n) => n.id === 'hub')!
  assert.equal(hub.label, 'HUB')
  assert.equal(hub.degree, 2)
  const tag = nodes.find((n) => n.id === 'tag:llm')!
  assert.equal(tag.kind, 'tag')
  assert.equal(tag.label, '#llm')
})

test('buildGraph applies topic, stage and tags filters', () => {
  const data = fixture()
  const byTopic = buildGraph(data, { topics: new Set(['web-frontend']), stage: 'all', tags: false })
  assert.deepEqual(byTopic.nodes.map((n) => n.id).sort(), ['orphan-alone', 'orphan-tagged'])
  assert.equal(byTopic.links.length, 0)

  const byStage = buildGraph(data, { topics: new Set(), stage: 'seedling', tags: true })
  assert.deepEqual(byStage.nodes.map((n) => n.id).sort(), ['b', 'tag:agent', 'tag:llm'])
  assert.equal(byStage.links.filter((l) => l.kind === 'link').length, 0)
})

test('neighbourIds includes the node itself and both link directions', () => {
  const { links } = buildGraph(fixture(), { topics: new Set(), stage: 'all', tags: false })
  assert.deepEqual([...neighbourIds(links, 'a')].sort(), ['a', 'b', 'hub'])
})

test('orphanIds and isolatedIds', () => {
  const data = fixture()
  assert.deepEqual(orphanIds(data), ['orphan-tagged', 'orphan-alone'])
  assert.deepEqual(isolatedIds(data), ['orphan-alone'])
})

test('hubIds ranks by backlinks then total degree', () => {
  assert.deepEqual(hubIds(fixture()), ['hub', 'a'])
  assert.deepEqual(hubIds(fixture(), 1), ['hub'])
})

test('relatedUnlinked returns unlinked notes sharing 2+ tags, best first', () => {
  const related = relatedUnlinked(fixture(), 'hub')
  // a and b link to hub, so they are excluded; orphan-tagged shares only one tag.
  assert.deepEqual(related, [])

  const data = fixture()
  data.postIndex.push(post({ slug: 'c', tags: ['llm', 'rust'], date: '2026-05-01T00:00:00.000Z' }))
  data.postIndex.push(
    post({ slug: 'd', tags: ['llm', 'rust', 'agent'], date: '2026-01-15T00:00:00.000Z' })
  )
  data.forwardLinks.c = []
  data.forwardLinks.d = []
  assert.deepEqual(relatedUnlinked(data, 'hub'), [
    { slug: 'd', title: 'D', sharedTags: ['llm', 'rust', 'agent'] },
    { slug: 'c', title: 'C', sharedTags: ['llm', 'rust'] },
  ])
  assert.deepEqual(
    relatedUnlinked(data, 'hub', { limit: 1 }).map((r) => r.slug),
    ['d']
  )
  assert.deepEqual(relatedUnlinked(data, 'missing'), [])
})

function node(over: Partial<GraphNode> & { id: string }): GraphNode {
  return {
    kind: 'note',
    label: over.id,
    title: over.id,
    tags: [],
    inDegree: 0,
    outDegree: 0,
    degree: 0,
    radius: 4,
    ...over,
  }
}

test('searchIds matches title, label, id and tags case-insensitively; empty query = null', () => {
  const nodes = [
    node({
      id: '2026-01-01-webmcp',
      title: 'WebMCP Explained',
      label: 'WebMCP',
      tags: ['browser-automation'],
    }),
    node({ id: 'tag:llm', kind: 'tag', title: 'llm', label: '#llm' }),
    node({ id: 'other', title: 'Other', label: 'Other', tags: ['react'] }),
  ]
  assert.equal(searchIds(nodes, '   '), null)
  assert.deepEqual([...searchIds(nodes, 'webmcp')!], ['2026-01-01-webmcp'])
  assert.deepEqual([...searchIds(nodes, 'AUTOMATION')!], ['2026-01-01-webmcp'])
  assert.deepEqual([...searchIds(nodes, 'llm')!], ['tag:llm'])
})

test('labelTier: forced > hubs/big tags > zoom tiers', () => {
  const hubs = new Set(['hub'])
  assert.equal(labelTier(node({ id: 'x', degree: 9 }), 1, true, hubs), 0)
  assert.equal(labelTier(node({ id: 'hub', degree: 9 }), 1, false, hubs), 1)
  assert.equal(labelTier(node({ id: 't', kind: 'tag', degree: 5 }), 1, false, hubs), 1)
  assert.equal(labelTier(node({ id: 'x', degree: 3 }), 1, false, hubs), null)
  assert.equal(labelTier(node({ id: 'x', degree: 2 }), 1.3, false, hubs), 2)
  assert.equal(labelTier(node({ id: 'x', degree: 1 }), 1.3, false, hubs), null)
  assert.equal(labelTier(node({ id: 't', kind: 'tag', degree: 3 }), 1.3, false, hubs), 2)
  assert.equal(labelTier(node({ id: 'x', degree: 0 }), 2.2, false, hubs), 3)
})

test('placeLabels drops overlapping lower-priority labels and keeps them apart', () => {
  const near: LabelCandidate[] = [
    { id: 'big', tier: 1, priority: 9, x: 0, y: 0, radius: 5, text: 'Big hub label' },
    { id: 'small', tier: 2, priority: 1, x: 10, y: 4, radius: 3, text: 'Small one' },
    { id: 'far', tier: 2, priority: 1, x: 300, y: 300, radius: 3, text: 'Far away' },
  ]
  assert.deepEqual([...placeLabels(near, 1)].sort(), ['big', 'far'])
  // At 4x zoom the boxes shrink in graph units and no longer collide.
  assert.deepEqual([...placeLabels(near, 4)].sort(), ['big', 'far', 'small'])
  // Tier wins over priority.
  const tie: LabelCandidate[] = [
    { id: 'p', tier: 2, priority: 99, x: 0, y: 0, radius: 5, text: 'aaaaaaaa' },
    { id: 'f', tier: 0, priority: 0, x: 2, y: 2, radius: 5, text: 'bbbbbbbb' },
  ]
  assert.deepEqual([...placeLabels(tie, 1)], ['f'])
})
