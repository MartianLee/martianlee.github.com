import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildKBData,
  extractLinks,
  pickCanonical,
  clipLabel,
  deriveShortTitle,
  buildTagGraph,
} from './generate-kb-data.mjs'

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

test('clipLabel keeps short strings and cuts long ones at a word boundary', () => {
  assert.equal(clipLabel('Short title'), 'Short title')
  assert.equal(
    clipLabel('Fixing the Problem of Not Being Able to Access Specific Pages'),
    'Fixing the Problem of Not Being…'
  )
  assert.equal(
    clipLabel('abcdefghijklmnopqrstuvwxyzabcdefghij'),
    'abcdefghijklmnopqrstuvwxyzabcde…'
  )
})

test('deriveShortTitle keeps the head before a separator', () => {
  assert.equal(
    deriveShortTitle('Analyzing DeepSeek Harness: How Do You Build an Agent Harness?'),
    'Analyzing DeepSeek Harness'
  )
  assert.equal(deriveShortTitle('Is Rails Slow? I Built the Same Blog API'), 'Is Rails Slow?')
  assert.equal(
    deriveShortTitle('Beads (bd) Project Analysis Report / A Distributed Graph Issue Tracker'),
    'Beads (bd) Project Analysis…'
  )
  assert.equal(deriveShortTitle('GPT-2 (2019) Paper Notes'), 'GPT-2 (2019) Paper Notes')
})

test('deriveShortTitle uses the tail when the head is shared or too short', () => {
  const headCount = new Map([['Transformer Basics', 3]])
  assert.equal(
    deriveShortTitle('Transformer Basics: Q, K, V Intuition', headCount),
    'Q, K, V Intuition'
  )
  assert.equal(deriveShortTitle('TIL: Ruby on Rails'), 'Ruby on Rails')
})

test('buildKBData fills shortTitle from frontmatter first, either language, then derives', () => {
  const data = buildKBData([
    doc({ slug: 'a', title: 'A: long subtitle', language: 'en', shortTitle: 'Custom A' }),
    doc({ slug: 'b', title: 'B: long subtitle', language: 'en' }),
    doc({ slug: 'b', title: '비: 부제', language: 'ko', shortTitle: 'Korean-side override' }),
    doc({ slug: 'c', title: 'C Basics: One', language: 'en' }),
    doc({ slug: 'd', title: 'C Basics: Two', language: 'en' }),
  ])
  const by = Object.fromEntries(data.postIndex.map((p) => [p.slug, p.shortTitle]))
  assert.equal(by.a, 'Custom A')
  assert.equal(by.b, 'Korean-side override')
  assert.equal(by.c, 'One')
  assert.equal(by.d, 'Two')
})

test('buildTagGraph keeps tags on 3+ notes, lowercases, drops the blocklist', () => {
  const posts = [
    { slug: 'a', tags: ['React', 'post', 'llm'] },
    { slug: 'b', tags: ['react', 'post', 'llm'] },
    { slug: 'c', tags: ['react', 'develop'] },
    { slug: 'd', tags: ['llm'] },
    { slug: 'e', tags: ['rare'] },
  ]
  const { tagNodes, tagLinks } = buildTagGraph(posts)
  assert.deepEqual(tagNodes, [
    { id: 'tag:llm', label: 'llm', count: 3 },
    { id: 'tag:react', label: 'react', count: 3 },
  ])
  assert.deepEqual(
    tagLinks.filter((l) => l.source === 'a'),
    [
      { source: 'a', target: 'tag:react' },
      { source: 'a', target: 'tag:llm' },
    ]
  )
  assert.equal(
    tagLinks.some((l) => l.target === 'tag:rare'),
    false
  )
})

test('buildKBData exposes graph.tagNodes and graph.tagLinks', () => {
  const data = buildKBData([
    doc({ slug: 'a', title: 'A', language: 'en', tags: ['x'] }),
    doc({ slug: 'b', title: 'B', language: 'en', tags: ['x'] }),
    doc({ slug: 'c', title: 'C', language: 'en', tags: ['x'] }),
  ])
  assert.deepEqual(data.graph.tagNodes, [{ id: 'tag:x', label: 'x', count: 3 }])
  assert.equal(data.graph.tagLinks.length, 3)
})
