import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { decodeOutNames } from './decode-out-names.mjs'

const HANGUL = '빅카인즈'
const ENCODED = encodeURIComponent(HANGUL) // %EB%B9%85%EC%B9%B4%EC%9D%B8%EC%A6%88

/** Run `fn` on a fresh `out/` with the given files ({ 'tags/x.html': 'content' }) and clean up. */
function withOut(files, fn) {
  const root = mkdtempSync(path.join(tmpdir(), 'decode-out-'))
  try {
    for (const [rel, content] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(root, rel)), { recursive: true })
      writeFileSync(path.join(root, rel), content)
    }
    fn(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

/** Every path under `root`, relative, folders with a trailing slash. */
function listing(root, rel = '') {
  return readdirSync(path.join(root, rel), { withFileTypes: true })
    .flatMap((e) => {
      const p = path.join(rel, e.name)
      return e.isDirectory() ? [`${p}/`, ...listing(root, p)] : [p]
    })
    .sort()
}

test('renames escaped files and folders, merging into the decoded folder the RSS step wrote', () => {
  withOut(
    {
      [`tags/${ENCODED}.html`]: '<html>tag</html>',
      [`tags/${ENCODED}.txt`]: 'rsc',
      [`tags/${ENCODED}/__next._tree.txt`]: 'tree',
      [`tags/${HANGUL}/feed.xml`]: '<rss/>',
      'tags/architecture.html': 'en',
    },
    (root) => {
      const tally = decodeOutNames(root, () => {})
      assert.deepEqual(listing(root), [
        'tags/',
        'tags/architecture.html',
        `tags/${HANGUL}.html`,
        `tags/${HANGUL}.txt`,
        `tags/${HANGUL}/`,
        `tags/${HANGUL}/__next._tree.txt`,
        `tags/${HANGUL}/feed.xml`,
      ])
      assert.equal(readFileSync(path.join(root, `tags/${HANGUL}.html`), 'utf8'), '<html>tag</html>')
      assert.equal(tally.renamed, 3)
      assert.equal(tally.merged, 1)
      assert.deepEqual(tally.conflicts, [])
    }
  )
})

test('decodes names inside an escaped folder before the folder itself', () => {
  withOut({ 'a%20b/c%20d.txt': 'x' }, (root) => {
    const tally = decodeOutNames(root, () => {})
    assert.deepEqual(listing(root), ['a b/', 'a b/c d.txt'])
    assert.equal(tally.renamed, 2)
  })
})

test('keeps an existing file with different content and drops the encoded one, logging it', () => {
  const logs = []
  withOut(
    { 'x%20y.txt': 'encoded', 'x y.txt': 'existing', 'p%20q.txt': 'same', 'p q.txt': 'same' },
    (root) => {
      const tally = decodeOutNames(root, (m) => logs.push(m))
      assert.deepEqual(listing(root), ['p q.txt', 'x y.txt'])
      assert.equal(readFileSync(path.join(root, 'x y.txt'), 'utf8'), 'existing')
      assert.deepEqual(tally.conflicts, [path.join(root, 'x y.txt')])
      assert.equal(logs.length, 1)
      assert.match(logs[0], /kept it/)
    }
  )
})

test('leaves names that do not decode to a plain name, and never decodes twice', () => {
  const logs = []
  withOut({ 'a%2Fb.txt': '1', '%E0.txt': '2', '100%2541.txt': '3', '..%2F.txt': '4' }, (root) => {
    const tally = decodeOutNames(root, (m) => logs.push(m))
    assert.deepEqual(listing(root), ['%E0.txt', '..%2F.txt', '100%41.txt', 'a%2Fb.txt'].sort())
    assert.equal(tally.renamed, 1)
    assert.equal(tally.left.length, 3)
    assert.equal(logs.length, 3)
  })
})

test('does nothing when the folder is missing or has nothing escaped', () => {
  const tally = decodeOutNames(path.join(tmpdir(), 'decode-out-does-not-exist'), () => {})
  assert.deepEqual(tally, { renamed: 0, merged: 0, conflicts: [], left: [] })
  withOut({ 'a.html': '1', 'b/c.txt': '2' }, (root) => {
    assert.equal(decodeOutNames(root, () => {}).renamed, 0)
    assert.deepEqual(listing(root), ['a.html', 'b/', 'b/c.txt'])
  })
})
