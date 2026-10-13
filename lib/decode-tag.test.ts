import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decodeTag } from './decode-tag.ts'

const HANGUL = '빅카인즈'

test('a raw tag stays as it is', () => {
  assert.equal(decodeTag('architecture'), 'architecture')
  assert.equal(decodeTag('game-modding'), 'game-modding')
  assert.equal(decodeTag(HANGUL), HANGUL)
})

test('a once-encoded tag is decoded (what generateStaticParams hands out)', () => {
  assert.equal(decodeTag(encodeURI(HANGUL)), HANGUL)
  assert.equal(decodeTag(encodeURIComponent(HANGUL)), HANGUL)
})

test('a twice-encoded tag is decoded (what the page itself receives in Next 16.2)', () => {
  assert.equal(decodeTag(encodeURIComponent(encodeURIComponent(HANGUL))), HANGUL)
  assert.equal(decodeTag('%25EB%25B9%2585%25EC%25B9%25B4%25EC%259D%25B8%25EC%25A6%2588'), HANGUL)
})

test('decoding stops after three rounds and at a malformed escape', () => {
  const four = encodeURIComponent(encodeURIComponent(encodeURIComponent(encodeURIComponent('é'))))
  assert.equal(decodeTag(four), encodeURIComponent('é'))
  assert.equal(decodeTag('%E0'), '%E0')
  assert.equal(decodeTag('abc%E0'), 'abc%E0')
})
