import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildKBData, extractLinks, pickCanonical } from './generate-kb-data.mjs'

function doc(over) {
  return {
    type: 'Blog',
    draft: false,
    language: 'ko',
    tags: [],
    stage: 'budding',
    summary: '',
    date: '2026-01-01T00:00:00.000Z',
    body: { raw: '' },
    ...over,
  }
}

test('pickCanonical keeps one doc per slug, preferring English', () => {
  const docs = [
    doc({ slug: 'a', title: '가', language: 'ko' }),
    doc({ slug: 'a', title: 'A', language: 'en' }),
    doc({ slug: 'b', title: '나', language: 'ko' }),
  ]
  const out = pickCanonical(docs)
  assert.deepEqual(
    out.map((d) => [d.slug, d.title]),
    [
      ['a', 'A'],
      ['b', '나'],
    ]
  )
})

test('extractLinks finds wiki links, /posts/ hrefs and /kb/ markdown links', () => {
  const body = 'see [[x]] and [[y|Y]] and <a href="/posts/z">z</a> and [w](/kb/w)'
  assert.deepEqual(extractLinks(body), ['x', 'y', 'z', 'w'])
})

test('buildKBData dedupes ko/en pairs and counts each note once', () => {
  const data = buildKBData([
    doc({ slug: 'a', title: '가', language: 'ko', tags: ['react'] }),
    doc({ slug: 'a', title: 'A', language: 'en', tags: ['react'] }),
    doc({ slug: 'b', title: '나', language: 'ko', tags: ['react'] }),
  ])
  assert.equal(data.postIndex.length, 2)
  assert.equal(data.postIndex.find((p) => p.slug === 'a').title, 'A')
  assert.equal(data.postIndex.find((p) => p.slug === 'b').title, '나')
  const total = data.topics.reduce((n, t) => n + t.count, 0)
  assert.equal(total, 2)
  for (const t of data.topics) assert.equal(new Set(t.slugs).size, t.slugs.length)
})

test('links found in either language body count once, backlinks use the canonical title', () => {
  const data = buildKBData([
    doc({ slug: 'a', title: '가', language: 'ko', body: { raw: '[[b]]' } }),
    doc({ slug: 'a', title: 'A', language: 'en', body: { raw: '[to b](/kb/b) and [[b]]' } }),
    doc({ slug: 'b', title: 'B', language: 'en' }),
  ])
  assert.deepEqual(data.forwardLinks.a, ['b'])
  assert.deepEqual(data.forwardLinks.b, [])
  assert.deepEqual(data.backlinks.b, [{ slug: 'a', title: 'A' }])
})

test('ignores self links, unknown targets and drafts', () => {
  const data = buildKBData([
    doc({ slug: 'a', title: 'A', language: 'en', body: { raw: '[[a]] [[zzz]] [[c]]' } }),
    doc({ slug: 'c', title: 'C', language: 'en', draft: true }),
  ])
  assert.equal(data.postIndex.length, 1)
  assert.deepEqual(data.forwardLinks.a, [])
  assert.equal(data.backlinks.c, undefined)
})

test('topic labels cover every rule topic', () => {
  const data = buildKBData([
    doc({ slug: 'a', title: 'A', language: 'en', topic: 'backend-architecture' }),
    doc({ slug: 'b', title: 'B', language: 'en', topic: 'software-engineering' }),
  ])
  assert.deepEqual(data.topics.map((t) => t.label).sort(), [
    'Backend Architecture',
    'Software Engineering',
  ])
})
