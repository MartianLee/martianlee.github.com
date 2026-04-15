# Knowledge IDE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-panel "Knowledge IDE" at `/kb` that presents the blog's 51 posts as an interconnected knowledge base with topic tree, context panel, and IDE-like aesthetics.

**Architecture:** New `/kb` route with its own full-width layout (bypasses existing `SectionContainer`). All data is computed at build time (compatible with `output: 'export'`). Contentlayer schema extended with `topic` and `stage` fields. A build script generates `backlinks.json` and `kb-data.json` for cross-note relationships. Existing `/posts` routes remain untouched.

**Tech Stack:** Next.js (static export), Contentlayer2, Tailwind CSS v4, JetBrains Mono + Instrument Serif (Google Fonts)

**Design Direction: "Industrial-Utilitarian IDE"**

- Deep ink background (#0a0e1a dark / #f8f7f4 light) with amber accent (#f59e0b)
- 3 rigid panels separated by 1px borders (like a tiling WM)
- Monospace-dominant typography (JetBrains Mono)
- Instrument Serif for note titles only (editorial contrast)
- Status bar at bottom with note metadata
- Zero decorative elements — every pixel is information

---

### Task 1: Fonts & KB CSS Foundation

**Files:**

- Modify: `app/layout.tsx:1-15` (add font imports)
- Modify: `css/tailwind.css` (add KB CSS variables and utility classes)

- [ ] **Step 1: Add Google Font imports in layout.tsx**

Add JetBrains Mono and Instrument Serif alongside existing Space Grotesk:

```tsx
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif } from 'next/font/google'

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

const jetbrains_mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

const instrument_serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
})
```

Update the `<html>` className to include all three font variables:

```tsx
className={`${space_grotesk.variable} ${jetbrains_mono.variable} ${instrument_serif.variable} scroll-smooth`}
```

- [ ] **Step 2: Add KB CSS variables and utilities to tailwind.css**

Append to `css/tailwind.css` after existing `@theme` block:

```css
@theme {
  /* ... existing theme ... */
  --font-family-mono: var(--font-jetbrains), ui-monospace, monospace;
  --font-family-serif: var(--font-instrument), Georgia, serif;
}
```

Then add KB-specific styles at the end of the file:

```css
/* Knowledge IDE Theme */
.kb-theme {
  --kb-bg: #0a0e1a;
  --kb-surface: #0f1320;
  --kb-surface-alt: #141825;
  --kb-border: #1c2033;
  --kb-text: #b8bcc8;
  --kb-text-strong: #e2e4ea;
  --kb-text-muted: #555b6e;
  --kb-accent: #f59e0b;
  --kb-accent-dim: rgba(245, 158, 11, 0.1);
  --kb-accent-strong: #fbbf24;
  --kb-green: #34d399;
  --kb-yellow: #fbbf24;
  --kb-red: #f87171;
}

:where(.light, .light *) .kb-theme {
  --kb-bg: #f8f7f4;
  --kb-surface: #ffffff;
  --kb-surface-alt: #f0efec;
  --kb-border: #e2e0db;
  --kb-text: #3d3d3d;
  --kb-text-strong: #1a1a1a;
  --kb-text-muted: #8a8a8a;
  --kb-accent: #d97706;
  --kb-accent-dim: rgba(217, 119, 6, 0.08);
  --kb-accent-strong: #b45309;
  --kb-green: #059669;
  --kb-yellow: #d97706;
  --kb-red: #dc2626;
}
```

- [ ] **Step 3: Verify fonts load — run dev server**

Run: `cd /Users/dede/workspace/martianlee.github.com && yarn dev`
Open browser, inspect `<html>` element, confirm all three `--font-*` CSS variables are present.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx css/tailwind.css
git commit -m "feat(kb): add JetBrains Mono + Instrument Serif fonts and KB theme CSS variables"
```

---

### Task 2: Contentlayer Schema Extension

**Files:**

- Modify: `contentlayer.config.ts:91-124` (Blog document type fields)

- [ ] **Step 1: Add `topic` and `stage` fields to Blog schema**

In the `fields` object of the `Blog` document type, add:

```ts
fields: {
  title: { type: 'string', required: true },
  date: { type: 'date', required: true },
  tags: { type: 'list', of: { type: 'string' }, default: [] },
  lastmod: { type: 'date' },
  draft: { type: 'boolean' },
  summary: { type: 'string' },
  images: { type: 'json' },
  authors: { type: 'list', of: { type: 'string' } },
  layout: { type: 'string' },
  bibliography: { type: 'string' },
  canonicalUrl: { type: 'string' },
  topic: { type: 'string' },
  stage: { type: 'enum', options: ['seedling', 'budding', 'evergreen'], default: 'budding' },
},
```

- [ ] **Step 2: Rebuild contentlayer to verify schema**

Run: `cd /Users/dede/workspace/martianlee.github.com && npx contentlayer2 build`
Expected: Build succeeds. Existing posts without `topic`/`stage` use defaults (undefined topic, 'budding' stage).

- [ ] **Step 3: Commit**

```bash
git add contentlayer.config.ts
git commit -m "feat(kb): add topic and stage fields to Blog contentlayer schema"
```

---

### Task 3: KB Data Generation Script

**Files:**

- Create: `scripts/generate-kb-data.mjs`
- Modify: `contentlayer.config.ts:185-189` (onSuccess hook)

This script runs at build time and generates:

1. Topic assignments for posts that don't have explicit `topic` in frontmatter (auto-inferred from tags)
2. Backlinks map (which notes reference which other notes)
3. Topic metadata (note counts per topic)

- [ ] **Step 1: Create the KB data generation script**

```js
// scripts/generate-kb-data.mjs
import { writeFileSync, readFileSync, readdirSync } from 'fs'
import path from 'path'

const TOPIC_RULES = [
  {
    topic: 'ai-infrastructure',
    match: (post) =>
      post.tags?.some((t) =>
        ['architecture', 'ai-agent', 'llm', 'langchain', 'ollama', 'rust'].includes(t.toLowerCase())
      ) || post.title?.toLowerCase().includes('아키텍처 분석'),
  },
  {
    topic: 'web-frontend',
    match: (post) =>
      post.tags?.some((t) =>
        ['react', 'angular', 'vue', 'next.js', 'css', 'react-native', 'frontend'].includes(
          t.toLowerCase()
        )
      ),
  },
  {
    topic: 'backend',
    match: (post) =>
      post.tags?.some((t) =>
        ['rails', 'django', 'spring', 'spring-boot', 'postgresql', 'node.js', 'ruby'].includes(
          t.toLowerCase()
        )
      ),
  },
  {
    topic: 'devops-cloud',
    match: (post) =>
      post.tags?.some((t) =>
        ['docker', 'kubernetes', 'gcp', 'aws', 'firebase', 'deploy'].includes(t.toLowerCase())
      ),
  },
  {
    topic: 'dev-life',
    match: (post) =>
      post.tags?.some((t) =>
        ['interview', 'review', 'til', 'blog', 'career'].includes(t.toLowerCase())
      ) ||
      post.title?.toLowerCase().includes('면접') ||
      post.title?.toLowerCase().includes('til'),
  },
  {
    topic: 'algorithms',
    match: (post) =>
      post.tags?.some((t) =>
        ['leetcode', 'algorithm', 'problem-solving'].includes(t.toLowerCase())
      ),
  },
]

export function inferTopic(post) {
  if (post.topic) return post.topic
  for (const rule of TOPIC_RULES) {
    if (rule.match(post)) return rule.topic
  }
  return 'uncategorized'
}

export function generateKBData(allBlogs) {
  const posts = allBlogs
    .filter((p) => !p.draft)
    .map((p) => ({
      slug: p.slug || p._raw?.flattenedPath?.replace(/^.+?(\/)/, ''),
      title: p.title,
      date: p.date,
      tags: p.tags || [],
      topic: p.topic,
      stage: p.stage || 'budding',
      summary: p.summary || '',
      body: p.body?.raw || '',
    }))

  // Assign topics
  const topicMap = {}
  for (const post of posts) {
    post.topic = inferTopic(post)
    if (!topicMap[post.topic]) {
      topicMap[post.topic] = []
    }
    topicMap[post.topic].push(post.slug)
  }

  // Scan for [[wiki-links]] and internal /posts/ links to build backlinks
  const backlinks = {}
  const forwardLinks = {}
  const slugSet = new Set(posts.map((p) => p.slug))

  for (const post of posts) {
    forwardLinks[post.slug] = []

    // Match [[slug]] or [[slug|display]]
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
    let match
    while ((match = wikiLinkRegex.exec(post.body)) !== null) {
      const targetSlug = match[1].trim()
      if (slugSet.has(targetSlug) && targetSlug !== post.slug) {
        forwardLinks[post.slug].push(targetSlug)
        if (!backlinks[targetSlug]) backlinks[targetSlug] = []
        backlinks[targetSlug].push({
          slug: post.slug,
          title: post.title,
        })
      }
    }

    // Also match internal href="/posts/SLUG" links
    const hrefRegex = /href=["']\/posts\/([^"']+)["']/g
    while ((match = hrefRegex.exec(post.body)) !== null) {
      const targetSlug = match[1].trim()
      if (slugSet.has(targetSlug) && targetSlug !== post.slug) {
        forwardLinks[post.slug].push(targetSlug)
        if (!backlinks[targetSlug]) backlinks[targetSlug] = []
        backlinks[targetSlug].push({
          slug: post.slug,
          title: post.title,
        })
      }
    }
  }

  // Deduplicate backlinks
  for (const slug of Object.keys(backlinks)) {
    const seen = new Set()
    backlinks[slug] = backlinks[slug].filter((bl) => {
      if (seen.has(bl.slug)) return false
      seen.add(bl.slug)
      return true
    })
  }

  // Build topic metadata
  const topicLabels = {
    'ai-infrastructure': 'AI Infrastructure',
    'web-frontend': 'Web Frontend',
    backend: 'Backend',
    'devops-cloud': 'DevOps & Cloud',
    'dev-life': 'Dev Life',
    algorithms: 'Algorithms',
    uncategorized: 'Uncategorized',
  }

  const topics = Object.entries(topicMap).map(([id, slugs]) => ({
    id,
    label: topicLabels[id] || id,
    count: slugs.length,
    slugs,
  }))

  // Post index (lightweight, for sidebar/listing)
  const postIndex = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    topic: p.topic,
    stage: p.stage,
    tags: p.tags,
    summary: p.summary,
  }))

  const kbData = {
    topics: topics.sort((a, b) => b.count - a.count),
    backlinks,
    forwardLinks,
    postIndex,
    generatedAt: new Date().toISOString(),
  }

  writeFileSync('./app/kb-data.json', JSON.stringify(kbData, null, 2))
  console.log(
    `KB data generated: ${posts.length} notes, ${topics.length} topics, ${Object.keys(backlinks).length} notes with backlinks`
  )
}
```

- [ ] **Step 2: Wire into Contentlayer onSuccess hook**

In `contentlayer.config.ts`, add the import at the top (use dynamic import since it's ESM):

```ts
// At the end of the onSuccess callback, after createSearchIndex:
onSuccess: async (importData) => {
  const { allDocuments } = await importData()
  createTagCount(allDocuments)
  createSearchIndex(allDocuments)
  // Generate KB data
  const { generateKBData } = await import('./scripts/generate-kb-data.mjs')
  generateKBData(allDocuments)
},
```

- [ ] **Step 3: Build and verify KB data is generated**

Run: `cd /Users/dede/workspace/martianlee.github.com && npx contentlayer2 build`
Expected: Console shows "KB data generated: 51 notes, N topics, ..." and `app/kb-data.json` exists.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-kb-data.mjs contentlayer.config.ts app/kb-data.json
git commit -m "feat(kb): add build-time KB data generation (topics, backlinks, post index)"
```

---

### Task 4: KB Layout Shell (3-Panel)

**Files:**

- Create: `app/kb/layout.tsx`
- Create: `components/kb/KBShell.tsx`

The KB gets its own layout that is full-viewport, bypassing the blog's SectionContainer and Footer. The Header remains for navigation continuity.

- [ ] **Step 1: Create the KBShell component (3-panel container)**

```tsx
// components/kb/KBShell.tsx
'use client'

import { useState, ReactNode } from 'react'

interface KBShellProps {
  sidebar: ReactNode
  main: ReactNode
  context?: ReactNode
  statusBar?: ReactNode
}

export default function KBShell({ sidebar, main, context, statusBar }: KBShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [contextOpen, setContextOpen] = useState(true)

  return (
    <div
      className="kb-theme flex h-[calc(100vh-80px)] flex-col font-mono"
      style={{ background: 'var(--kb-bg)' }}
    >
      {/* Toolbar */}
      <div
        className="flex h-9 shrink-0 items-center justify-between px-3 text-xs"
        style={{ borderBottom: '1px solid var(--kb-border)', color: 'var(--kb-text-muted)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 transition-colors hover:text-[var(--kb-accent)]"
            title="Toggle sidebar (Ctrl+B)"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2.5A.5.5 0 0 1 .5 2h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0 5A.5.5 0 0 1 .5 7h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z" />
            </svg>
            Explorer
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--kb-accent)' }}>KB</span>
          <span>/</span>
          <span>Knowledge Base</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setContextOpen(!contextOpen)}
            className="flex items-center gap-1.5 transition-colors hover:text-[var(--kb-accent)]"
            title="Toggle context panel"
          >
            Context
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2.5A.5.5 0 0 1 .5 2h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm8 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 3-Panel Body */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside
            className="w-60 shrink-0 overflow-y-auto"
            style={{
              borderRight: '1px solid var(--kb-border)',
              background: 'var(--kb-surface)',
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main */}
        <main className="min-w-0 flex-1 overflow-y-auto" style={{ background: 'var(--kb-bg)' }}>
          {main}
        </main>

        {/* Context Panel */}
        {contextOpen && context && (
          <aside
            className="w-64 shrink-0 overflow-y-auto"
            style={{
              borderLeft: '1px solid var(--kb-border)',
              background: 'var(--kb-surface)',
            }}
          >
            {context}
          </aside>
        )}
      </div>

      {/* Status Bar */}
      {statusBar && (
        <div
          className="flex h-6 shrink-0 items-center px-3 text-[11px]"
          style={{
            borderTop: '1px solid var(--kb-border)',
            background: 'var(--kb-surface-alt)',
            color: 'var(--kb-text-muted)',
          }}
        >
          {statusBar}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create the KB layout (bypasses blog layout)**

```tsx
// app/kb/layout.tsx
import { JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import Header from '@/components/Header'
import SectionContainer from '@/components/SectionContainer'
import { SearchProvider, SearchConfig } from 'pliny/search'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Knowledge Base',
  description:
    "MartianLee's personal knowledge base — notes on architecture, web development, and AI infrastructure.",
})

export default function KBLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>{children}</SearchProvider>
  )
}
```

Note: The KB layout doesn't wrap children in SectionContainer or Footer. The root layout.tsx already provides the Header. But because the root layout wraps everything in SectionContainer (max-w-5xl), we need to handle this. We will use a CSS escape on the KB page to break out of the container.

Actually — looking at the root layout, the SectionContainer wraps `<Header>` and `<main>` together. The KB needs to break out of this. The cleanest solution: add a `kb-fullwidth` class on the KB page's root element and use negative margin + full viewport width to escape the container.

Alternative: modify SectionContainer to not constrain when a specific prop/context is set. Simpler: just use CSS to break out.

In KBShell, wrap everything in:

```css
.kb-breakout {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}
```

Add this to tailwind.css in the KB section.

- [ ] **Step 3: Add KB breakout utility to tailwind.css**

```css
/* KB Layout Breakout */
.kb-breakout {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}
```

- [ ] **Step 4: Verify layout renders — create minimal /kb page**

Create a temporary `app/kb/page.tsx`:

```tsx
import KBShell from '@/components/kb/KBShell'

export default function KBPage() {
  return (
    <div className="kb-breakout">
      <KBShell
        sidebar={
          <div className="p-4 text-sm" style={{ color: 'var(--kb-text)' }}>
            Sidebar
          </div>
        }
        main={
          <div className="p-8 text-sm" style={{ color: 'var(--kb-text)' }}>
            Main content area
          </div>
        }
        context={
          <div className="p-4 text-sm" style={{ color: 'var(--kb-text)' }}>
            Context panel
          </div>
        }
        statusBar={<span>51 notes &middot; 6 topics</span>}
      />
    </div>
  )
}
```

Run dev server, navigate to `/kb`, verify 3-panel layout renders correctly.

- [ ] **Step 5: Commit**

```bash
git add components/kb/KBShell.tsx app/kb/layout.tsx app/kb/page.tsx css/tailwind.css
git commit -m "feat(kb): create 3-panel IDE shell layout with toolbar and status bar"
```

---

### Task 5: KB Sidebar — Topic Tree

**Files:**

- Create: `components/kb/KBSidebar.tsx`

- [ ] **Step 1: Build the sidebar with collapsible topic tree**

```tsx
// components/kb/KBSidebar.tsx
'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import kbData from 'app/kb-data.json'

const STAGE_ICON: Record<string, string> = {
  seedling: '\u{1F331}', // 🌱
  budding: '\u{1F33F}', // 🌿
  evergreen: '\u{1F333}', // 🌳
}

const TOPIC_ICON: Record<string, string> = {
  'ai-infrastructure': '\u{1F916}', // 🤖
  'web-frontend': '\u{1F310}', // 🌐
  backend: '\u{2699}\u{FE0F}', // ⚙️
  'devops-cloud': '\u{2601}\u{FE0F}', // ☁️
  'dev-life': '\u{1F4DD}', // 📝
  algorithms: '\u{1F9E9}', // 🧩
  uncategorized: '\u{1F4C1}', // 📁
}

interface KBSidebarProps {
  activeSlug?: string
}

export default function KBSidebar({ activeSlug }: KBSidebarProps) {
  const { topics, postIndex } = kbData
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(() => {
    // Auto-expand the topic containing the active note
    if (activeSlug) {
      const activePost = postIndex.find((p: any) => p.slug === activeSlug)
      if (activePost) return new Set([activePost.topic])
    }
    return new Set(topics.map((t: any) => t.id))
  })

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }

  const getNotesForTopic = (topicId: string) =>
    postIndex
      .filter((p: any) => p.topic === topicId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex h-full flex-col text-xs" style={{ color: 'var(--kb-text)' }}>
      {/* Section Label */}
      <div
        className="flex h-8 items-center px-3 text-[10px] font-semibold tracking-wider uppercase"
        style={{ color: 'var(--kb-text-muted)' }}
      >
        Explorer
      </div>

      {/* Topic Tree */}
      <nav className="flex-1 overflow-y-auto">
        {topics.map((topic: any) => {
          const isExpanded = expandedTopics.has(topic.id)
          const notes = getNotesForTopic(topic.id)
          return (
            <div key={topic.id}>
              <button
                onClick={() => toggleTopic(topic.id)}
                className="flex w-full items-center gap-1 px-2 py-1 text-left transition-colors hover:bg-[var(--kb-accent-dim)]"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className={`shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                >
                  <path d="M6 4l4 4-4 4" />
                </svg>
                <span className="shrink-0">{TOPIC_ICON[topic.id] || '\u{1F4C1}'}</span>
                <span className="truncate font-medium" style={{ color: 'var(--kb-text-strong)' }}>
                  {topic.label}
                </span>
                <span
                  className="ml-auto shrink-0 tabular-nums"
                  style={{ color: 'var(--kb-text-muted)' }}
                >
                  {topic.count}
                </span>
              </button>
              {isExpanded && (
                <div className="ml-3">
                  {notes.map((note: any) => {
                    const isActive = note.slug === activeSlug
                    return (
                      <Link
                        key={note.slug}
                        href={`/kb/${note.slug}`}
                        className={`flex items-center gap-1.5 py-0.5 pr-2 pl-3 transition-colors ${
                          isActive
                            ? 'bg-[var(--kb-accent-dim)] text-[var(--kb-accent)]'
                            : 'hover:bg-[var(--kb-accent-dim)]'
                        }`}
                        title={note.title}
                      >
                        <span className="shrink-0 text-[10px]">
                          {STAGE_ICON[note.stage] || '\u{1F33F}'}
                        </span>
                        <span className="truncate">{note.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Stats Footer */}
      <div
        className="flex items-center gap-2 border-t px-3 py-2 text-[10px]"
        style={{
          borderColor: 'var(--kb-border)',
          color: 'var(--kb-text-muted)',
        }}
      >
        <span>{postIndex.length} notes</span>
        <span>&middot;</span>
        <span>{topics.length} topics</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Integrate sidebar into /kb page and verify**

Update `app/kb/page.tsx` to use the real sidebar. Verify topic tree renders with collapsible sections.

- [ ] **Step 3: Commit**

```bash
git add components/kb/KBSidebar.tsx app/kb/page.tsx
git commit -m "feat(kb): add topic tree sidebar with collapsible sections and stage indicators"
```

---

### Task 6: KB Dashboard — Main Content Area

**Files:**

- Create: `components/kb/KBNoteList.tsx`
- Modify: `app/kb/page.tsx`

- [ ] **Step 1: Create the note list component for the dashboard**

```tsx
// components/kb/KBNoteList.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from '@/components/Link'
import kbData from 'app/kb-data.json'

const STAGE_ICON: Record<string, string> = {
  seedling: '\u{1F331}',
  budding: '\u{1F33F}',
  evergreen: '\u{1F333}',
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return '1d ago'
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export default function KBNoteList() {
  const { postIndex, topics, backlinks } = kbData
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'connections'>('date')

  const filteredNotes = useMemo(() => {
    let notes = activeTopic ? postIndex.filter((p: any) => p.topic === activeTopic) : [...postIndex]

    if (sortBy === 'date') {
      notes.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else {
      notes.sort(
        (a: any, b: any) =>
          ((backlinks as any)[b.slug]?.length || 0) - ((backlinks as any)[a.slug]?.length || 0)
      )
    }
    return notes
  }, [activeTopic, sortBy, postIndex, backlinks])

  return (
    <div className="flex h-full flex-col" style={{ color: 'var(--kb-text)' }}>
      {/* Header */}
      <div
        className="shrink-0 px-6 pt-6 pb-4"
        style={{ borderBottom: '1px solid var(--kb-border)' }}
      >
        <h1
          className="mb-4 font-serif text-2xl font-normal tracking-tight"
          style={{ color: 'var(--kb-text-strong)', fontFamily: 'var(--font-family-serif)' }}
        >
          Knowledge Base
        </h1>

        {/* Topic Filter Chips */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTopic(null)}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              activeTopic === null
                ? 'bg-[var(--kb-accent)] text-black'
                : 'bg-[var(--kb-surface-alt)] hover:bg-[var(--kb-accent-dim)]'
            }`}
          >
            All ({postIndex.length})
          </button>
          {topics.map((t: any) => (
            <button
              key={t.id}
              onClick={() => setActiveTopic(t.id === activeTopic ? null : t.id)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                activeTopic === t.id
                  ? 'bg-[var(--kb-accent)] text-black'
                  : 'bg-[var(--kb-surface-alt)] hover:bg-[var(--kb-accent-dim)]'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div
          className="flex items-center gap-3 text-[11px]"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          <span>Sort:</span>
          <button
            onClick={() => setSortBy('date')}
            className={
              sortBy === 'date' ? 'text-[var(--kb-accent)]' : 'hover:text-[var(--kb-text)]'
            }
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('connections')}
            className={
              sortBy === 'connections' ? 'text-[var(--kb-accent)]' : 'hover:text-[var(--kb-text)]'
            }
          >
            Most Connected
          </button>
          <span className="ml-auto">{filteredNotes.length} notes</span>
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.map((note: any) => {
          const backlinkCount = (backlinks as any)[note.slug]?.length || 0
          return (
            <Link
              key={note.slug}
              href={`/kb/${note.slug}`}
              className="group flex items-start gap-3 border-b px-6 py-3 transition-colors hover:bg-[var(--kb-accent-dim)]"
              style={{ borderColor: 'var(--kb-border)' }}
            >
              <span className="mt-0.5 shrink-0 text-sm">
                {STAGE_ICON[note.stage] || '\u{1F33F}'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className="truncate font-medium group-hover:text-[var(--kb-accent)]"
                    style={{ color: 'var(--kb-text-strong)' }}
                  >
                    {note.title}
                  </span>
                </div>
                {note.summary && (
                  <p
                    className="mt-0.5 line-clamp-1 text-[11px]"
                    style={{ color: 'var(--kb-text-muted)' }}
                  >
                    {note.summary}
                  </p>
                )}
                <div
                  className="mt-1 flex items-center gap-2 text-[10px]"
                  style={{ color: 'var(--kb-text-muted)' }}
                >
                  <span>{relativeDate(note.date)}</span>
                  {backlinkCount > 0 && (
                    <>
                      <span>&middot;</span>
                      <span>
                        {backlinkCount} backlink{backlinkCount > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                  {note.tags?.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded px-1 py-px"
                      style={{ background: 'var(--kb-surface-alt)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire the dashboard page together**

Update `app/kb/page.tsx`:

```tsx
import KBShell from '@/components/kb/KBShell'
import KBSidebar from '@/components/kb/KBSidebar'
import KBNoteList from '@/components/kb/KBNoteList'
import kbData from 'app/kb-data.json'

export default function KBPage() {
  const { postIndex, topics } = kbData
  return (
    <div className="kb-breakout">
      <KBShell
        sidebar={<KBSidebar />}
        main={<KBNoteList />}
        statusBar={
          <div className="flex w-full items-center gap-4">
            <span style={{ color: 'var(--kb-accent)' }}>&#9679; KB</span>
            <span>{postIndex.length} notes</span>
            <span>&middot;</span>
            <span>{topics.length} topics</span>
            <span className="ml-auto">Cmd+K to search</span>
          </div>
        }
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify dashboard renders — dev server**

Run dev server, navigate to `/kb`. Verify:

- Topic tree in sidebar with correct note counts
- Note list in main area with topic filter chips
- Sort by Recent / Most Connected works
- Status bar shows stats
- Clicking a note navigates (will 404 until Task 7)

- [ ] **Step 4: Commit**

```bash
git add components/kb/KBNoteList.tsx app/kb/page.tsx
git commit -m "feat(kb): add dashboard with filterable note list, topic chips, and sort controls"
```

---

### Task 7: KB Note View (`/kb/[slug]`)

**Files:**

- Create: `app/kb/[slug]/page.tsx`
- Create: `components/kb/KBContextPanel.tsx`

- [ ] **Step 1: Create the context panel (backlinks, related, TOC)**

```tsx
// components/kb/KBContextPanel.tsx
'use client'

import Link from '@/components/Link'
import kbData from 'app/kb-data.json'

interface KBContextPanelProps {
  slug: string
  toc?: { value: string; url: string; depth: number }[]
}

export default function KBContextPanel({ slug, toc }: KBContextPanelProps) {
  const { backlinks, postIndex, forwardLinks } = kbData
  const noteBacklinks = (backlinks as any)[slug] || []
  const noteForwardLinks = ((forwardLinks as any)[slug] || [])
    .map((s: string) => postIndex.find((p: any) => p.slug === s))
    .filter(Boolean)

  return (
    <div className="flex h-full flex-col text-xs" style={{ color: 'var(--kb-text)' }}>
      {/* TOC */}
      {toc && toc.length > 0 && (
        <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
          <h3
            className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
            style={{ color: 'var(--kb-text-muted)' }}
          >
            Outline
          </h3>
          <nav className="space-y-0.5">
            {toc.map((item) => (
              <a
                key={item.url}
                href={item.url}
                className="block truncate py-0.5 transition-colors hover:text-[var(--kb-accent)]"
                style={{ paddingLeft: `${(item.depth - 1) * 12}px` }}
              >
                {item.value}
              </a>
            ))}
          </nav>
        </section>
      )}

      {/* Backlinks */}
      <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
        <h3
          className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          Backlinks ({noteBacklinks.length})
        </h3>
        {noteBacklinks.length === 0 ? (
          <p className="italic" style={{ color: 'var(--kb-text-muted)' }}>
            No notes link here yet.
          </p>
        ) : (
          <div className="space-y-1">
            {noteBacklinks.map((bl: any) => (
              <Link
                key={bl.slug}
                href={`/kb/${bl.slug}`}
                className="block rounded px-1.5 py-1 transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
              >
                <span className="font-medium">{bl.title}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Forward Links */}
      {noteForwardLinks.length > 0 && (
        <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
          <h3
            className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
            style={{ color: 'var(--kb-text-muted)' }}
          >
            Links To ({noteForwardLinks.length})
          </h3>
          <div className="space-y-1">
            {noteForwardLinks.map((note: any) => (
              <Link
                key={note.slug}
                href={`/kb/${note.slug}`}
                className="block rounded px-1.5 py-1 transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
              >
                <span className="font-medium">{note.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Note Metadata */}
      <section className="px-3 py-3">
        <h3
          className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          Properties
        </h3>
        {(() => {
          const note = postIndex.find((p: any) => p.slug === slug)
          if (!note) return null
          return (
            <div className="space-y-1.5" style={{ color: 'var(--kb-text-muted)' }}>
              <div className="flex justify-between">
                <span>Topic</span>
                <span style={{ color: 'var(--kb-text)' }}>{(note as any).topic}</span>
              </div>
              <div className="flex justify-between">
                <span>Stage</span>
                <span style={{ color: 'var(--kb-text)' }}>{(note as any).stage}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span style={{ color: 'var(--kb-text)' }}>
                  {new Date((note as any).date).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tags</span>
                <span style={{ color: 'var(--kb-text)' }}>
                  {(note as any).tags?.join(', ') || 'none'}
                </span>
              </div>
            </div>
          )
        })()}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Create the KB note page with IDE layout**

```tsx
// app/kb/[slug]/page.tsx
import { allBlogs, allAuthors } from '.contentlayer/generated'
import type { Blog, Authors } from '.contentlayer/generated'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import KBShell from '@/components/kb/KBShell'
import KBSidebar from '@/components/kb/KBSidebar'
import KBContextPanel from '@/components/kb/KBContextPanel'
import kbData from 'app/kb-data.json'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const post = allBlogs.find((p) => p.slug === slug)
  if (!post) return

  return {
    title: `${post.title} — KB`,
    description: post.summary,
  }
}

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({
    slug: p.slug,
  }))
}

export default async function KBNotePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const post = allBlogs.find((p) => p.slug === slug) as Blog
  if (!post) return notFound()

  const mainContent = coreContent(post)
  const noteInfo = kbData.postIndex.find((p: any) => p.slug === slug)

  // Find prev/next within same topic
  const sortedPosts = allCoreContent(sortPosts(allBlogs))
  const topicNotes = sortedPosts.filter(
    (p: any) => kbData.postIndex.find((n: any) => n.slug === p.slug)?.topic === noteInfo?.topic
  )
  const currentIdx = topicNotes.findIndex((p: any) => p.slug === slug)
  const prev = topicNotes[currentIdx + 1]
  const next = topicNotes[currentIdx - 1]

  const readingTime = (post as any).readingTime

  return (
    <div className="kb-breakout">
      <KBShell
        sidebar={<KBSidebar activeSlug={slug} />}
        main={
          <article className="mx-auto max-w-3xl px-8 py-8">
            {/* Note Header */}
            <header className="mb-8">
              <h1
                className="mb-3 text-3xl leading-tight font-normal tracking-tight"
                style={{
                  color: 'var(--kb-text-strong)',
                  fontFamily: 'var(--font-family-serif)',
                }}
              >
                {mainContent.title}
              </h1>
              <div
                className="flex flex-wrap items-center gap-3 font-mono text-xs"
                style={{ color: 'var(--kb-text-muted)' }}
              >
                <time dateTime={mainContent.date}>
                  {new Date(mainContent.date).toLocaleDateString('ko-KR')}
                </time>
                {readingTime && (
                  <>
                    <span>&middot;</span>
                    <span>{readingTime.text}</span>
                  </>
                )}
                {noteInfo && (
                  <>
                    <span>&middot;</span>
                    <span style={{ color: 'var(--kb-accent)' }}>{(noteInfo as any).topic}</span>
                  </>
                )}
              </div>
            </header>

            {/* Note Content */}
            <div className="prose dark:prose-invert max-w-none">
              <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
            </div>

            {/* Prev/Next in topic */}
            {(prev || next) && (
              <nav
                className="mt-12 flex justify-between border-t pt-6 font-mono text-xs"
                style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}
              >
                {prev ? (
                  <a href={`/kb/${prev.slug}`} className="hover:text-[var(--kb-accent)]">
                    &larr; {prev.title}
                  </a>
                ) : (
                  <span />
                )}
                {next ? (
                  <a href={`/kb/${next.slug}`} className="hover:text-[var(--kb-accent)]">
                    {next.title} &rarr;
                  </a>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </article>
        }
        context={<KBContextPanel slug={slug} toc={post.toc as any} />}
        statusBar={
          <div className="flex w-full items-center gap-4">
            <span style={{ color: 'var(--kb-accent)' }}>&#9679; KB</span>
            <span>{noteInfo?.topic || 'uncategorized'}</span>
            <span>&middot;</span>
            <span>{slug}</span>
            {readingTime && (
              <>
                <span className="ml-auto">{readingTime.text}</span>
              </>
            )}
          </div>
        }
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify note view renders with full 3-panel layout**

Navigate to `/kb/2026-03-15-ollama-architecture`. Verify:

- Sidebar shows topic tree with this note highlighted
- Main area shows note content with Instrument Serif title
- Context panel shows TOC, backlinks section, properties
- Status bar shows topic and slug
- Prev/next within same topic works

- [ ] **Step 4: Commit**

```bash
git add app/kb/[slug]/page.tsx components/kb/KBContextPanel.tsx
git commit -m "feat(kb): add note detail view with context panel, TOC, backlinks, and topic navigation"
```

---

### Task 8: Navigation — Add KB to Header

**Files:**

- Modify: `data/headerNavLinks.ts`

- [ ] **Step 1: Add Knowledge Base to nav links**

```ts
const headerNavLinks = [
  { href: '/', title: 'Home' },
  { href: '/posts', title: 'Posts' },
  { href: '/kb', title: 'KB' },
  { href: '/projects', title: 'Projects' },
  { href: '/about', title: 'About' },
]

export default headerNavLinks
```

- [ ] **Step 2: Verify navigation appears in header and mobile nav**

Check desktop header shows "KB" link. Check mobile hamburger menu includes "KB".

- [ ] **Step 3: Commit**

```bash
git add data/headerNavLinks.ts
git commit -m "feat(kb): add Knowledge Base link to site navigation"
```

---

### Task 9: `/notes/[slug]` Alias Route

**Files:**

- Create: `app/notes/[slug]/page.tsx`

Since the project uses `output: 'export'` (static export), `next.config.js` rewrites don't work at runtime. Instead, create an actual page that renders the same content as `/posts`.

- [ ] **Step 1: Create notes alias page that redirects client-side to /kb/[slug]**

```tsx
// app/notes/[slug]/page.tsx
import { allBlogs } from '.contentlayer/generated'
import { redirect } from 'next/navigation'

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({
    slug: p.slug,
  }))
}

export default async function NotesRedirect(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  redirect(`/kb/${decodeURI(params.slug)}`)
}
```

- [ ] **Step 2: Verify `/notes/ollama-architecture` redirects to `/kb/ollama-architecture`**

- [ ] **Step 3: Commit**

```bash
git add app/notes/[slug]/page.tsx
git commit -m "feat(kb): add /notes/[slug] alias that redirects to /kb/[slug]"
```

---

### Task 10: Visual Polish & Mobile Fallback

**Files:**

- Modify: `components/kb/KBShell.tsx` (responsive behavior)
- Modify: `css/tailwind.css` (KB prose overrides)

- [ ] **Step 1: Add responsive behavior to KBShell**

On mobile (< 768px), sidebar and context panel should be hidden by default, accessible via toggle buttons. The toolbar should become more compact.

In `KBShell.tsx`, add media-query-aware initial state:

```tsx
// Replace the useState defaults:
const [sidebarOpen, setSidebarOpen] = useState(false)
const [contextOpen, setContextOpen] = useState(false)

// Add useEffect to set defaults based on screen width:
useEffect(() => {
  const isDesktop = window.matchMedia('(min-width: 768px)').matches
  setSidebarOpen(isDesktop)
  setContextOpen(isDesktop)
}, [])
```

Add `md:w-60` / `md:w-64` responsive widths. On mobile, panels should be absolutely positioned overlays.

- [ ] **Step 2: Override prose styles for KB context**

Add to `css/tailwind.css`:

```css
/* KB Prose Overrides */
.kb-theme .prose {
  color: var(--kb-text);
}
.kb-theme .prose h1,
.kb-theme .prose h2,
.kb-theme .prose h3,
.kb-theme .prose h4 {
  color: var(--kb-text-strong);
}
.kb-theme .prose a {
  color: var(--kb-accent);
  text-decoration-color: rgba(245, 158, 11, 0.3);
}
.kb-theme .prose a:hover {
  color: var(--kb-accent-strong);
}
.kb-theme .prose strong {
  color: var(--kb-text-strong);
}
.kb-theme .prose code {
  color: var(--kb-accent);
  background: var(--kb-surface-alt);
}
.kb-theme .prose blockquote {
  border-color: var(--kb-accent);
  background: var(--kb-surface);
  color: var(--kb-text);
}
```

- [ ] **Step 3: Verify on mobile viewport and desktop**

Test at 375px width (mobile) and 1440px (desktop). On mobile:

- Panels start hidden
- Toggle buttons show/hide as overlays
- Content is readable

On desktop:

- All three panels visible
- Resizing doesn't break layout

- [ ] **Step 4: Commit**

```bash
git add components/kb/KBShell.tsx css/tailwind.css
git commit -m "feat(kb): add mobile responsive fallback and KB prose theme overrides"
```

---

## Summary

| Task | Component                 | Est. Impact |
| ---- | ------------------------- | ----------- |
| 1    | Fonts + CSS vars          | Foundation  |
| 2    | Contentlayer schema       | Foundation  |
| 3    | KB data generation        | Foundation  |
| 4    | 3-panel layout shell      | Core        |
| 5    | Topic tree sidebar        | Core        |
| 6    | Dashboard note list       | Core        |
| 7    | Note view + context panel | Core        |
| 8    | Navigation                | Glue        |
| 9    | /notes alias              | Glue        |
| 10   | Polish + mobile           | Polish      |

After completion: a fully functional Knowledge IDE at `/kb` with topic navigation, backlinks, context panel, and IDE-like aesthetics. Existing `/posts` and home page remain untouched.
