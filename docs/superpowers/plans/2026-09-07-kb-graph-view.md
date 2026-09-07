# KB Graph View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Obsidian-style graph page at `/kb/graph` that shows every KB note, its explicit links and shared-tag neighbourhoods, surfaces orphans and hubs, and helps the author decide which links to add.

**Architecture:** The build-time generator (`scripts/generate-kb-data.mjs`) becomes a pure `buildKBData` function that dedupes ko/en pairs, derives `shortTitle`, and emits a `graph` section (tag nodes + tag links) into `app/kb-data.json`. A pure TypeScript model (`components/kb/graph/graphModel.ts`) turns that JSON into nodes/links, degrees, orphans, hubs, related-but-unlinked notes, and label placement. React components under `components/kb/graph/` render it with d3-force (static layout) into an SVG inside the existing `KBShell`.

**Tech Stack:** Next.js App Router (static export), React, Contentlayer2, Tailwind v4 + plain CSS tokens, d3-force 3, Node 24 built-in test runner (`node --test`, native TypeScript type stripping).

Spec: `docs/superpowers/specs/2026-09-06-kb-graph-view-design.md`. Mockup: https://claude.ai/code/artifact/82306cba-64d9-4752-8c4f-b2457f8e042f

## Global Constraints

- Work in this worktree only: `/Users/dede/workspace/martianlee.github.com/.claude/worktrees/kb-graph-view` (branch `worktree-kb-graph-view`). Never `cd` to the original repo root.
- Package manager is **yarn 3.6.1 (berry)**. Never run `npm install`. Node 24 (`.nvmrc`).
- **Port 3456 belongs to the user's own dev server in the main checkout.** When you need a dev server here, run `yarn next dev --turbopack -p 3466` and use `http://localhost:3466`.
- Regenerate `app/kb-data.json` with: `DISABLE_REHYPE_MERMAID=true yarn contentlayer2 build` (mermaid rendering is slow and irrelevant to KB data). This also rewrites `app/tag-data.json` and `public/search.json`; only `git add` the files your task names.
- Every commit passes husky: lint-staged runs `eslint --fix` and `prettier --write` on staged files. Before committing run `yarn prettier --write <files>` and `yarn eslint <files>` yourself so the hook has nothing to fix.
- `yarn lint` (`eslint .`) uses typed linting (`parserOptions.project`) and `jsx-a11y/recommended`. Every clickable SVG `<g>` needs `role="button"`, `tabIndex={0}` and an `onKeyDown` handler; the `<svg>` that receives pointer events uses `role="application"` with an `aria-label`.
- Files that `node --test` executes (`graphModel.ts`, `layout.ts`, their tests) must: use **relative imports only** (no `@/` aliases), import types with a separate `import type { … }` statement (Node strips those; a value import of a type-only module fails at runtime), avoid `enum`/`namespace`/parameter properties, and import sibling `.ts` files **with the `.ts` extension**.
- Canonical document rule everywhere: **English version if it exists, else Korean** (matches `createTagCount`/`createSearchIndex` in `contentlayer.config.ts`).
- Constants from the spec: `TAG_NODE_MIN_NOTES = 3`, `TAG_BLOCKLIST = ['post', 'develop']`, `SHORT_TITLE_MAX = 32`, hubs = top 8 by backlink count, related-unlinked = ≥ 2 shared tags, top 5.
- UI copy is English, monospace, using the existing `--kb-*` CSS tokens. No new fonts, no Tailwind config changes.
- Commit message trailer (every commit):
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ
  ```

---

## File map

| Path | Responsibility |
|---|---|
| `scripts/generate-kb-data.mjs` | Build-time data: canonical dedupe, links, topics, shortTitle, graph section. Exports pure `buildKBData` plus helpers. |
| `scripts/generate-kb-data.test.mjs` | `node --test` coverage for the generator. |
| `components/kb/types.ts` | Shared TS types for `kb-data.json`. |
| `components/kb/graph/graphModel.ts` | Pure model: nodes/links, degrees, orphans, hubs, relatedUnlinked, search, label tiers/placement. |
| `components/kb/graph/graphModel.test.ts` | Tests for the model. |
| `components/kb/graph/layout.ts` | d3-force static layout (`computeLayout`), topic anchors, seeded PRNG. |
| `components/kb/graph/layout.test.ts` | Determinism / coverage test. |
| `components/kb/graph/topicColors.ts` | Topic → palette slot / label / sort order. |
| `components/kb/graph/KBGraphContext.tsx` | React context type + hook shared by the graph page components. |
| `components/kb/graph/KBGraphView.tsx` | Owns state, composes `KBShell`. |
| `components/kb/graph/KBGraphControls.tsx` | Search, topic chips, stage filter, Tags switch, legend. |
| `components/kb/graph/KBGraphSvg.tsx` | SVG rendering, pan/zoom, hover/select, labels, tooltip. |
| `components/kb/graph/KBGraphPanel.tsx` | Context panel: Overview / Note / Tag modes. |
| `components/kb/KBShell.tsx` | + "Graph" toolbar link. |
| `components/kb/KBSidebar.tsx` | + optional `onSelect` prop. |
| `components/kb/KBContextPanel.tsx` | + "Related, not linked" section on note pages. |
| `app/kb/graph/page.tsx` | Route. |
| `css/tailwind.css` | `--kb-topic-*`, `--kb-graph-edge` tokens and `.kb-graph-*` rules. |
| `contentlayer.config.ts` | + `shortTitle` frontmatter field. |
| `CLAUDE.md` | Document `shortTitle`. |
| `package.json` / `tsconfig.json` | `d3-force` dependency, `test` script, `allowImportingTsExtensions`. |

---

### Task 1: Generator refactor — pure `buildKBData`, ko/en dedupe, test harness

**Files:**
- Modify: `scripts/generate-kb-data.mjs`
- Create: `scripts/generate-kb-data.test.mjs`
- Modify: `package.json` (add `test` script)
- Regenerate: `app/kb-data.json`

**Interfaces:**
- Produces: `buildKBData(allDocuments: ContentlayerDoc[], now?: Date): KBData` (pure), `generateKBData(allDocuments)` (writes `./app/kb-data.json`, unchanged call site in `contentlayer.config.ts`), `pickCanonical(docs)`, `extractLinks(bodyRaw): string[]`.
- Canonical doc shape used by tests: `{ type: 'Blog', draft?, slug, language: 'ko'|'en', title, tags, topic?, stage?, summary?, date, body: { raw } }`.

- [ ] **Step 1: Add the test script to `package.json`**

In the `"scripts"` block add:

```json
"test": "node --test \"scripts/**/*.test.mjs\""
```

- [ ] **Step 2: Write the failing tests**

Create `scripts/generate-kb-data.test.mjs`:

```js
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
  assert.deepEqual(
    data.topics.map((t) => t.label).sort(),
    ['Backend Architecture', 'Software Engineering']
  )
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `yarn test`
Expected: FAIL — `SyntaxError: The requested module './generate-kb-data.mjs' does not provide an export named 'buildKBData'`

- [ ] **Step 4: Rewrite the generator**

Replace the whole of `scripts/generate-kb-data.mjs` with the code below. `TOPIC_RULES` is unchanged from the current file except that it is now a `const` you keep verbatim — copy it from the existing file into the marked spot.

```js
import { writeFileSync } from 'fs'

export const TAG_NODE_MIN_NOTES = 3
export const TAG_BLOCKLIST = ['post', 'develop']
export const SHORT_TITLE_MAX = 32

// --- topic inference (unchanged rules) -------------------------------------
const TOPIC_RULES = [
  // ⬇ paste the existing TOPIC_RULES array items here, verbatim
]

const TOPIC_LABELS = {
  'llm-research': 'LLM Research',
  'ai-infrastructure': 'AI Infrastructure',
  'web-frontend': 'Web Frontend',
  backend: 'Backend',
  'backend-architecture': 'Backend Architecture',
  'devops-cloud': 'DevOps & Cloud',
  'dev-life': 'Dev Life',
  algorithms: 'Algorithms',
  'software-engineering': 'Software Engineering',
  uncategorized: 'Uncategorized',
}

function inferTopic(post) {
  if (post.topic) return post.topic
  for (const rule of TOPIC_RULES) {
    if (rule.match(post)) return rule.topic
  }
  return 'uncategorized'
}

// --- canonical documents ----------------------------------------------------

/**
 * One document per slug: the English version when it exists, otherwise Korean.
 * Same rule as createTagCount / createSearchIndex in contentlayer.config.ts.
 */
export function pickCanonical(docs) {
  const bySlug = new Map()
  for (const d of docs) {
    const existing = bySlug.get(d.slug)
    if (!existing || (d.language === 'en' && existing.language !== 'en')) bySlug.set(d.slug, d)
  }
  return [...bySlug.values()]
}

// --- links ------------------------------------------------------------------

const LINK_PATTERNS = [
  /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, // [[slug]] or [[slug|display]]
  /href=["']\/posts\/([^"']+)["']/g, // href="/posts/slug"
  /\]\(\/kb\/([^)]+)\)/g, // [text](/kb/slug)
]

/** Every link target mentioned in a body, in document order, not deduplicated. */
export function extractLinks(bodyRaw) {
  const out = []
  for (const re of LINK_PATTERNS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(bodyRaw)) !== null) out.push(m[1].trim())
  }
  return out
}

// --- build ------------------------------------------------------------------

export function buildKBData(allDocuments, now = new Date()) {
  const blogs = allDocuments.filter((p) => p.type === 'Blog' && !p.draft)
  const canonical = pickCanonical(blogs)
  const slugSet = new Set(canonical.map((p) => p.slug))

  const posts = canonical.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    tags: p.tags || [],
    topic: inferTopic(p),
    stage: p.stage || 'budding',
    summary: p.summary || '',
  }))
  const titleOf = new Map(posts.map((p) => [p.slug, p.title]))

  // Forward links: union over every language version of a slug, deduplicated, no self links.
  const forwardLinks = {}
  for (const slug of slugSet) forwardLinks[slug] = []
  for (const docItem of blogs) {
    const list = forwardLinks[docItem.slug]
    if (!list) continue
    for (const target of extractLinks(docItem.body?.raw || '')) {
      if (!slugSet.has(target) || target === docItem.slug || list.includes(target)) continue
      list.push(target)
    }
  }

  const backlinks = {}
  for (const [source, targets] of Object.entries(forwardLinks)) {
    for (const target of targets) {
      if (!backlinks[target]) backlinks[target] = []
      backlinks[target].push({ slug: source, title: titleOf.get(source) })
    }
  }

  const topicMap = {}
  for (const post of posts) {
    if (!topicMap[post.topic]) topicMap[post.topic] = []
    topicMap[post.topic].push(post.slug)
  }
  const topics = Object.entries(topicMap)
    .map(([id, slugs]) => ({ id, label: TOPIC_LABELS[id] || id, count: slugs.length, slugs }))
    .sort((a, b) => b.count - a.count)

  return {
    topics,
    backlinks,
    forwardLinks,
    postIndex: posts,
    generatedAt: now.toISOString(),
  }
}

export function generateKBData(allDocuments) {
  const kbData = buildKBData(allDocuments)
  writeFileSync('./app/kb-data.json', JSON.stringify(kbData, null, 2))
  console.log(
    `KB data generated: ${kbData.postIndex.length} notes, ${kbData.topics.length} topics, ${Object.keys(kbData.backlinks).length} notes with backlinks`
  )
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test`
Expected: `# pass 6`, `# fail 0`

- [ ] **Step 6: Regenerate `app/kb-data.json` and check the counts**

Run: `DISABLE_REHYPE_MERMAID=true yarn contentlayer2 build 2>&1 | grep "KB data generated"`
Expected: `KB data generated: 100 notes, 9 topics, 46 notes with backlinks` (the note count must be 100, not 200).

Then: `node -e "const d=require('./app/kb-data.json'); console.log(d.postIndex.length, new Set(d.postIndex.map(p=>p.slug)).size, d.topics.map(t=>t.id+':'+t.count).join(' '))"`
Expected: `100 100 ai-infrastructure:33 llm-research:19 dev-life:15 web-frontend:14 backend:7 algorithms:4 backend-architecture:4 devops-cloud:3 software-engineering:1`

- [ ] **Step 7: Lint, format, commit**

```bash
yarn prettier --write scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs package.json
yarn eslint scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs
git add scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs package.json app/kb-data.json
git commit -m "fix(kb): ko/en 중복 제거·buildKBData 분리·node --test 도입

KB 노트가 200개로 잡히고 토픽 카운트가 두 배였던 문제를 정본(영어 우선) 기준으로 고칩니다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 2: `shortTitle` — derivation rule, frontmatter override, docs

**Files:**
- Modify: `scripts/generate-kb-data.mjs`
- Modify: `scripts/generate-kb-data.test.mjs`
- Modify: `contentlayer.config.ts` (Blog `fields`, around line 104-117)
- Modify: `components/kb/types.ts`
- Modify: `CLAUDE.md` (optional fields line)
- Regenerate: `app/kb-data.json`

**Interfaces:**
- Consumes: `buildKBData`, `pickCanonical` from Task 1.
- Produces: `clipLabel(s, max = SHORT_TITLE_MAX)`, `splitTitle(title): string[]`, `deriveShortTitle(title, headCount = new Map())`, and `postIndex[].shortTitle: string`.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/generate-kb-data.test.mjs` (add `clipLabel`, `deriveShortTitle` to the import line):

```js
test('clipLabel keeps short strings and cuts long ones at a word boundary', () => {
  assert.equal(clipLabel('Short title'), 'Short title')
  assert.equal(
    clipLabel('Fixing the Problem of Not Being Able to Access Specific Pages'),
    'Fixing the Problem of Not Being…'
  )
  assert.equal(clipLabel('abcdefghijklmnopqrstuvwxyzabcdefghij'), 'abcdefghijklmnopqrstuvwxyzabcde…')
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test`
Expected: FAIL — missing export `clipLabel`.

- [ ] **Step 3: Implement**

In `scripts/generate-kb-data.mjs`, add below the `TAG_*` constants:

```js
// --- short titles -----------------------------------------------------------

/** Split points: ": ", "： ", " — ", " – ", " - ", " / ", and the space after a "?". */
export const SHORT_TITLE_SEPARATOR = /\s*[:：—–]\s+|\s+[-/]\s+|(?<=\?)\s+/

export function splitTitle(title) {
  return String(title)
    .split(SHORT_TITLE_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Clip to `max` characters including the ellipsis, preferring a word boundary. */
export function clipLabel(s, max = SHORT_TITLE_MAX) {
  const text = String(s).trim()
  if (text.length <= max) return text
  const head = text.slice(0, max - 1)
  const boundary = text[max - 1] === ' ' ? head.length : head.lastIndexOf(' ')
  const cut = boundary > (max - 1) * 0.6 ? head.slice(0, boundary) : head
  return cut.trimEnd() + '…'
}

/**
 * Head of the title unless that head is shared by other notes (headCount > 1)
 * or is shorter than 6 characters; then the tail. Always clipped.
 */
export function deriveShortTitle(title, headCount = new Map()) {
  const parts = splitTitle(title)
  let label = String(title)
  if (parts.length > 1) {
    const head = parts[0]
    const ambiguous = (headCount.get(head) || 0) > 1 || head.length < 6
    label = ambiguous ? parts.slice(1).join(' ') : head
  }
  return clipLabel(label)
}
```

In `buildKBData`, replace the `posts` construction with:

```js
  const headCount = new Map()
  for (const p of canonical) {
    const parts = splitTitle(p.title)
    if (parts.length > 1) headCount.set(parts[0], (headCount.get(parts[0]) || 0) + 1)
  }
  const overrideFor = (slug) =>
    blogs.find((d) => d.slug === slug && d.language === 'en' && d.shortTitle)?.shortTitle ||
    blogs.find((d) => d.slug === slug && d.shortTitle)?.shortTitle

  const posts = canonical.map((p) => {
    const override = overrideFor(p.slug)
    return {
      slug: p.slug,
      title: p.title,
      shortTitle: override ? clipLabel(override) : deriveShortTitle(p.title, headCount),
      date: p.date,
      tags: p.tags || [],
      topic: inferTopic(p),
      stage: p.stage || 'budding',
      summary: p.summary || '',
    }
  })
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 5: Register the frontmatter field and document it**

`contentlayer.config.ts`, in `Blog.fields` after `canonicalUrl`:

```ts
    shortTitle: { type: 'string' },
```

`components/kb/types.ts`, in `KBPostEntry` after `title: string`:

```ts
  shortTitle: string
```

`CLAUDE.md`, replace the "Optional fields" line with:

```markdown
- Optional fields: `draft: true` (unpublished), `lastmod`, `stage` (seedling | budding | evergreen — digital-garden maturity, default budding), `topic`, `canonicalUrl`, `bibliography`, `shortTitle` (≤ 32 chars, label shown on the /kb/graph node; write it in the English file — the KB derives one from the title when absent).
```

- [ ] **Step 6: Regenerate and spot-check**

Run: `DISABLE_REHYPE_MERMAID=true yarn contentlayer2 build 2>&1 | grep "KB data generated"`
Then: `node -e "const d=require('./app/kb-data.json'); for (const s of ['2026-09-05-deepseek-harness-architecture','2026-04-17-transformer-basics-qkv-intuition','2026-09-01-framework-magic-tax']) console.log(d.postIndex.find(p=>p.slug===s).shortTitle)"`
Expected: first line `Analyzing DeepSeek Harness`; second line is the part of that title after "Transformer Basics:" (it must NOT start with `Transformer Basics`, because three notes share that head); third line `Is Rails Slow?`.

- [ ] **Step 7: Lint, format, commit**

```bash
yarn prettier --write scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs contentlayer.config.ts components/kb/types.ts CLAUDE.md
yarn eslint scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs contentlayer.config.ts components/kb/types.ts
git add scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs contentlayer.config.ts components/kb/types.ts CLAUDE.md app/kb-data.json
git commit -m "feat(kb): shortTitle 파생 규칙과 frontmatter 오버라이드

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 3: `graph` section — tag nodes and tag links

**Files:**
- Modify: `scripts/generate-kb-data.mjs`
- Modify: `scripts/generate-kb-data.test.mjs`
- Modify: `components/kb/types.ts`
- Regenerate: `app/kb-data.json`

**Interfaces:**
- Produces: `buildTagGraph(posts: { slug, tags }[]): { tagNodes: { id, label, count }[], tagLinks: { source, target }[] }` and `KBData.graph`.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/generate-kb-data.test.mjs` (add `buildTagGraph` to the import):

```js
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
  assert.equal(tagLinks.some((l) => l.target === 'tag:rare'), false)
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test`
Expected: FAIL — missing export `buildTagGraph`.

- [ ] **Step 3: Implement**

Add to `scripts/generate-kb-data.mjs` (before `buildKBData`):

```js
// --- tag graph --------------------------------------------------------------

/** Tag nodes for tags attached to at least TAG_NODE_MIN_NOTES canonical notes. */
export function buildTagGraph(posts) {
  const count = new Map()
  const membership = new Map()
  for (const p of posts) {
    const tags = new Set(
      (p.tags || []).map((t) => String(t).toLowerCase().trim()).filter((t) => t.length > 0)
    )
    membership.set(p.slug, tags)
    for (const t of tags) count.set(t, (count.get(t) || 0) + 1)
  }
  const tagNodes = [...count.entries()]
    .filter(([tag, c]) => c >= TAG_NODE_MIN_NOTES && !TAG_BLOCKLIST.includes(tag))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, c]) => ({ id: `tag:${label}`, label, count: c }))
  const ids = new Set(tagNodes.map((n) => n.id))
  const tagLinks = []
  for (const p of posts) {
    for (const t of membership.get(p.slug)) {
      if (ids.has(`tag:${t}`)) tagLinks.push({ source: p.slug, target: `tag:${t}` })
    }
  }
  return { tagNodes, tagLinks }
}
```

In `buildKBData`'s return object add `graph: buildTagGraph(posts),` before `generatedAt`.

`components/kb/types.ts` — add and wire the types:

```ts
export interface KBTagNode {
  id: string
  label: string
  count: number
}

export interface KBTagLink {
  source: string
  target: string
}

export interface KBGraphData {
  tagNodes: KBTagNode[]
  tagLinks: KBTagLink[]
}
```

and in `KBData` add `graph: KBGraphData` after `postIndex`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test`
Expected: `# pass 12`, `# fail 0`

- [ ] **Step 5: Regenerate and check**

Run: `DISABLE_REHYPE_MERMAID=true yarn contentlayer2 build 2>&1 | grep "KB data generated"`
Then: `node -e "const d=require('./app/kb-data.json'); console.log(d.graph.tagNodes.length, d.graph.tagLinks.length, d.graph.tagNodes.slice(0,3))"`
Expected: `31 230` followed by architecture / llm / ai-agent nodes with counts 32, 25, 22.

- [ ] **Step 6: Lint, format, commit**

```bash
yarn prettier --write scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs components/kb/types.ts
yarn eslint scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs components/kb/types.ts
git add scripts/generate-kb-data.mjs scripts/generate-kb-data.test.mjs components/kb/types.ts app/kb-data.json
git commit -m "feat(kb): graph 섹션(tagNodes·tagLinks) 생성

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 4: Graph model core — nodes, links, degrees, orphans, hubs, related

**Files:**
- Create: `components/kb/graph/graphModel.ts`
- Create: `components/kb/graph/graphModel.test.ts`
- Modify: `tsconfig.json` (`allowImportingTsExtensions`)
- Modify: `package.json` (`test` script glob)

**Interfaces:**
- Consumes: `KBData`, `KBPostEntry` from `components/kb/types.ts` (Task 3 shape).
- Produces (all exported from `graphModel.ts`):
  - `interface GraphNode { id; kind: 'note'|'tag'; label; title; topic?; stage?; date?; tags: string[]; inDegree; outDegree; degree; radius }`
  - `interface GraphLink { source; target; kind: 'link'|'tag' }`
  - `interface GraphFilters { topics: Set<string>; stage: string; tags: boolean }`, `DEFAULT_FILTERS`
  - `nodeRadius`, `degreesOf(data)`, `explicitLinks(data)`, `noteMatchesFilters(p, f)`, `buildGraph(data, filters)`, `neighbourIds(links, id)`, `orphanIds(data)`, `isolatedIds(data)`, `hubIds(data, n = 8)`, `relatedUnlinked(data, slug, { minShared = 2, limit = 5 })`

- [ ] **Step 1: Allow `.ts` import specifiers and widen the test glob**

`tsconfig.json` → inside `compilerOptions` add:

```json
"allowImportingTsExtensions": true,
```

`package.json` → replace the `test` script with:

```json
"test": "node --test \"scripts/**/*.test.mjs\" \"components/**/*.test.ts\""
```

- [ ] **Step 2: Write the failing tests**

Create `components/kb/graph/graphModel.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { KBData, KBPostEntry } from '../types'
import {
  buildGraph,
  DEFAULT_FILTERS,
  degreesOf,
  hubIds,
  isolatedIds,
  neighbourIds,
  nodeRadius,
  orphanIds,
  relatedUnlinked,
} from './graphModel.ts'

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
    post({ slug: 'hub', topic: 'ai-infrastructure', tags: ['llm', 'agent', 'rust'], date: '2026-03-01T00:00:00.000Z' }),
    post({ slug: 'a', topic: 'ai-infrastructure', tags: ['llm', 'agent'], date: '2026-02-01T00:00:00.000Z' }),
    post({ slug: 'b', topic: 'ai-infrastructure', tags: ['llm', 'agent', 'rust'], stage: 'seedling', date: '2026-04-01T00:00:00.000Z' }),
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
  assert.deepEqual(
    nodes.map((n) => n.id).sort(),
    ['a', 'b', 'hub', 'orphan-alone', 'orphan-tagged', 'tag:agent', 'tag:llm']
  )
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
  data.postIndex.push(post({ slug: 'd', tags: ['llm', 'rust', 'agent'], date: '2026-01-15T00:00:00.000Z' }))
  data.forwardLinks.c = []
  data.forwardLinks.d = []
  assert.deepEqual(relatedUnlinked(data, 'hub'), [
    { slug: 'd', title: 'D', sharedTags: ['llm', 'rust', 'agent'] },
    { slug: 'c', title: 'C', sharedTags: ['llm', 'rust'] },
  ])
  assert.deepEqual(relatedUnlinked(data, 'hub', { limit: 1 }).map((r) => r.slug), ['d'])
  assert.deepEqual(relatedUnlinked(data, 'missing'), [])
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `yarn test`
Expected: FAIL — `Cannot find module '.../components/kb/graph/graphModel.ts'`

- [ ] **Step 4: Implement `graphModel.ts`**

```ts
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
  return (f.topics.size === 0 || f.topics.has(p.topic)) && (f.stage === 'all' || p.stage === f.stage)
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test`
Expected: `# pass 20`, `# fail 0`

- [ ] **Step 6: Lint, format, commit**

```bash
yarn prettier --write components/kb/graph/graphModel.ts components/kb/graph/graphModel.test.ts tsconfig.json package.json
yarn eslint components/kb/graph/graphModel.ts components/kb/graph/graphModel.test.ts
git add components/kb/graph/graphModel.ts components/kb/graph/graphModel.test.ts tsconfig.json package.json
git commit -m "feat(kb-graph): 순수 그래프 모델(degree·orphan·hub·relatedUnlinked)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 5: Graph model — search, label tiers and collision-aware placement

**Files:**
- Modify: `components/kb/graph/graphModel.ts`
- Modify: `components/kb/graph/graphModel.test.ts`

**Interfaces:**
- Consumes: `GraphNode` from Task 4.
- Produces: `searchIds(nodes, query): Set<string> | null`, `labelTier(node, k, forced, hubs): 0|1|2|3|null`, `interface LabelCandidate { id; tier; priority; x; y; radius; text }`, `placeLabels(candidates, k): Set<string>`, constants `LABEL_FONT_PX = 10`, `LABEL_CHAR_W = 6.3`, `LABEL_LINE_H = 13`, `LABEL_GAP = 3`.

- [ ] **Step 1: Write the failing tests**

Append to `components/kb/graph/graphModel.test.ts`. Extend the value import with `labelTier`, `placeLabels`, `searchIds`, and add a separate line `import type { GraphNode } from './graphModel.ts'` (Node only strips standalone `import type` statements):

```ts
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
    node({ id: '2026-01-01-webmcp', title: 'WebMCP Explained', label: 'WebMCP', tags: ['browser-automation'] }),
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
  const near = [
    { id: 'big', tier: 1, priority: 9, x: 0, y: 0, radius: 5, text: 'Big hub label' },
    { id: 'small', tier: 2, priority: 1, x: 10, y: 4, radius: 3, text: 'Small one' },
    { id: 'far', tier: 2, priority: 1, x: 300, y: 300, radius: 3, text: 'Far away' },
  ]
  assert.deepEqual([...placeLabels(near, 1)].sort(), ['big', 'far'])
  // At 4x zoom the boxes shrink in graph units and no longer collide.
  assert.deepEqual([...placeLabels(near, 4)].sort(), ['big', 'far', 'small'])
  // Tier wins over priority.
  const tie = [
    { id: 'p', tier: 2, priority: 99, x: 0, y: 0, radius: 5, text: 'aaaaaaaa' },
    { id: 'f', tier: 0, priority: 0, x: 2, y: 2, radius: 5, text: 'bbbbbbbb' },
  ]
  assert.deepEqual([...placeLabels(tie, 1)], ['f'])
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test`
Expected: FAIL — `searchIds` is not exported.

- [ ] **Step 3: Implement**

Append to `components/kb/graph/graphModel.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test`
Expected: `# pass 23`, `# fail 0`

- [ ] **Step 5: Lint, format, commit**

```bash
yarn prettier --write components/kb/graph/graphModel.ts components/kb/graph/graphModel.test.ts
yarn eslint components/kb/graph/graphModel.ts components/kb/graph/graphModel.test.ts
git add components/kb/graph/graphModel.ts components/kb/graph/graphModel.test.ts
git commit -m "feat(kb-graph): 검색·라벨 티어·충돌 회피 배치

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 6: Static layout with d3-force

**Files:**
- Modify: `package.json` (add dependency)
- Create: `components/kb/graph/topicColors.ts`
- Create: `components/kb/graph/layout.ts`
- Create: `components/kb/graph/layout.test.ts`

**Interfaces:**
- Consumes: `GraphNode`, `GraphLink` from Task 4.
- Produces:
  - `topicColors.ts`: `TOPIC_SLOT: Record<string, number>`, `TOPIC_LABEL: Record<string, string>`, `TOPIC_PRIORITY`, `topicSlot(topic?)`, `topicColor(topic?)` → `var(--kb-topic-N)`, `topicLabel(topic?)`, `sortTopics<T extends { id: string; label: string }>(topics: T[]): T[]`.
  - `layout.ts`: `interface Point { x; y }`, `ANCHOR_ORDER`, `topicAnchor(topic?)`, `mulberry32(seed)`, `computeLayout(nodes, links, previous?): Map<string, Point>`, `LAYOUT_SEED = 1337`, `LAYOUT_TICKS = 300`.

- [ ] **Step 1: Add the dependency**

Run: `yarn add d3-force@^3.0.0 && yarn add -D @types/d3-force@^3.0.10`
Expected: `package.json` gains both entries (d3-force is already present transitively; this makes it explicit) and `yarn.lock` updates.

- [ ] **Step 2: Write the failing test**

Create `components/kb/graph/layout.test.ts`:

```ts
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
  const dist = (p: string, q: string) => Math.hypot(first.get(p)!.x - first.get(q)!.x, first.get(p)!.y - first.get(q)!.y)
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `yarn test`
Expected: FAIL — cannot find module `./layout.ts`.

- [ ] **Step 4: Create `topicColors.ts`**

```ts
/** Palette slot per topic. Slots map to --kb-topic-N CSS tokens; 0 is the neutral "other". */
export const TOPIC_SLOT: Record<string, number> = {
  'ai-infrastructure': 1,
  'llm-research': 2,
  'dev-life': 3,
  'web-frontend': 4,
  backend: 5,
  algorithms: 6,
  'backend-architecture': 7,
  'devops-cloud': 8,
}

export const TOPIC_LABEL: Record<string, string> = {
  'llm-research': 'LLM Research',
  'ai-infrastructure': 'AI Infrastructure',
  'web-frontend': 'Web Frontend',
  backend: 'Backend',
  'backend-architecture': 'Backend Architecture',
  'devops-cloud': 'DevOps & Cloud',
  'dev-life': 'Dev Life',
  algorithms: 'Algorithms',
  'software-engineering': 'Software Engineering',
  uncategorized: 'Uncategorized',
}

/** Same ordering the KB sidebar uses: research first, then AI, then alphabetical. */
export const TOPIC_PRIORITY: Record<string, number> = {
  'llm-research': 0,
  'ai-infrastructure': 1,
}

/** Digital-garden stage icons, shared by every graph component. */
export const STAGE_ICON: Record<string, string> = {
  seedling: '\u{1F331}',
  budding: '\u{1F33F}',
  evergreen: '\u{1F333}',
}

export function topicSlot(topic?: string): number {
  return (topic && TOPIC_SLOT[topic]) || 0
}

export function topicColor(topic?: string): string {
  return `var(--kb-topic-${topicSlot(topic)})`
}

export function topicLabel(topic?: string): string {
  return (topic && TOPIC_LABEL[topic]) || topic || 'Uncategorized'
}

export function sortTopics<T extends { id: string; label: string }>(topics: T[]): T[] {
  return [...topics].sort((a, b) => {
    const pa = TOPIC_PRIORITY[a.id] ?? 99
    const pb = TOPIC_PRIORITY[b.id] ?? 99
    if (pa !== pb) return pa - pb
    return a.label.localeCompare(b.label)
  })
}
```

- [ ] **Step 5: Create `layout.ts`**

```ts
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
    .force('collide', forceCollide<SimNode>((d) => d.radius + 4))
    .force(
      'x',
      forceX<SimNode>((d) => (d.kind === 'note' ? topicAnchor(d.topic).x : 0)).strength(anchorStrength)
    )
    .force(
      'y',
      forceY<SimNode>((d) => (d.kind === 'note' ? topicAnchor(d.topic).y : 0)).strength(anchorStrength)
    )
    .stop()
  // No forceCenter: it ignores alpha and would drag a lone node to the origin; the anchors and
  // the view's fit() already keep the picture centred.
  sim.tick(LAYOUT_TICKS)

  const out = new Map<string, Point>()
  for (const s of simNodes) out.set(s.id, { x: s.x ?? 0, y: s.y ?? 0 })
  return out
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `yarn test`
Expected: `# pass 27`, `# fail 0`. If the "pulls linked nodes together" assertion fails, raise the link strength to `0.08` for `'link'` and re-run; do not change the test.

- [ ] **Step 7: Lint, format, commit**

```bash
yarn prettier --write components/kb/graph/topicColors.ts components/kb/graph/layout.ts components/kb/graph/layout.test.ts package.json
yarn eslint components/kb/graph/topicColors.ts components/kb/graph/layout.ts components/kb/graph/layout.test.ts
git add components/kb/graph/topicColors.ts components/kb/graph/layout.ts components/kb/graph/layout.test.ts package.json yarn.lock
git commit -m "feat(kb-graph): d3-force 정적 배치와 토픽 팔레트 매핑

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 7: Route scaffold — context, view shell, toolbar link, CSS tokens

**Files:**
- Create: `components/kb/graph/KBGraphContext.tsx`
- Create: `components/kb/graph/KBGraphView.tsx`
- Create: `app/kb/graph/page.tsx`
- Modify: `components/kb/KBShell.tsx` (toolbar, lines 55-73)
- Modify: `css/tailwind.css` (after the `:where(.light, .light *) .kb-theme` block, ~line 426)

**Interfaces:**
- Consumes: `buildGraph`, `DEFAULT_FILTERS`, `hubIds`, `orphanIds`, `isolatedIds`, `GraphFilters`, `GraphNode`, `GraphLink` (Tasks 4-5).
- Produces: `KBGraphContext`, `useKBGraph(): KBGraphState` with
  ```ts
  interface KBGraphState {
    data: KBData
    nodes: GraphNode[]; links: GraphLink[]
    filters: GraphFilters; setFilters(f: GraphFilters): void
    query: string; setQuery(q: string): void
    hoverId: string | null; setHoverId(id: string | null): void
    selectedId: string | null; select(id: string | null, opts?: { focus?: boolean }): void
    focusRequest: { id: string; seq: number } | null
    hubs: Set<string>; orphans: string[]; isolated: Set<string>
  }
  ```
  Later tasks replace the placeholder `main`/`context` slots in `KBGraphView`.

- [ ] **Step 1: CSS tokens and graph rules**

Append to `css/tailwind.css` right after the light `.kb-theme` block:

```css
/* KB Graph — topic palette (8 slots validated for CVD separation and contrast on both grounds) */
.kb-theme {
  --kb-topic-0: #6b7186;
  --kb-topic-1: #3987e5;
  --kb-topic-2: #d95926;
  --kb-topic-3: #199e70;
  --kb-topic-4: #c98500;
  --kb-topic-5: #d55181;
  --kb-topic-6: #008300;
  --kb-topic-7: #9085e9;
  --kb-topic-8: #e66767;
  --kb-graph-edge: #7c8296;
}

:where(.light, .light *) .kb-theme {
  --kb-topic-0: #8a8a8a;
  --kb-topic-1: #2a78d6;
  --kb-topic-2: #eb6834;
  --kb-topic-3: #1baf7a;
  --kb-topic-4: #eda100;
  --kb-topic-5: #e87ba4;
  --kb-topic-6: #008300;
  --kb-topic-7: #4a3aa7;
  --kb-topic-8: #e34948;
  --kb-graph-edge: #5a5751;
}

/* KB Graph — SVG marks. --kb-graph-k is the current zoom; labels divide by it to stay a constant screen size. */
.kb-graph {
  --kb-graph-k: 1;
}
.kb-graph-edge {
  stroke: var(--kb-graph-edge);
  stroke-width: 1;
  stroke-opacity: 0.55;
}
.kb-graph-edge.tag {
  stroke-opacity: 0.22;
  stroke-width: 0.8;
  stroke-dasharray: 2 3;
}
.kb-graph-edge.hi {
  stroke: var(--kb-text-strong);
  stroke-opacity: 0.95;
  stroke-width: 1.4;
}
.kb-graph-edge.tag.hi {
  stroke-opacity: 0.6;
}
.kb-graph-edge.dim {
  stroke-opacity: 0.05;
}
.kb-graph-node {
  cursor: pointer;
  outline: none;
}
.kb-graph-node .hit {
  fill: transparent;
}
.kb-graph-node .mark {
  stroke: var(--kb-bg);
  stroke-width: 1.5;
}
.kb-graph-node.tag .mark {
  fill: var(--kb-surface);
  stroke: var(--kb-graph-edge);
  stroke-width: 1.2;
}
.kb-graph-node.dim .mark {
  opacity: 0.12;
}
.kb-graph-node.sel .mark,
.kb-graph-node.hover .mark,
.kb-graph-node:focus-visible .mark {
  stroke: var(--kb-text-strong);
  stroke-width: 2.2;
}
.kb-graph-node.match .mark {
  stroke: var(--kb-accent);
  stroke-width: 2.4;
}
.kb-graph-node .ring {
  fill: none;
  stroke: var(--kb-text-strong);
  stroke-opacity: 0.25;
  stroke-width: 6;
  display: none;
}
.kb-graph-node.sel .ring {
  display: block;
}
.kb-graph-label {
  font-family: var(--font-family-mono);
  font-size: calc(10px / var(--kb-graph-k));
  fill: var(--kb-text-strong);
  paint-order: stroke;
  stroke: var(--kb-bg);
  stroke-width: calc(3px / var(--kb-graph-k));
  stroke-linejoin: round;
  dominant-baseline: central;
  pointer-events: none;
}
.kb-graph-label.tag {
  fill: var(--kb-text-muted);
  font-size: calc(9px / var(--kb-graph-k));
}
```

- [ ] **Step 2: Create `KBGraphContext.tsx`**

```tsx
'use client'

import { createContext, useContext } from 'react'
import type { KBData } from '@/components/kb/types'
import type { GraphFilters, GraphLink, GraphNode } from './graphModel'

export interface FocusRequest {
  id: string
  seq: number
}

export interface KBGraphState {
  data: KBData
  nodes: GraphNode[]
  links: GraphLink[]
  filters: GraphFilters
  setFilters: (f: GraphFilters) => void
  query: string
  setQuery: (q: string) => void
  hoverId: string | null
  setHoverId: (id: string | null) => void
  selectedId: string | null
  select: (id: string | null, opts?: { focus?: boolean }) => void
  focusRequest: FocusRequest | null
  hubs: Set<string>
  orphans: string[]
  isolated: Set<string>
}

export const KBGraphContext = createContext<KBGraphState | null>(null)

export function useKBGraph(): KBGraphState {
  const ctx = useContext(KBGraphContext)
  if (!ctx) throw new Error('useKBGraph must be used inside <KBGraphView>')
  return ctx
}
```

- [ ] **Step 3: Create `KBGraphView.tsx` (shell with placeholders)**

```tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import KBShell from '@/components/kb/KBShell'
import KBSidebar from '@/components/kb/KBSidebar'
import KBSearchTrigger from '@/components/kb/KBSearchTrigger'
import kbData from 'app/kb-data.json'
import type { KBData } from '@/components/kb/types'
import { KBGraphContext, type FocusRequest, type KBGraphState } from './KBGraphContext'
import {
  buildGraph,
  DEFAULT_FILTERS,
  hubIds,
  isolatedIds,
  orphanIds,
  type GraphFilters,
} from './graphModel'

const data = kbData as KBData
const HUBS = new Set(hubIds(data))
const ORPHANS = orphanIds(data)
const ISOLATED = new Set(isolatedIds(data))

export default function KBGraphView() {
  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_FILTERS)
  const [query, setQuery] = useState('')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)
  const graph = useMemo(() => buildGraph(data, filters), [filters])

  const select = useCallback((id: string | null, opts?: { focus?: boolean }) => {
    setSelectedId(id)
    if (id && opts?.focus) setFocusRequest((prev) => ({ id, seq: (prev?.seq ?? 0) + 1 }))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const state: KBGraphState = {
    data,
    nodes: graph.nodes,
    links: graph.links,
    filters,
    setFilters,
    query,
    setQuery,
    hoverId,
    setHoverId,
    selectedId,
    select,
    focusRequest,
    hubs: HUBS,
    orphans: ORPHANS,
    isolated: ISOLATED,
  }
  const linked = data.postIndex.length - ORPHANS.length

  return (
    <KBGraphContext.Provider value={state}>
      <div className="kb-breakout">
        <KBShell
          sidebar={<KBSidebar activeSlug={selectedId ?? undefined} />}
          main={
            <div
              className="flex h-full items-center justify-center text-xs"
              style={{ color: 'var(--kb-text-muted)' }}
            >
              Graph view is being assembled.
            </div>
          }
          breadcrumb={<span style={{ color: 'var(--kb-text-strong)' }}>Graph</span>}
          statusBar={
            <div className="flex w-full items-center gap-3">
              <span style={{ color: 'var(--kb-accent)' }}>&#9679; KB</span>
              <span>{`${data.postIndex.length} notes`}</span>
              <span>&middot;</span>
              <span>{`${data.topics.length} topics`}</span>
              <span>&middot;</span>
              <span>{`${linked} linked`}</span>
              <span>&middot;</span>
              <span style={{ color: 'var(--kb-accent)' }}>{`${ORPHANS.length} orphans`}</span>
              <span className="ml-auto hidden sm:inline">Esc to deselect &middot; / to filter</span>
              <KBSearchTrigger className="transition-colors hover:text-[var(--kb-accent)]">
                &middot; Cmd+K to search
              </KBSearchTrigger>
            </div>
          }
        />
      </div>
    </KBGraphContext.Provider>
  )
}
```

- [ ] **Step 4: Create `app/kb/graph/page.tsx`**

```tsx
import { genPageMetadata } from 'app/seo'
import KBGraphView from '@/components/kb/graph/KBGraphView'

export const metadata = genPageMetadata({
  title: 'Knowledge Graph',
  description:
    "Graph view of MartianLee's knowledge base — every note, its links, and shared tags in one picture.",
  robots: {
    index: false,
    follow: true,
  },
})

export default function KBGraphPage() {
  return <KBGraphView />
}
```

- [ ] **Step 5: Add the toolbar link in `KBShell.tsx`**

Add the import at the top (`next/link` is already imported as `Link`):

```tsx
import { usePathname } from 'next/navigation'
```

Inside the component, before `const hydrated = …`:

```tsx
  const pathname = usePathname()
  const onGraph = pathname === '/kb/graph'
```

Right after the Explorer `<button>…</button>` inside the first `.flex.items-center.gap-1` group, add:

```tsx
          <Link
            href="/kb/graph"
            title="Graph view"
            aria-current={onGraph ? 'page' : undefined}
            className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)] ${
              onGraph ? 'bg-[var(--kb-accent-dim)] text-[var(--kb-accent)]' : ''
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="2" />
              <circle cx="12" cy="3" r="2" />
              <circle cx="12" cy="13" r="2" />
              <path
                d="M4.6 7.1l5.8-3.2M4.6 8.9l5.8 3.2"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
            <span className="hidden sm:inline">Graph</span>
          </Link>
```

- [ ] **Step 6: Verify the route renders**

Run (background): `yarn next dev --turbopack -p 3466 > /tmp/kb-graph-dev.log 2>&1 &`
Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:3466/kb/graph` prints `200` (retry a few times; first compile takes ~30 s).
Then: `curl -s http://localhost:3466/kb/graph | grep -o "Graph view is being assembled\|100 notes\|48 orphans\|href=\"/kb/graph\"" | sort -u`
Expected, all four lines:
```
100 notes
48 orphans
Graph view is being assembled
href="/kb/graph"
```
Also `curl -s http://localhost:3466/kb | grep -c 'href="/kb/graph"'` → `1` or more (link visible on the list page).
Stop the server: `pkill -f "next dev --turbopack -p 3466"`.

- [ ] **Step 7: Lint, format, commit**

```bash
yarn prettier --write components/kb/graph/KBGraphContext.tsx components/kb/graph/KBGraphView.tsx app/kb/graph/page.tsx components/kb/KBShell.tsx css/tailwind.css
yarn eslint components/kb/graph/KBGraphContext.tsx components/kb/graph/KBGraphView.tsx app/kb/graph/page.tsx components/kb/KBShell.tsx
git add components/kb/graph/KBGraphContext.tsx components/kb/graph/KBGraphView.tsx app/kb/graph/page.tsx components/kb/KBShell.tsx css/tailwind.css
git commit -m "feat(kb-graph): /kb/graph 라우트 골격·툴바 링크·토픽 색 토큰

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 8: `KBGraphSvg` — rendering, pan/zoom, hover, select, labels, tooltip

**Files:**
- Create: `components/kb/graph/KBGraphSvg.tsx`
- Modify: `components/kb/graph/KBGraphView.tsx` (replace the placeholder `main`)

**Interfaces:**
- Consumes: `useKBGraph`, `computeLayout`, `Point`, `labelTier`, `placeLabels`, `searchIds`, `neighbourIds`, `topicColor`, `topicLabel`.
- Produces: `<KBGraphSvg />` (no props). Later tasks only add siblings.

- [ ] **Step 1: Create `KBGraphSvg.tsx`**

```tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
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

function ZoomButton({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
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
      cands.push({ id: n.id, tier, priority: n.degree, x: p.x, y: p.y, radius: n.radius, text: n.label })
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
    return ['kb-graph-edge', l.kind, touches ? 'hi' : '', dim ? 'dim' : ''].filter(Boolean).join(' ')
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
        <ZoomButton label="+" title="Zoom in" onClick={() => zoomAt(1.3, size().w / 2, size().h / 2)} />
        <ZoomButton label="−" title="Zoom out" onClick={() => zoomAt(1 / 1.3, size().w / 2, size().h / 2)} />
        <ZoomButton label="⤢" title="Fit to view" onClick={() => fit(positionsRef.current)} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount it in `KBGraphView.tsx`**

Add `import KBGraphSvg from './KBGraphSvg'` and replace the placeholder `main={…}` with:

```tsx
          main={
            <div className="flex h-full min-h-0 flex-col">
              <KBGraphSvg />
            </div>
          }
```

- [ ] **Step 3: Type-check and verify in the browser**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | grep -v "^$" | head -20`
Expected: no errors mentioning `components/kb/graph`.

Start the dev server on 3466 (see Task 7 Step 6), then:
`curl -s http://localhost:3466/kb/graph | grep -o 'class="kb-graph h-full' | head -1` → `class="kb-graph h-full`.

If Playwright's Chromium is installed, capture a screenshot for the reviewer:
`yarn playwright screenshot --viewport-size=1400,900 --wait-for-timeout=4000 http://localhost:3466/kb/graph /tmp/kb-graph-task8.png` and report the path. Skip if the browser is missing; the reviewer takes the screenshot.
Stop the server afterwards.

- [ ] **Step 4: Lint, format, commit**

```bash
yarn prettier --write components/kb/graph/KBGraphSvg.tsx components/kb/graph/KBGraphView.tsx
yarn eslint components/kb/graph/KBGraphSvg.tsx components/kb/graph/KBGraphView.tsx
git add components/kb/graph/KBGraphSvg.tsx components/kb/graph/KBGraphView.tsx
git commit -m "feat(kb-graph): SVG 그래프 렌더링·팬줌·호버·선택·라벨

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 9: `KBGraphControls` — search, topic chips, stage, Tags switch, legend

**Files:**
- Create: `components/kb/graph/KBGraphControls.tsx`
- Modify: `components/kb/graph/KBGraphView.tsx`
- Modify: `docs/superpowers/specs/2026-09-06-kb-graph-view-design.md` (search shortcut note)

**Interfaces:**
- Consumes: `useKBGraph`, `topicColor`, `sortTopics`.
- Produces: `<KBGraphControls />`.

- [ ] **Step 1: Create `KBGraphControls.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useKBGraph } from './KBGraphContext'
import { STAGE_ICON, sortTopics, topicColor } from './topicColors'

const STAGE_ORDER = ['seedling', 'budding', 'evergreen']

export default function KBGraphControls() {
  const g = useKBGraph()
  const inputRef = useRef<HTMLInputElement>(null)

  // "/" focuses the filter box (Cmd+K already opens the KB search palette).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.closest('input, textarea, [contenteditable="true"]')
      if (e.key === '/' && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const topics = sortTopics(g.data.topics)
  const stages = STAGE_ORDER.filter((s) => g.data.postIndex.some((p) => p.stage === s))

  const toggleTopic = (id: string) => {
    const next = new Set(g.filters.topics)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    g.setFilters({ ...g.filters, topics: next })
  }

  const chip = (active: boolean) =>
    `inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] whitespace-nowrap transition-colors ${
      active
        ? 'bg-[var(--kb-accent)] text-black'
        : 'bg-[var(--kb-surface-alt)] hover:bg-[var(--kb-accent-dim)]'
    }`

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-1.5 px-3 py-2 text-xs"
      style={{ borderBottom: '1px solid var(--kb-border)', color: 'var(--kb-text)' }}
    >
      <label
        className="flex h-6 min-w-[200px] items-center gap-1.5 rounded border px-2"
        style={{ borderColor: 'var(--kb-border)', background: 'var(--kb-surface)' }}
      >
        <span className="sr-only">Highlight notes</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M11.7 10.3a6 6 0 1 0-1.4 1.4l3.2 3.2 1.4-1.4-3.2-3.2zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={g.query}
          onChange={(e) => g.setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && g.query) {
              e.stopPropagation()
              g.setQuery('')
            }
          }}
          placeholder="Highlight notes… (title, tag, slug)"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
          style={{ color: 'var(--kb-text-strong)' }}
        />
        <kbd
          className="rounded border px-1 text-[10px]"
          style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}
        >
          /
        </kbd>
      </label>

      <span className="mx-0.5 h-4 w-px" style={{ background: 'var(--kb-border)' }} />

      {topics.map((t) => {
        const active = g.filters.topics.has(t.id)
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggleTopic(t.id)}
            className={chip(active)}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: topicColor(t.id),
                boxShadow: active ? '0 0 0 1.5px #fff' : undefined,
              }}
            />
            {t.label}
            <span className={active ? 'text-black/70' : ''} style={active ? undefined : { color: 'var(--kb-text-muted)' }}>
              {t.count}
            </span>
          </button>
        )
      })}

      <span className="mx-0.5 h-4 w-px" style={{ background: 'var(--kb-border)' }} />

      <div
        role="group"
        aria-label="Stage"
        className="inline-flex h-6 overflow-hidden rounded border"
        style={{ borderColor: 'var(--kb-border)', background: 'var(--kb-surface)' }}
      >
        {['all', ...stages].map((s, i) => {
          const active = g.filters.stage === s
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => g.setFilters({ ...g.filters, stage: s })}
              className={`px-2 text-[11px] ${i > 0 ? 'border-l' : ''} ${
                active ? 'bg-[var(--kb-accent-dim)] text-[var(--kb-accent)]' : ''
              }`}
              style={{ borderColor: 'var(--kb-border)', color: active ? undefined : 'var(--kb-text-muted)' }}
            >
              {s === 'all' ? 'All' : `${STAGE_ICON[s]} ${s[0].toUpperCase()}${s.slice(1)}`}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        aria-pressed={g.filters.tags}
        onClick={() => g.setFilters({ ...g.filters, tags: !g.filters.tags })}
        className="inline-flex h-6 items-center gap-1.5 text-[11px]"
      >
        <span
          className="relative h-3.5 w-[26px] rounded-full transition-colors"
          style={{ background: g.filters.tags ? 'var(--kb-accent)' : 'var(--kb-border)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full transition-transform"
            style={{
              background: 'var(--kb-surface)',
              transform: g.filters.tags ? 'translateX(12px)' : undefined,
            }}
          />
        </span>
        Tags
      </button>

      <div
        className="ml-auto hidden items-center gap-3 text-[10.5px] lg:flex"
        style={{ color: 'var(--kb-text-muted)' }}
      >
        <span className="inline-flex items-center gap-1">
          <svg width="26" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="26" y2="4" stroke="var(--kb-graph-edge)" strokeWidth="1.2" />
          </svg>
          link
        </span>
        <span className="inline-flex items-center gap-1">
          <svg width="26" height="8" aria-hidden="true">
            <line
              x1="0"
              y1="4"
              x2="26"
              y2="4"
              stroke="var(--kb-graph-edge)"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              opacity="0.7"
            />
          </svg>
          shared tag
        </span>
        <span className="inline-flex items-center gap-1">
          <svg width="10" height="8" aria-hidden="true">
            <circle cx="5" cy="4" r="3.2" fill="var(--kb-surface)" stroke="var(--kb-graph-edge)" strokeWidth="1.2" />
          </svg>
          tag node
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount it above the SVG in `KBGraphView.tsx`**

Add `import KBGraphControls from './KBGraphControls'` and change the `main` slot to:

```tsx
          main={
            <div className="flex h-full min-h-0 flex-col">
              <KBGraphControls />
              <KBGraphSvg />
            </div>
          }
```

- [ ] **Step 3: Record the shortcut decision in the spec**

In `docs/superpowers/specs/2026-09-06-kb-graph-view-design.md` section 5.6, replace "검색: `⌘K`로 포커스." with "검색: `/`로 포커스(`⌘K`는 기존 KB 검색 팔레트가 씁니다)." and in section 5.1 replace `Esc to deselect · ⌘K to search` with `Esc to deselect · / to filter · Cmd+K to search`.

- [ ] **Step 4: Type-check and verify**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | grep "components/kb/graph" ; echo "tsc done"`
Expected: only `tsc done`.

Dev server on 3466, then:
`curl -s http://localhost:3466/kb/graph | grep -o 'placeholder="Highlight notes[^"]*"\|aria-label="Stage"\|>Tags<' | sort -u`
Expected three lines. Stop the server.

- [ ] **Step 5: Lint, format, commit**

```bash
yarn prettier --write components/kb/graph/KBGraphControls.tsx components/kb/graph/KBGraphView.tsx docs/superpowers/specs/2026-09-06-kb-graph-view-design.md
yarn eslint components/kb/graph/KBGraphControls.tsx components/kb/graph/KBGraphView.tsx
git add components/kb/graph/KBGraphControls.tsx components/kb/graph/KBGraphView.tsx docs/superpowers/specs/2026-09-06-kb-graph-view-design.md
git commit -m "feat(kb-graph): 검색·토픽 칩·단계·Tags 토글 컨트롤

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 10: `KBGraphPanel` — Overview, Note and Tag modes

**Files:**
- Create: `components/kb/graph/KBGraphPanel.tsx`
- Modify: `components/kb/graph/KBGraphView.tsx` (add `context` slot)

**Interfaces:**
- Consumes: `useKBGraph`, `degreesOf`, `relatedUnlinked`, `noteMatchesFilters`, `topicColor`, `topicLabel`, `sortTopics`.
- Produces: `<KBGraphPanel />`.

- [ ] **Step 1: Create `KBGraphPanel.tsx`**

```tsx
'use client'

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import Link from '@/components/Link'
import type { KBPostEntry } from '@/components/kb/types'
import { useKBGraph } from './KBGraphContext'
import { degreesOf, noteMatchesFilters, relatedUnlinked } from './graphModel'
import { STAGE_ICON, sortTopics, topicColor, topicLabel } from './topicColors'

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
      style={{ color: 'var(--kb-text-muted)' }}
    >
      {children}
    </h3>
  )
}

function Section({ children }: { children: ReactNode }) {
  return (
    <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
      {children}
    </section>
  )
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[10px] leading-snug" style={{ color: 'var(--kb-text-muted)' }}>
      {children}
    </p>
  )
}

function Dot({ topic }: { topic?: string }) {
  return (
    <span
      className="h-[7px] w-[7px] shrink-0 rounded-full"
      style={{ background: topicColor(topic) }}
      aria-hidden="true"
    />
  )
}

function NoteRow({
  slug,
  title,
  topic,
  trailing,
}: {
  slug: string
  title: string
  topic?: string
  trailing?: ReactNode
}) {
  const g = useKBGraph()
  const active = g.selectedId === slug
  return (
    <button
      type="button"
      title={title}
      onClick={() => g.select(slug, { focus: true })}
      onPointerEnter={() => g.setHoverId(slug)}
      onPointerLeave={() => g.setHoverId(null)}
      className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11.5px] transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)] ${
        active ? 'bg-[var(--kb-accent-dim)] text-[var(--kb-accent)]' : ''
      }`}
    >
      <Dot topic={topic} />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {trailing}
    </button>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className="shrink-0 rounded border px-1 text-[9px]"
      style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}
    >
      {children}
    </span>
  )
}

function BackButton() {
  const g = useKBGraph()
  return (
    <button
      type="button"
      onClick={() => g.select(null)}
      className="mb-2 inline-flex items-center gap-1 text-[11px] transition-colors hover:text-[var(--kb-accent)]"
      style={{ color: 'var(--kb-text-muted)' }}
    >
      &larr; Overview
    </button>
  )
}

function Overview() {
  const g = useKBGraph()
  const deg = useMemo(() => degreesOf(g.data), [g.data])
  const filtered = g.filters.topics.size > 0 || g.filters.stage !== 'all'
  const visible = g.data.postIndex.filter((p) => noteMatchesFilters(p, g.filters))
  const visibleIds = new Set(visible.map((p) => p.slug))
  const byId = new Map(g.data.postIndex.map((p) => [p.slug, p]))
  const hubs = [...g.hubs].map((id) => byId.get(id)).filter((p): p is KBPostEntry => Boolean(p))
  const maxIn = Math.max(1, ...hubs.map((p) => deg.get(p.slug)?.inDegree ?? 0))
  const orphanNotes = g.orphans.map((id) => byId.get(id)).filter((p): p is KBPostEntry => Boolean(p))
  const orphanGroups = sortTopics(g.data.topics)
    .map((t) => ({
      topic: t,
      list: orphanNotes
        .filter((p) => p.topic === t.id && (!filtered || visibleIds.has(p.slug)))
        .sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .filter((grp) => grp.list.length > 0)
  const shownOrphans = orphanGroups.reduce((n, grp) => n + grp.list.length, 0)
  const shownIsolated = [...g.isolated].filter((id) => !filtered || visibleIds.has(id)).length
  const explicit = g.links.filter((l) => l.kind === 'link').length
  const linked = visible.filter((p) => {
    const d = deg.get(p.slug)
    return d && d.inDegree + d.outDegree > 0
  }).length

  const stat = (value: number, label: string, warn = false) => (
    <div className="flex flex-col">
      <span
        className="text-lg leading-tight font-medium tabular-nums"
        style={{ color: warn ? 'var(--kb-accent)' : 'var(--kb-text-strong)' }}
      >
        {value}
      </span>
      <span className="text-[10px]" style={{ color: 'var(--kb-text-muted)' }}>
        {label}
      </span>
    </div>
  )

  return (
    <>
      <Section>
        <SectionTitle>
          Overview{filtered && <span style={{ color: 'var(--kb-accent)' }}> &middot; filtered</span>}
        </SectionTitle>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {stat(visible.length, 'notes')}
          {stat(explicit, 'explicit links')}
          {stat(linked, 'linked notes')}
          {stat(shownOrphans, `orphans · ${shownIsolated} fully isolated`, true)}
        </div>
        <Hint>Orphan = no explicit link in or out. Fully isolated = not even a shared tag node.</Hint>
      </Section>

      <Section>
        <SectionTitle>Hubs &middot; most backlinks</SectionTitle>
        <div className="space-y-0.5">
          {hubs.map((p) => {
            const inDeg = deg.get(p.slug)?.inDegree ?? 0
            return (
              <NoteRow
                key={p.slug}
                slug={p.slug}
                title={p.title}
                topic={p.topic}
                trailing={
                  <>
                    <span
                      className="h-[3px] shrink-0 rounded-sm opacity-50"
                      style={{
                        width: `${Math.round(8 + (40 * inDeg) / maxIn)}px`,
                        background: 'var(--kb-text-muted)',
                      }}
                      aria-hidden="true"
                    />
                    <span className="shrink-0 text-[10.5px] tabular-nums" style={{ color: 'var(--kb-text-muted)' }}>
                      &darr;{inDeg}
                    </span>
                  </>
                }
              />
            )
          })}
        </div>
      </Section>

      <Section>
        <SectionTitle>{`Orphans · ${shownOrphans}`}</SectionTitle>
        {orphanGroups.map((grp) => (
          <div key={grp.topic.id} className="mt-1.5 first:mt-0">
            <div
              className="flex items-center gap-1.5 px-1.5 py-0.5 text-[10.5px]"
              style={{ color: 'var(--kb-text-muted)' }}
            >
              <Dot topic={grp.topic.id} />
              {grp.topic.label}
              <span className="ml-auto tabular-nums">{grp.list.length}</span>
            </div>
            <div className="space-y-0.5">
              {grp.list.map((p) => (
                <NoteRow
                  key={p.slug}
                  slug={p.slug}
                  title={p.title}
                  topic={p.topic}
                  trailing={
                    <>
                      {g.isolated.has(p.slug) && <Badge>isolated</Badge>}
                      <span className="shrink-0 text-[10.5px] tabular-nums" style={{ color: 'var(--kb-text-muted)' }}>
                        {p.date.slice(0, 4)}
                      </span>
                    </>
                  }
                />
              ))}
            </div>
          </div>
        ))}
        <Hint>Click an orphan to zoom to it.</Hint>
      </Section>
    </>
  )
}

function NoteMode({ note }: { note: KBPostEntry }) {
  const g = useKBGraph()
  const deg = g.data.postIndex.length ? degreesOf(g.data).get(note.slug) : undefined
  const byId = new Map(g.data.postIndex.map((p) => [p.slug, p]))
  const backlinks = (g.data.backlinks[note.slug] || []).map((b) => byId.get(b.slug)).filter((p): p is KBPostEntry => Boolean(p))
  const forward = (g.data.forwardLinks[note.slug] || []).map((s) => byId.get(s)).filter((p): p is KBPostEntry => Boolean(p))
  const related = relatedUnlinked(g.data, note.slug)

  const list = (items: KBPostEntry[], empty: string) =>
    items.length === 0 ? (
      <p className="text-[11px] italic" style={{ color: 'var(--kb-text-muted)' }}>
        {empty}
      </p>
    ) : (
      <div className="space-y-0.5">
        {items.map((p) => (
          <NoteRow key={p.slug} slug={p.slug} title={p.title} topic={p.topic} />
        ))}
      </div>
    )

  return (
    <>
      <Section>
        <BackButton />
        <h2
          className="mb-2 text-[18px] leading-tight font-normal text-balance"
          style={{ color: 'var(--kb-text-strong)', fontFamily: 'var(--font-family-serif)' }}
        >
          {note.title}
        </h2>
        <div className="mb-2 flex flex-wrap gap-x-2.5 gap-y-1 text-[10.5px]" style={{ color: 'var(--kb-text-muted)' }}>
          <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--kb-text)' }}>
            <Dot topic={note.topic} />
            {topicLabel(note.topic)}
          </span>
          <span>
            {STAGE_ICON[note.stage] || ''} {note.stage}
          </span>
          <span>{note.date.slice(0, 10)}</span>
          <span>
            &darr;{deg?.inDegree ?? 0} &uarr;{deg?.outDegree ?? 0}
          </span>
        </div>
        {note.summary && (
          <p className="line-clamp-3 text-[11px] leading-relaxed" style={{ color: 'var(--kb-text)' }}>
            {note.summary}
          </p>
        )}
        <Link
          href={`/kb/${note.slug}`}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] transition-colors hover:bg-[var(--kb-accent-dim)]"
          style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-accent)' }}
        >
          Open note &#8599;
        </Link>
      </Section>
      <Section>
        <SectionTitle>{`Backlinks (${backlinks.length})`}</SectionTitle>
        {list(backlinks, 'No notes link here yet.')}
      </Section>
      <Section>
        <SectionTitle>{`Links to (${forward.length})`}</SectionTitle>
        {list(forward, 'This note links nowhere yet.')}
      </Section>
      <Section>
        <SectionTitle>{`Related, not linked (${related.length})`}</SectionTitle>
        {related.length === 0 ? (
          <p className="text-[11px] italic" style={{ color: 'var(--kb-text-muted)' }}>
            No unlinked note shares 2+ tags.
          </p>
        ) : (
          <div className="space-y-0.5">
            {related.map((r) => (
              <NoteRow
                key={r.slug}
                slug={r.slug}
                title={r.title}
                topic={byId.get(r.slug)?.topic}
                trailing={
                  <span className="flex shrink-0 gap-1">
                    {r.sharedTags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded px-1 text-[9px]"
                        style={{ background: 'var(--kb-accent-dim)', color: 'var(--kb-accent)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                }
              />
            ))}
          </div>
        )}
        <Hint>Shares two or more tags with this note but is not linked either way.</Hint>
      </Section>
      <Section>
        <SectionTitle>Tags</SectionTitle>
        <div className="flex flex-wrap gap-1">
          {note.tags.length === 0 ? (
            <span className="text-[11px] italic" style={{ color: 'var(--kb-text-muted)' }}>
              none
            </span>
          ) : (
            note.tags.map((t) => (
              <span
                key={t}
                className="rounded px-1.5 text-[10px]"
                style={{ background: 'var(--kb-surface-alt)', color: 'var(--kb-text-muted)' }}
              >
                {t}
              </span>
            ))
          )}
        </div>
      </Section>
    </>
  )
}

function TagMode({ id }: { id: string }) {
  const g = useKBGraph()
  const tag = g.data.graph.tagNodes.find((t) => t.id === id)
  const byId = new Map(g.data.postIndex.map((p) => [p.slug, p]))
  const orphanSet = new Set(g.orphans)
  const members = g.data.graph.tagLinks
    .filter((l) => l.target === id)
    .map((l) => byId.get(l.source))
    .filter((p): p is KBPostEntry => Boolean(p))
    .sort((a, b) => b.date.localeCompare(a.date))
  if (!tag) return null
  return (
    <>
      <Section>
        <BackButton />
        <h2
          className="mb-2 text-[18px] leading-tight font-normal"
          style={{ color: 'var(--kb-text-strong)', fontFamily: 'var(--font-family-serif)' }}
        >
          #{tag.label}
        </h2>
        <div className="flex gap-2.5 text-[10.5px]" style={{ color: 'var(--kb-text-muted)' }}>
          <span>{members.length} notes</span>
          <span>{members.filter((p) => orphanSet.has(p.slug)).length} of them orphans</span>
        </div>
      </Section>
      <Section>
        <SectionTitle>Notes with this tag</SectionTitle>
        <div className="space-y-0.5">
          {members.map((p) => (
            <NoteRow
              key={p.slug}
              slug={p.slug}
              title={p.title}
              topic={p.topic}
              trailing={orphanSet.has(p.slug) ? <Badge>orphan</Badge> : undefined}
            />
          ))}
        </div>
      </Section>
    </>
  )
}

export default function KBGraphPanel() {
  const g = useKBGraph()
  const sel = g.selectedId
  const note = sel ? g.data.postIndex.find((p) => p.slug === sel) : undefined
  return (
    <div className="flex h-full flex-col text-xs" style={{ color: 'var(--kb-text-strong)' }}>
      {sel && sel.startsWith('tag:') ? <TagMode id={sel} /> : note ? <NoteMode note={note} /> : <Overview />}
    </div>
  )
}
```

- [ ] **Step 2: Mount it in `KBGraphView.tsx`**

Add `import KBGraphPanel from './KBGraphPanel'` and pass `context={<KBGraphPanel />}` to `KBShell` (after `main`).

- [ ] **Step 3: Type-check and verify**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | grep "components/kb/graph" ; echo "tsc done"`
Expected: only `tsc done`.

Dev server on 3466, then:
`curl -s http://localhost:3466/kb/graph | grep -o 'Hubs · most backlinks\|Orphans · 48\|fully isolated' | sort -u`
Expected: three lines (`Orphans · 48`, `19 fully isolated` inside the stat label, `Hubs · most backlinks`). Stop the server.

- [ ] **Step 4: Lint, format, commit**

```bash
yarn prettier --write components/kb/graph/KBGraphPanel.tsx components/kb/graph/KBGraphView.tsx
yarn eslint components/kb/graph/KBGraphPanel.tsx components/kb/graph/KBGraphView.tsx
git add components/kb/graph/KBGraphPanel.tsx components/kb/graph/KBGraphView.tsx
git commit -m "feat(kb-graph): 컨텍스트 패널(Overview·Note·Tag 모드)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 11: Sidebar `onSelect` and note-page "Related, not linked"

**Files:**
- Modify: `components/kb/KBSidebar.tsx`
- Modify: `components/kb/graph/KBGraphView.tsx`
- Modify: `components/kb/KBContextPanel.tsx`

**Interfaces:**
- Consumes: `relatedUnlinked` (Task 4), `select` from context.
- Produces: `KBSidebar` prop `onSelect?: (slug: string) => void` (when given, note rows are buttons that call it instead of links).

- [ ] **Step 1: Add `onSelect` to `KBSidebar.tsx`**

Change the props interface:

```tsx
interface KBSidebarProps {
  activeSlug?: string
  /** When set, clicking a note calls this instead of navigating (used by the graph page). */
  onSelect?: (slug: string) => void
}

export default function KBSidebar({ activeSlug, onSelect }: KBSidebarProps) {
```

Replace the `{notes.map((note) => { … })}` block with:

```tsx
                    {notes.map((note) => {
                      const isActive = note.slug === activeSlug
                      const className = `flex w-full items-center gap-1.5 py-1 pr-2 pl-3 text-left text-[12.5px] transition-colors ${
                        isActive
                          ? 'bg-[var(--kb-accent-dim)] text-[var(--kb-accent)]'
                          : 'hover:bg-[var(--kb-accent-dim)]'
                      }`
                      const inner = (
                        <>
                          <span className="shrink-0 text-[10px]">
                            {STAGE_ICON[note.stage] || '\u{1F33F}'}
                          </span>
                          <span className="truncate">{note.title}</span>
                        </>
                      )
                      return onSelect ? (
                        <button
                          key={note.slug}
                          type="button"
                          onClick={() => onSelect(note.slug)}
                          className={className}
                          title={note.title}
                        >
                          {inner}
                        </button>
                      ) : (
                        <Link
                          key={note.slug}
                          href={`/kb/${note.slug}`}
                          className={className}
                          title={note.title}
                        >
                          {inner}
                        </Link>
                      )
                    })}
```

- [ ] **Step 2: Wire it in `KBGraphView.tsx`**

Replace the `sidebar={…}` prop with:

```tsx
          sidebar={
            <KBSidebar
              activeSlug={selectedId ?? undefined}
              onSelect={(slug) => select(slug, { focus: true })}
            />
          }
```

- [ ] **Step 3: Add the section to `KBContextPanel.tsx`**

Add the import: `import { relatedUnlinked } from '@/components/kb/graph/graphModel'`.
Inside the component, after `const note = …`, add `const related = relatedUnlinked(data, slug)`.
Insert this section between the "Forward Links" block and the "Properties" block:

```tsx
      {/* Related, not linked */}
      <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
        <h3
          className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          {`Related, not linked (${related.length})`}
        </h3>
        {related.length === 0 ? (
          <p className="italic" style={{ color: 'var(--kb-text-muted)' }}>
            No unlinked note shares 2+ tags.
          </p>
        ) : (
          <div className="space-y-1">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/kb/${r.slug}`}
                className="block rounded px-1.5 py-1 transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
              >
                <span className="block truncate font-medium">{r.title}</span>
                <span className="block truncate text-[10px]" style={{ color: 'var(--kb-accent)' }}>
                  {r.sharedTags.slice(0, 2).join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        )}
        <p className="mt-2 text-[10px] leading-snug" style={{ color: 'var(--kb-text-muted)' }}>
          Shares two or more tags with this note but is not linked either way.
        </p>
      </section>
```

- [ ] **Step 4: Verify**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | grep "components/kb" ; echo "tsc done"` → only `tsc done`.

Dev server on 3466, then:
`curl -s http://localhost:3466/kb/2026-09-05-webmcp-explained | grep -o 'Related, not linked ([0-9]*)'`
Expected: `Related, not linked (5)` (WebMCP shares tags with several browser-automation posts it does not link to; any number from 1 to 5 is acceptable, 0 is not).
`curl -s http://localhost:3466/kb | grep -c "Related, not linked"` → `0` (list page unaffected).
Stop the server.

- [ ] **Step 5: Lint, format, commit**

```bash
yarn prettier --write components/kb/KBSidebar.tsx components/kb/graph/KBGraphView.tsx components/kb/KBContextPanel.tsx
yarn eslint components/kb/KBSidebar.tsx components/kb/graph/KBGraphView.tsx components/kb/KBContextPanel.tsx
git add components/kb/KBSidebar.tsx components/kb/graph/KBGraphView.tsx components/kb/KBContextPanel.tsx
git commit -m "feat(kb): 사이드바 onSelect·노트 페이지 Related not linked 섹션

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015NjCtzvswXHmJa8LiqjQGZ"
```

---

### Task 12: Full verification — tests, lint, build, console, screenshots

**Files:** none new. Fix anything these checks surface, in the file that owns the problem, and commit as `fix(kb-graph): …`.

- [ ] **Step 1: Unit tests and lint**

Run: `yarn test 2>&1 | tail -4`
Expected: `# pass 27` (or more), `# fail 0`.

Run: `yarn lint`
Expected: exit 0, no output.

- [ ] **Step 2: Production build**

Run: `yarn build 2>&1 | tail -15`
Expected: `✓ Generating static pages`, the route list includes `/kb/graph`, and postbuild finishes. If the build hangs for more than 5 minutes inside mermaid rendering, stop it and re-run with `DISABLE_REHYPE_MERMAID=true yarn build`; report that you did so.

- [ ] **Step 3: Console is clean on `/kb`**

Dev server on 3466. Run:

```bash
yarn playwright screenshot --viewport-size=1400,900 --wait-for-timeout=3000 http://localhost:3466/kb /tmp/kb-list.png 2>&1 | tail -2
```

Then check for duplicate-key errors with a tiny script:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 80)) });
  await p.goto('http://localhost:3466/kb', { waitUntil: 'networkidle' });
  console.log('console errors:', errors.length); errors.slice(0, 5).forEach((e) => console.log(' ', e));
  await b.close();
})();
"
```

Expected: `console errors: 0`. If Chromium is not installed (`browserType.launch: Executable doesn't exist`), report it and leave this check for the reviewer.

- [ ] **Step 4: Screenshots for the reviewer**

With the dev server still running:

```bash
yarn playwright screenshot --viewport-size=1400,900 --wait-for-timeout=4000 http://localhost:3466/kb/graph /tmp/kb-graph-light.png
yarn playwright screenshot --viewport-size=390,844 --wait-for-timeout=4000 http://localhost:3466/kb/graph /tmp/kb-graph-mobile.png
yarn playwright screenshot --viewport-size=1400,900 --wait-for-timeout=4000 http://localhost:3466/kb/2026-09-05-webmcp-explained /tmp/kb-note-related.png
```

Report the three paths (or that Chromium is missing). Stop the dev server.

- [ ] **Step 5: Final commit (only if fixes were needed)**

```bash
git status --short
```

Expected: clean. If files changed during fixes, format, lint, and commit them with a `fix(kb-graph): …` message and the standard trailer.
