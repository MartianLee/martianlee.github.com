# Homepage AI Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic homepage with a credible AI-engineering portfolio homepage centered on production experience, an abstract 32x32 constellation thumbnail, and a lightweight knowledge graph preview.

**Architecture:** Keep the homepage as a small set of focused React components under `components/home`. Replace the current animated gradient hero with a static server-rendered hero, add a data-backed KB graph preview using `app/kb-data.json`, and revise the writing sections so the page emphasizes AI infrastructure and LLM research before recent posts.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, Contentlayer/Pliny post data, static SVG, CSS animations with `prefers-reduced-motion`.

---

## Execution Note

Baseline `yarn lint` currently fails before homepage implementation work because repo-wide lint includes generated/cache files such as `.contentlayer`, tracked Yarn release files, and existing files that are out of sync with the current Prettier/Tailwind ordering rules. Do not treat that baseline failure as caused by this feature.

For implementation tasks, verify changed source files with targeted ESLint commands such as:

```bash
yarn eslint app/page.tsx components/home/HeroSection.tsx components/home/HomeConstellationThumbnail.tsx
```

Final verification still includes `yarn build` and Playwright screenshot checks. If repo-wide lint is repaired separately later, this feature should also pass `yarn lint`.

---

## File Structure

- Modify: `app/page.tsx`
  - Owns homepage section order and passes sorted post data to writing sections.
- Replace: `components/home/HeroSection.tsx`
  - Server-rendered hero copy, meta cards, CTAs, and abstract pixel thumbnail.
- Create: `components/home/HomeConstellationThumbnail.tsx`
  - Decorative 32x32 SVG pixel constellation mark. No text inside the SVG.
- Create: `components/home/KnowledgeGraphPreview.tsx`
  - Lightweight homepage preview of KB topics and connections from `app/kb-data.json`.
- Create: `components/home/FeaturedWritingSection.tsx`
  - Highlights AI infrastructure, LLM research, and architecture posts before generic recent posts.
- Modify: `components/home/RecentPostsSection.tsx`
  - Restyle as a quieter dark section and reduce marketing-card feel.
- Modify: `css/tailwind.css`
  - Add scoped keyframes/classes for the KB graph preview, guarded by `prefers-reduced-motion`.

Leave these files in place but remove them from the homepage import path:

- `components/home/FeaturedSection.tsx`
- `components/home/TechStackSection.tsx`
- `components/home/ImpactMetricsSection.tsx`

---

## Task 1: Add Abstract Pixel Thumbnail Component

**Files:**

- Create: `components/home/HomeConstellationThumbnail.tsx`

- [ ] **Step 1: Verify the new component does not exist**

Run:

```bash
test ! -f components/home/HomeConstellationThumbnail.tsx
```

Expected: exit code `0`.

- [ ] **Step 2: Create `HomeConstellationThumbnail.tsx`**

Create the file with this content:

```tsx
interface HomeConstellationThumbnailProps {
  className?: string
}

export default function HomeConstellationThumbnail({
  className = '',
}: HomeConstellationThumbnailProps) {
  return (
    <div
      className={`relative flex aspect-square items-center justify-center border-2 border-cyan-900/70 bg-[#050b17] shadow-[8px_8px_0_#020617] ${className}`}
      aria-hidden="true"
    >
      <svg
        className="h-[min(56vw,14rem)] w-[min(56vw,14rem)] [image-rendering:pixelated]"
        viewBox="0 0 32 32"
        shapeRendering="crispEdges"
        focusable="false"
      >
        <rect width="32" height="32" fill="#071225" />
        <rect x="3" y="3" width="1" height="1" fill="#60a5fa" />
        <rect x="27" y="4" width="1" height="1" fill="#38bdf8" />
        <rect x="6" y="27" width="1" height="1" fill="#a855f7" />
        <rect x="25" y="25" width="1" height="1" fill="#7dd3fc" />
        <rect x="8" y="9" width="2" height="2" fill="#38bdf8" />
        <rect x="20" y="7" width="2" height="2" fill="#d946ef" />
        <rect x="23" y="18" width="2" height="2" fill="#7dd3fc" />
        <rect x="14" y="22" width="2" height="2" fill="#22c55e" />
        <rect x="10" y="16" width="3" height="3" fill="#ecfeff" />
        <rect x="13" y="15" width="5" height="1" fill="#38bdf8" />
        <rect x="18" y="13" width="1" height="2" fill="#38bdf8" />
        <rect x="19" y="11" width="1" height="2" fill="#2563eb" />
        <rect x="20" y="9" width="1" height="2" fill="#2563eb" />
        <rect x="12" y="18" width="1" height="3" fill="#1d4ed8" />
        <rect x="13" y="21" width="1" height="1" fill="#1d4ed8" />
        <rect x="16" y="21" width="2" height="1" fill="#22c55e" />
        <rect x="18" y="20" width="2" height="1" fill="#22c55e" />
        <rect x="20" y="19" width="3" height="1" fill="#38bdf8" />
        <rect x="9" y="11" width="1" height="4" fill="#2563eb" />
        <rect x="10" y="15" width="1" height="1" fill="#2563eb" />
        <rect x="21" y="9" width="1" height="1" fill="#f0abfc" />
        <rect x="24" y="19" width="1" height="1" fill="#ecfeff" />
        <rect x="15" y="23" width="1" height="1" fill="#dcfce7" />
        <rect x="5" y="30" width="22" height="1" fill="#1e3a8a" />
        <rect x="11" y="28" width="10" height="1" fill="#38bdf8" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: Verify the component contains no literal AI labels inside the SVG**

Run:

```bash
rg -n "AI|CLOUD|HTTP|SHIP|code|cloud|ship" components/home/HomeConstellationThumbnail.tsx
```

Expected: no output and exit code `1`.

- [ ] **Step 4: Run lint**

Run:

```bash
yarn lint
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add components/home/HomeConstellationThumbnail.tsx
git commit -m "Add homepage constellation thumbnail"
```

---

## Task 2: Replace Hero With Experience-Led AI Positioning

**Files:**

- Modify: `components/home/HeroSection.tsx`

- [ ] **Step 1: Verify current generic hero copy still exists**

Run:

```bash
rg -n "Hello|Senior Software Engineer|View Projects|building scalable systems" components/home/HeroSection.tsx
```

Expected: matches in `components/home/HeroSection.tsx`.

- [ ] **Step 2: Replace `HeroSection.tsx`**

Replace the entire file with:

```tsx
import Link from '@/components/Link'
import HomeConstellationThumbnail from '@/components/home/HomeConstellationThumbnail'

const metaCards = [
  {
    label: 'Experience',
    value: 'Web, Cloud Infra, Operations',
  },
  {
    label: 'Leadership',
    value: 'Founder / CTO',
  },
  {
    label: 'AI Engineering',
    value: 'Agentic workflows',
  },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#071225] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_32%,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_22%_78%,rgba(168,85,247,0.13),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24 lg:px-8">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.16em] text-cyan-300 uppercase">
            Full-stack engineer / Former CTO / AI Engineering
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl leading-[1.08] font-black tracking-normal text-slate-50 sm:text-6xl lg:text-7xl">
            Production experience,
            <br />
            now at the AI frontier.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Built across consumer apps, climate-tech products, and AI-powered cloud contact centers.
            Now applying that production background to agentic workflows, LLM systems, and AI-native
            product development.
          </p>

          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            {metaCards.map((card) => (
              <div key={card.label} className="border border-cyan-900/70 bg-[#0d1a2c] p-3">
                <div className="font-mono text-[10px] tracking-[0.12em] text-cyan-300 uppercase">
                  {card.label}
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-100">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/kb"
              className="inline-flex items-center justify-center border border-cyan-300 bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Explore Knowledge Base
            </Link>
            <Link
              href="/posts"
              className="inline-flex items-center justify-center border border-cyan-900/80 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:text-white"
            >
              Read Technical Writing
            </Link>
          </div>
        </div>

        <HomeConstellationThumbnail className="mx-auto w-full max-w-[23rem]" />
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify generic hero elements are gone and approved copy exists**

Run:

```bash
rg -n "Hello|Senior Software Engineer|building scalable systems|View Projects" components/home/HeroSection.tsx
```

Expected: no output and exit code `1`.

Run:

```bash
rg -n "Production experience|AI Engineering|Web, Cloud Infra, Operations|Agentic workflows" components/home/HeroSection.tsx
```

Expected: four matches.

- [ ] **Step 4: Run lint**

Run:

```bash
yarn lint
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "Redesign homepage hero positioning"
```

---

## Task 3: Add CSS Motion Utilities For KB Preview

**Files:**

- Modify: `css/tailwind.css`

- [ ] **Step 1: Verify KB preview animation classes do not exist**

Run:

```bash
rg -n "kb-orbit-float|kb-node-pulse|kb-graph-drift" css/tailwind.css
```

Expected: no output and exit code `1`.

- [ ] **Step 2: Append scoped animation utilities**

Append this block after `.animation-delay-4000`:

```css
@keyframes kbGraphDrift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(0, -8px, 0) rotate(1deg);
  }
}

@keyframes kbNodePulse {
  0%,
  100% {
    opacity: 0.75;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.18);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .kb-graph-drift {
    animation: kbGraphDrift 12s ease-in-out infinite;
  }

  .kb-node-pulse {
    animation: kbNodePulse 3.8s ease-in-out infinite;
  }
}
```

- [ ] **Step 3: Verify reduced-motion guard exists**

Run:

```bash
rg -n "prefers-reduced-motion: no-preference|kbGraphDrift|kbNodePulse" css/tailwind.css
```

Expected: matches for the media query and both keyframes.

- [ ] **Step 4: Run lint**

Run:

```bash
yarn lint
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add css/tailwind.css
git commit -m "Add homepage knowledge graph motion utilities"
```

---

## Task 4: Add Knowledge Graph Preview Section

**Files:**

- Create: `components/home/KnowledgeGraphPreview.tsx`

- [ ] **Step 1: Verify the new component does not exist**

Run:

```bash
test ! -f components/home/KnowledgeGraphPreview.tsx
```

Expected: exit code `0`.

- [ ] **Step 2: Create `KnowledgeGraphPreview.tsx`**

Create the file with:

```tsx
import Link from '@/components/Link'
import kbData from 'app/kb-data.json'
import type { KBData } from '@/components/kb/types'

const data = kbData as KBData

const topicIds = ['ai-infrastructure', 'llm-research', 'web-frontend', 'backend', 'devops-cloud']

const nodes = [
  { id: 'center', label: 'KB', x: '48%', y: '48%', size: 'h-4 w-4', color: 'bg-slate-50' },
  {
    id: 'ai-infrastructure',
    label: 'AI Infrastructure',
    x: '27%',
    y: '24%',
    size: 'h-3 w-3',
    color: 'bg-cyan-400',
  },
  {
    id: 'llm-research',
    label: 'LLM Research',
    x: '71%',
    y: '31%',
    size: 'h-3.5 w-3.5',
    color: 'bg-fuchsia-500',
  },
  {
    id: 'web-frontend',
    label: 'Web Frontend',
    x: '22%',
    y: '68%',
    size: 'h-2.5 w-2.5',
    color: 'bg-emerald-400',
  },
  { id: 'backend', label: 'Backend', x: '64%', y: '73%', size: 'h-3 w-3', color: 'bg-sky-300' },
  {
    id: 'devops-cloud',
    label: 'DevOps & Cloud',
    x: '49%',
    y: '14%',
    size: 'h-2 w-2',
    color: 'bg-blue-400',
  },
]

const edges = [
  { x: '49%', y: '50%', width: '30%', rotate: '-142deg' },
  { x: '50%', y: '50%', width: '29%', rotate: '-34deg' },
  { x: '49%', y: '51%', width: '30%', rotate: '137deg' },
  { x: '50%', y: '51%', width: '28%', rotate: '48deg' },
  { x: '50%', y: '49%', width: '34%', rotate: '-88deg' },
]

function getTopicLabel(id: string) {
  return data.topics.find((topic) => topic.id === id)?.label ?? id
}

function getTopicCount(id: string) {
  return data.topics.find((topic) => topic.id === id)?.count ?? 0
}

export default function KnowledgeGraphPreview() {
  const totalNotes = data.postIndex.length
  const totalTopics = data.topics.length

  return (
    <section className="bg-[#050b17] text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-24 lg:px-8">
        <div className="relative aspect-square border border-cyan-900/70 bg-[#071225] shadow-[8px_8px_0_#020617]">
          <div className="kb-graph-drift absolute inset-6">
            <div className="absolute inset-0 rounded-full border border-cyan-300/20" />
            <div className="absolute inset-12 rounded-full border border-cyan-300/20" />
            <div className="absolute inset-24 rounded-full border border-fuchsia-300/10" />

            {edges.map((edge) => (
              <span
                key={`${edge.x}-${edge.y}-${edge.rotate}`}
                className="absolute h-px origin-left bg-cyan-200/30"
                style={{
                  left: edge.x,
                  top: edge.y,
                  width: edge.width,
                  transform: `rotate(${edge.rotate})`,
                }}
              />
            ))}

            {nodes.map((node, index) => (
              <span
                key={node.id}
                className={`kb-node-pulse absolute ${node.size} ${node.color} shadow-[0_0_18px_currentColor]`}
                style={{
                  left: node.x,
                  top: node.y,
                  animationDelay: `${index * 0.28}s`,
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.16em] text-cyan-300 uppercase">
            Knowledgebase graph
          </p>
          <h2 className="mt-4 max-w-2xl text-4xl leading-tight font-black tracking-normal text-slate-50 md:text-5xl">
            A map of what I am studying, building, and connecting.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            The blog is not just chronological writing. AI infrastructure, LLM research, frontend,
            backend, and cloud notes form a navigable graph across {totalNotes} notes and{' '}
            {totalTopics} topics.
          </p>

          <div className="mt-7 space-y-3">
            {topicIds.map((topicId) => (
              <div key={topicId} className="border-l-2 border-cyan-900/80 pl-4">
                <div className="text-sm font-semibold text-slate-100">{getTopicLabel(topicId)}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {getTopicCount(topicId)} connected notes
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/kb"
            className="mt-8 inline-flex border border-cyan-900/80 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:text-white"
          >
            Open Knowledge Base
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify it reads from KB data and links to `/kb`**

Run:

```bash
rg -n "kb-data.json|Open Knowledge Base|Knowledgebase graph|topicIds" components/home/KnowledgeGraphPreview.tsx
```

Expected: matches for all terms.

- [ ] **Step 4: Run lint**

Run:

```bash
yarn lint
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add components/home/KnowledgeGraphPreview.tsx
git commit -m "Add homepage knowledge graph preview"
```

---

## Task 5: Add Featured Writing Section

**Files:**

- Create: `components/home/FeaturedWritingSection.tsx`

- [ ] **Step 1: Verify the new component does not exist**

Run:

```bash
test ! -f components/home/FeaturedWritingSection.tsx
```

Expected: exit code `0`.

- [ ] **Step 2: Create `FeaturedWritingSection.tsx`**

Create the file with:

```tsx
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'
import kbData from 'app/kb-data.json'
import type { KBData } from '@/components/kb/types'

interface FeaturedWritingSectionProps {
  posts: CoreContent<Blog>[]
}

const data = kbData as KBData
const priorityTopics = new Set(['ai-infrastructure', 'llm-research', 'backend-architecture'])

function getPriorityPosts(posts: CoreContent<Blog>[]) {
  const prioritySlugs = new Set(
    data.postIndex.filter((post) => priorityTopics.has(post.topic)).map((post) => post.slug)
  )

  return posts.filter((post) => prioritySlugs.has(post.slug)).slice(0, 4)
}

export default function FeaturedWritingSection({ posts }: FeaturedWritingSectionProps) {
  const featuredPosts = getPriorityPosts(posts)

  return (
    <section className="bg-[#071225] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-cyan-300 uppercase">
              Technical writing
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-slate-50 md:text-4xl">
              Notes from the AI engineering stack.
            </h2>
          </div>
          <Link href="/posts" className="text-sm font-semibold text-cyan-200 hover:text-white">
            View all posts
          </Link>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden border border-cyan-900/70 bg-cyan-900/70 md:grid-cols-2">
          {featuredPosts.map((post) => (
            <article key={post.slug} className="bg-[#0a1426] p-5 transition hover:bg-[#0d1a2c]">
              <time dateTime={post.date} className="font-mono text-xs text-cyan-300">
                {formatDate(post.date, siteMetadata.locale)}
              </time>
              <h3 className="mt-3 text-lg leading-snug font-bold text-slate-50">
                <Link href={`/posts/${post.slug}`} className="hover:text-cyan-200">
                  {post.title}
                </Link>
              </h3>
              {post.summary && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">{post.summary}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags?.slice(0, 3).map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify section prioritizes approved topics**

Run:

```bash
rg -n "ai-infrastructure|llm-research|backend-architecture|Notes from the AI engineering stack" components/home/FeaturedWritingSection.tsx
```

Expected: matches for all terms.

- [ ] **Step 4: Run lint**

Run:

```bash
yarn lint
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add components/home/FeaturedWritingSection.tsx
git commit -m "Add featured AI writing section"
```

---

## Task 6: Wire Homepage Section Order

**Files:**

- Modify: `app/page.tsx`

- [ ] **Step 1: Verify old homepage imports are still wired**

Run:

```bash
rg -n "FeaturedSection|TechStackSection|ImpactMetricsSection" app/page.tsx
```

Expected: matches.

- [ ] **Step 2: Update `app/page.tsx`**

Replace with:

```tsx
import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from '.contentlayer/generated'
import HeroSection from '@/components/home/HeroSection'
import KnowledgeGraphPreview from '@/components/home/KnowledgeGraphPreview'
import FeaturedWritingSection from '@/components/home/FeaturedWritingSection'
import RecentPostsSection from '@/components/home/RecentPostsSection'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)

  return (
    <>
      <HeroSection />
      <KnowledgeGraphPreview />
      <FeaturedWritingSection posts={posts} />
      <RecentPostsSection posts={posts} />
    </>
  )
}
```

- [ ] **Step 3: Verify old generic sections are removed from homepage path**

Run:

```bash
rg -n "FeaturedSection|TechStackSection|ImpactMetricsSection" app/page.tsx
```

Expected: no output and exit code `1`.

Run:

```bash
rg -n "KnowledgeGraphPreview|FeaturedWritingSection|RecentPostsSection" app/page.tsx
```

Expected: matches for all three.

- [ ] **Step 4: Run lint**

Run:

```bash
yarn lint
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "Reorder homepage around AI portfolio narrative"
```

---

## Task 7: Restyle Recent Posts As Quiet Supporting Section

**Files:**

- Modify: `components/home/RecentPostsSection.tsx`

- [ ] **Step 1: Verify current card style still uses marketing gradients and rounded cards**

Run:

```bash
rg -n "rounded-2xl|shadow-2xl|bg-gray-50|Sharing latest development insights" components/home/RecentPostsSection.tsx
```

Expected: matches.

- [ ] **Step 2: Replace `RecentPostsSection.tsx`**

Replace the file with:

```tsx
'use client'

import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'

interface RecentPostsSectionProps {
  posts: CoreContent<Blog>[]
}

export default function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  const recentPosts = posts.slice(0, 5)

  return (
    <section className="bg-[#050b17] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="flex flex-col gap-4 border-t border-cyan-900/70 pt-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-cyan-300 uppercase">
              Latest notes
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-slate-50 md:text-4xl">
              Recent writing.
            </h2>
          </div>
          <Link href="/posts" className="text-sm font-semibold text-cyan-200 hover:text-white">
            View all posts
          </Link>
        </div>

        <div className="mt-8 divide-y divide-cyan-900/70 border-y border-cyan-900/70">
          {recentPosts.map((post) => (
            <article key={post.slug} className="grid gap-4 py-5 md:grid-cols-[11rem_1fr]">
              <time dateTime={post.date} className="font-mono text-xs text-slate-500">
                {formatDate(post.date, siteMetadata.locale)}
              </time>
              <div>
                <h3 className="text-lg leading-snug font-bold text-slate-50">
                  <Link href={`/posts/${post.slug}`} className="hover:text-cyan-200">
                    {post.title}
                  </Link>
                </h3>
                {post.summary && (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                    {post.summary}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags?.slice(0, 3).map((tag) => (
                    <Tag key={tag} text={tag} />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify noisy card styling is gone**

Run:

```bash
rg -n "rounded-2xl|shadow-2xl|bg-gray-50|Sharing latest development insights" components/home/RecentPostsSection.tsx
```

Expected: no output and exit code `1`.

- [ ] **Step 4: Run lint**

Run:

```bash
yarn lint
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add components/home/RecentPostsSection.tsx
git commit -m "Restyle recent posts for homepage redesign"
```

---

## Task 8: Build And Visual Verification

**Files:**

- No planned source edits unless verification finds layout bugs.

- [ ] **Step 1: Run production build**

Run:

```bash
yarn build
```

Expected: exit code `0`.

- [ ] **Step 2: Start local dev server**

Run:

```bash
yarn dev
```

Expected: server available at `http://localhost:3456`.

- [ ] **Step 3: Capture desktop and mobile screenshots with Playwright**

Run in a separate shell while the dev server is running:

```bash
node - <<'NODE'
const { chromium } = require('playwright')

async function capture() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await page.goto('http://localhost:3456', { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'homepage-redesign-desktop.png', fullPage: true })

  await page.setViewportSize({ width: 390, height: 1200 })
  await page.goto('http://localhost:3456', { waitUntil: 'networkidle' })
  await page.screenshot({ path: 'homepage-redesign-mobile.png', fullPage: true })

  await browser.close()
}

capture().catch((error) => {
  console.error(error)
  process.exit(1)
})
NODE
```

Expected: exit code `0`, screenshots created:

- `homepage-redesign-desktop.png`
- `homepage-redesign-mobile.png`

- [ ] **Step 4: Verify page contains approved copy**

Run:

```bash
node - <<'NODE'
const { chromium } = require('playwright')

async function verify() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:3456', { waitUntil: 'networkidle' })
  for (const text of [
    'Production experience,',
    'now at the AI frontier.',
    'Web, Cloud Infra, Operations',
    'Agentic workflows',
    'A map of what I am studying, building, and connecting.',
  ]) {
    await page.getByText(text, { exact: false }).first().waitFor({ timeout: 5000 })
  }
  await browser.close()
}

verify().catch((error) => {
  console.error(error)
  process.exit(1)
})
NODE
```

Expected: exit code `0`.

- [ ] **Step 5: Verify reduced motion disables custom animation**

Run:

```bash
node - <<'NODE'
const { chromium } = require('playwright')

async function verifyReducedMotion() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('http://localhost:3456', { waitUntil: 'networkidle' })
  const animationName = await page.locator('.kb-graph-drift').evaluate((element) => {
    return window.getComputedStyle(element).animationName
  })
  if (animationName !== 'none') {
    throw new Error(`Expected no animation in reduced motion, got ${animationName}`)
  }
  await browser.close()
}

verifyReducedMotion().catch((error) => {
  console.error(error)
  process.exit(1)
})
NODE
```

Expected: exit code `0`.

- [ ] **Step 6: Review screenshots**

Open `homepage-redesign-desktop.png` and `homepage-redesign-mobile.png`.

Confirm:

- Hero text does not overlap the thumbnail.
- Meta card text stays inside each card.
- Pixel thumbnail is abstract, not character-like.
- KB graph is visible and not blank.
- Mobile layout stacks cleanly without horizontal scrolling.

- [ ] **Step 7: Commit verification artifacts only if intentionally kept**

By default, do not commit screenshots.

Run:

```bash
rm -f homepage-redesign-desktop.png homepage-redesign-mobile.png
git status --short
```

Expected: no screenshot files remain.

If source fixes were needed during verification, commit only those source files:

```bash
git add app/page.tsx components/home css/tailwind.css
git commit -m "Polish homepage redesign responsive layout"
```

---

## Task 9: Final Quality Gate

**Files:**

- No source edits unless the gate finds issues.

- [ ] **Step 1: Run final lint**

Run:

```bash
yarn lint
```

Expected: exit code `0`.

- [ ] **Step 2: Run final build**

Run:

```bash
yarn build
```

Expected: exit code `0`.

- [ ] **Step 3: Verify homepage no longer imports removed generic sections**

Run:

```bash
rg -n "FeaturedSection|TechStackSection|ImpactMetricsSection" app/page.tsx
```

Expected: no output and exit code `1`.

- [ ] **Step 4: Verify approved terms are present**

Run:

```bash
rg -n "Production experience|Web, Cloud Infra, Operations|AI Engineering|Agentic workflows|Knowledgebase graph" components/home app/page.tsx
```

Expected: matches in `components/home/HeroSection.tsx` and `components/home/KnowledgeGraphPreview.tsx`.

- [ ] **Step 5: Inspect final diff**

Run:

```bash
git diff --stat HEAD
git diff -- app/page.tsx components/home css/tailwind.css
```

Expected: diff only contains homepage redesign work.

- [ ] **Step 6: Commit any final changes**

If Step 5 shows uncommitted source changes:

```bash
git add app/page.tsx components/home css/tailwind.css
git commit -m "Complete homepage AI portfolio redesign"
```

If there are no uncommitted source changes, skip this step.
