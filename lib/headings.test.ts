import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hasNumberedHeadings, parseToc } from './headings.ts'

test('parseToc accepts arrays and JSON strings and rejects junk', () => {
  const toc = [{ value: 'Intro', url: '#intro', depth: 2 }]
  assert.deepEqual(parseToc(toc), toc)
  assert.deepEqual(parseToc(JSON.stringify(toc)), toc)
  assert.deepEqual(parseToc('not json'), [])
  assert.deepEqual(parseToc(undefined), [])
})

test('hasNumberedHeadings looks at depth-2 headings only', () => {
  assert.equal(hasNumberedHeadings([{ value: '1. Why', url: '#1', depth: 2 }]), true)
  assert.equal(hasNumberedHeadings([{ value: '2) 결과', url: '#2', depth: 2 }]), true)
  assert.equal(hasNumberedHeadings([{ value: 'Why 2026?', url: '#a', depth: 2 }]), false)
  assert.equal(hasNumberedHeadings([{ value: '3. Detail', url: '#b', depth: 3 }]), false)
})
