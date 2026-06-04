# i18n Framework (Bilingual Posts) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make blog posts bilingual — English canonical at `/posts/<slug>`, Korean at `/ko/posts/<slug>` — with a header EN/KO reading-preference toggle, while the site never breaks before posts are translated.

**Architecture:** Language is inferred from filename (`<slug>.en.mdx` = English, `<slug>.mdx` = Korean) via a contentlayer `language` computed field; `slug`/`path` strip the `.en` so both versions share one clean slug. A `canonicalBlogs()` helper dedupes to one (English-preferred) doc per slug for all listings. Two thin route trees (`/posts`, `/ko/posts`) render a shared `PostView`. A client `LanguageProvider` (localStorage) drives a `PostLink` so post links resolve to the preferred language.

**Tech Stack:** Next.js 16 (static `output: 'export'`) · contentlayer2 · React client context · next/navigation.

**Spec:** `docs/superpowers/specs/2026-06-04-i18n-framework-design.md`

**Branch:** `i18n/framework` (already created; spec committed).

---

## Conventions

- **Verification is build-based, not `next dev`.** `next dev` (turbopack) is unstable on this repo (`RangeError: Map maximum size exceeded`). Per task run `yarn lint && npx tsc --noEmit`; per phase run `yarn build`; for rendered checks, serve the static export: `python3 -m http.server 8898 --directory out` and `curl`/grep the generated HTML.
- **Git:** the working tree has unrelated pre-existing changes (`app/kb-data.json`, untracked drafts/PNGs). **Never `git add -A` / `git commit -am`.** Stage only the files each task touches. End every commit body with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- **Do NOT touch `/notes` (KB).**
- **No `.en.mdx` files are created by this plan** — translation is the separate follow-up. The framework must build & behave correctly with zero English files (everything stays Korean, toggle inert), and correctly once an English file appears (verified with a temporary sample in Task 11).

---

## File Structure

**Created**

- `lib/posts.ts` — `canonicalBlogs()`, `postBySlug(slug, language?)`, `hasBothLanguages(slug)`.
- `components/LanguageProvider.tsx` — client context (`lang` in localStorage, default `en`) + `useLanguage()`.
- `components/PostLink.tsx` — client; resolves a post href from the preference.
- `components/PostView.tsx` — server; shared post rendering (jsonLd + layout + MDX), used by both routes.
- `app/ko/posts/[...slug]/page.tsx` — Korean route.

**Modified**

- `contentlayer.config.ts` — `language` computed field; `slug`/`path`/`structuredData` strip `.en`; dedupe tag-count & search-index to canonical.
- `app/posts/[...slug]/page.tsx` — canonical (EN) route via `PostView`; deduped `generateStaticParams`; hreflang.
- `app/theme-providers.tsx` — wrap children in `LanguageProvider`.
- `components/LanguageToggle.tsx` — wire to the provider + pathname-based switch.
- `components/Header.tsx` / `components/MobileNav.tsx` — no change needed (already render `LanguageToggle`); verify only.
- `components/home/WritingSection.tsx`, `layouts/ListLayoutWithTags.tsx`, `layouts/PostLayout.tsx` — post links via `PostLink`.
- `app/page.tsx`, `app/posts/page.tsx` (+ pagination), `app/tags/[tag]/page.tsx` — list from `canonicalBlogs()`.
- `app/sitemap.ts` — add `/ko/posts/<slug>` entries.

---

# Phase A — Content model

### Task 1: contentlayer `language` field + strip `.en` from slug/path/structuredData

**Files:** Modify `contentlayer.config.ts`.

- [ ] **Step 1 — In `computedFields`, add `language` and update `slug`/`path`:**

```ts
const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  language: {
    type: 'string',
    resolve: (doc) => (/\.en\.mdx$/.test(doc._raw.sourceFileName) ? 'en' : 'ko'),
  },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, '').replace(/\.en$/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/\.en$/, ''),
  },
  filePath: { type: 'string', resolve: (doc) => doc._raw.sourceFilePath },
  toc: { type: 'string', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}
```

- [ ] **Step 2 — Fix the Blog `structuredData` url** so it never contains `.en` (use the stripped path). In the `Blog` document's `structuredData.resolve`, change the `url` line to:

```ts
url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath.replace(/\.en$/, '')}`,
```

- [ ] **Step 3 — Dedupe tag count to canonical (English-preferred).** Replace `createTagCount` body's loop source so each post is counted once. At the top of `createTagCount(allBlogs)`:

```ts
function createTagCount(allBlogs) {
  const tagCount: Record<string, number> = {}
  const bySlug = new Map<string, (typeof allBlogs)[number]>()
  for (const p of allBlogs) {
    const existing = bySlug.get(p.slug)
    if (!existing || p.language === 'en') bySlug.set(p.slug, p)
  }
  const canonical = [...bySlug.values()]
  canonical.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag: string) => {
        const formattedTag = slug(tag)
        tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1
      })
    }
  })
  writeFileSync('./app/tag-data.json', JSON.stringify(tagCount))
}
```

- [ ] **Step 4 — Dedupe the search index to canonical.** In `createSearchIndex`, dedupe before writing:

```ts
function createSearchIndex(allBlogs) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    const bySlug = new Map<string, (typeof allBlogs)[number]>()
    for (const p of allBlogs) {
      const existing = bySlug.get(p.slug)
      if (!existing || p.language === 'en') bySlug.set(p.slug, p)
    }
    writeFileSync(
      `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
      JSON.stringify(allCoreContent(sortPosts([...bySlug.values()])))
    )
    console.log('Local search index generated...')
  }
}
```

- [ ] **Step 5 — Verify:** `yarn build`. Expected: builds; `app/tag-data.json` and `public/search.json` counts unchanged from before (no `.en.mdx` exists yet, so canonical == all). `grep -c '"language"' .contentlayer/generated/Blog/_index.json` is not required; just confirm build success.

- [ ] **Step 6 — Commit:** `git add contentlayer.config.ts && git commit -m "feat(i18n): language field; strip .en from slug/path; dedupe tag/search to canonical" -m "<trailer>"`

---

### Task 2: `lib/posts.ts` canonical helpers

**Files:** Create `lib/posts.ts`.

- [ ] **Step 1:**

```ts
import { allBlogs } from '.contentlayer/generated'
import type { Blog } from '.contentlayer/generated'
import { sortPosts } from 'pliny/utils/contentlayer'

/** One doc per slug, English preferred, sorted newest-first. */
export function canonicalBlogs(): Blog[] {
  const bySlug = new Map<string, Blog>()
  for (const p of allBlogs) {
    const existing = bySlug.get(p.slug)
    if (!existing || p.language === 'en') bySlug.set(p.slug, p)
  }
  return sortPosts([...bySlug.values()]) as Blog[]
}

/** A specific language version, or the canonical (English-preferred) when language omitted. */
export function postBySlug(slug: string, language?: 'en' | 'ko'): Blog | undefined {
  if (language) return allBlogs.find((p) => p.slug === slug && p.language === language)
  return (
    allBlogs.find((p) => p.slug === slug && p.language === 'en') ||
    allBlogs.find((p) => p.slug === slug)
  )
}

/** True when both an English and a Korean version exist for the slug. */
export function hasBothLanguages(slug: string): boolean {
  return (
    allBlogs.some((p) => p.slug === slug && p.language === 'en') &&
    allBlogs.some((p) => p.slug === slug && p.language === 'ko')
  )
}
```

- [ ] **Step 2 — Verify:** `npx tsc --noEmit`.
- [ ] **Step 3 — Commit:** `git add lib/posts.ts && git commit -m "feat(i18n): canonical post helpers" -m "<trailer>"`

- [ ] **Phase A gate:** `yarn build` passes.

---

# Phase B — Routing

### Task 3: Extract `PostView` (shared post renderer)

**Files:** Create `components/PostView.tsx`. (Pulls the render logic out of the current `app/posts/[...slug]/page.tsx` so both routes share it.)

- [ ] **Step 1:**

```tsx
import { coreContent } from 'pliny/utils/contentlayer'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import { allAuthors } from '.contentlayer/generated'
import type { Authors, Blog } from '.contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import type { CoreContent } from 'pliny/utils/contentlayer'

const layouts = { PostSimple, PostLayout, PostBanner }
const defaultLayout = 'PostLayout'

export default function PostView({
  post,
  prev,
  next,
}: {
  post: Blog
  prev?: CoreContent<Blog>
  next?: CoreContent<Blog>
}) {
  const authorList = post.authors || ['default']
  const authorDetails = authorList.map((a) =>
    coreContent(allAuthors.find((p) => p.slug === a) as Authors)
  )
  const mainContent = coreContent(post)
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((a) => ({ '@type': 'Person', name: a.name }))
  const Layout = layouts[post.layout || defaultLayout]
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </>
  )
}
```

- [ ] **Step 2 — Verify:** `npx tsc --noEmit`.
- [ ] **Step 3 — Commit:** `git add components/PostView.tsx && git commit -m "feat(i18n): shared PostView renderer" -m "<trailer>"`

---

### Task 4: Rework the canonical (EN) post route

**Files:** Modify `app/posts/[...slug]/page.tsx`.

- [ ] **Step 1 — Replace the file** (dedup params, canonical doc, prev/next from `canonicalBlogs()`, hreflang via metadata):

```tsx
import 'katex/dist/katex.css'
import { allCoreContent } from 'pliny/utils/contentlayer'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { canonicalBlogs, postBySlug, hasBothLanguages } from '@/lib/posts'
import PostView from '@/components/PostView'

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug)
  if (!post) return
  const both = hasBothLanguages(slug)
  return {
    title: post.title,
    description: post.summary,
    keywords: post.tags,
    alternates: both
      ? {
          languages: {
            en: `${siteMetadata.siteUrl}/posts/${slug}`,
            ko: `${siteMetadata.siteUrl}/ko/posts/${slug}`,
            'x-default': `${siteMetadata.siteUrl}/posts/${slug}`,
          },
        }
      : undefined,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: post.language === 'en' ? 'en_US' : 'ko_KR',
      type: 'article',
      url: './',
      images: [siteMetadata.socialBanner],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.summary },
  }
}

export const generateStaticParams = async () =>
  canonicalBlogs().map((p) => ({ slug: p.slug.split('/') }))

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug)
  if (!post) return notFound()
  const list = allCoreContent(canonicalBlogs())
  const i = list.findIndex((p) => p.slug === slug)
  return <PostView post={post} prev={list[i + 1]} next={list[i - 1]} />
}
```

Note: `canonicalBlogs()` is already sorted newest-first, so `list[i+1]` is older (prev) and `list[i-1]` newer (next), matching the prior behavior.

- [ ] **Step 2 — Verify:** `yarn build`; then `python3 -m http.server 8898 --directory out &` and `curl -s localhost:3456 ...` → check a post renders: `grep -o "Semble" out/posts/2026-06-04-semble-architecture.html | head -1`. Kill the server.
- [ ] **Step 3 — Commit:** `git add "app/posts/[...slug]/page.tsx" && git commit -m "feat(i18n): canonical EN post route via PostView" -m "<trailer>"`

---

### Task 5: Korean route

**Files:** Create `app/ko/posts/[...slug]/page.tsx`.

- [ ] **Step 1:**

```tsx
import 'katex/dist/katex.css'
import { allCoreContent } from 'pliny/utils/contentlayer'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { allBlogs } from '.contentlayer/generated'
import { canonicalBlogs, postBySlug, hasBothLanguages } from '@/lib/posts'
import PostView from '@/components/PostView'

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug, 'ko')
  if (!post) return
  const both = hasBothLanguages(slug)
  return {
    title: post.title,
    description: post.summary,
    alternates: both
      ? {
          languages: {
            en: `${siteMetadata.siteUrl}/posts/${slug}`,
            ko: `${siteMetadata.siteUrl}/ko/posts/${slug}`,
            'x-default': `${siteMetadata.siteUrl}/posts/${slug}`,
          },
        }
      : undefined,
  }
}

export const generateStaticParams = async () =>
  allBlogs.filter((p) => p.language === 'ko').map((p) => ({ slug: p.slug.split('/') }))

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArr } = await props.params
  const slug = decodeURI(slugArr.join('/'))
  const post = postBySlug(slug, 'ko')
  if (!post) return notFound()
  const list = allCoreContent(canonicalBlogs())
  const i = list.findIndex((p) => p.slug === slug)
  return <PostView post={post} prev={list[i + 1]} next={list[i - 1]} />
}
```

- [ ] **Step 2 — Verify:** `yarn build`; confirm `out/ko/posts/2026-06-04-semble-architecture.html` exists and contains the Korean title.
- [ ] **Step 3 — Commit:** `git add "app/ko/posts/[...slug]/page.tsx" && git commit -m "feat(i18n): Korean /ko/posts route" -m "<trailer>"`

- [ ] **Phase B gate:** `yarn build` passes; both `/posts/<slug>` and `/ko/posts/<slug>` generate.

---

# Phase C — Reading preference

### Task 6: LanguageProvider

**Files:** Create `components/LanguageProvider.tsx`; modify `app/theme-providers.tsx`.

- [ ] **Step 1 — `components/LanguageProvider.tsx`:**

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Lang = 'en' | 'ko'
const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  useEffect(() => {
    const stored = localStorage.getItem('lang')
    if (stored === 'ko' || stored === 'en') setLangState(stored)
  }, [])
  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l)
    setLangState(l)
  }
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
```

- [ ] **Step 2 — Wrap in `app/theme-providers.tsx`:**

```tsx
'use client'

import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'
import { LanguageProvider } from '@/components/LanguageProvider'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme} enableSystem>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  )
}
```

- [ ] **Step 3 — Verify:** `npx tsc --noEmit`.
- [ ] **Step 4 — Commit:** `git add components/LanguageProvider.tsx app/theme-providers.tsx && git commit -m "feat(i18n): LanguageProvider (localStorage reading preference)" -m "<trailer>"`

---

### Task 7: Wire LanguageToggle

**Files:** Modify `components/LanguageToggle.tsx`.

- [ ] **Step 1 — Replace with the wired toggle** (sets preference; on a post page, navigates to the sibling URL):

```tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  const choose = (l: 'en' | 'ko') => {
    setLang(l)
    if (l === 'ko' && pathname.startsWith('/posts/')) router.push('/ko' + pathname)
    else if (l === 'en' && pathname.startsWith('/ko/posts/'))
      router.push(pathname.replace(/^\/ko/, ''))
  }

  return (
    <div className="font-mono text-xs" aria-label="Reading language">
      <button
        onClick={() => choose('en')}
        className={lang === 'en' ? 'text-ink font-bold' : 'text-muted'}
      >
        EN
      </button>
      <span className="px-1 opacity-40">/</span>
      <button
        onClick={() => choose('ko')}
        className={lang === 'ko' ? 'text-ink font-bold' : 'text-muted'}
      >
        KO
      </button>
    </div>
  )
}
```

- [ ] **Step 2 — Verify:** `npx tsc --noEmit && yarn lint`.
- [ ] **Step 3 — Commit:** `git add components/LanguageToggle.tsx && git commit -m "feat(i18n): wire EN/KO toggle to preference + sibling nav" -m "<trailer>"`

---

### Task 8: PostLink + swap post-link call sites

**Files:** Create `components/PostLink.tsx`; modify `components/home/WritingSection.tsx`, `layouts/ListLayoutWithTags.tsx`, `layouts/PostLayout.tsx`.

- [ ] **Step 1 — `components/PostLink.tsx`:**

```tsx
'use client'

import Link from './Link'
import { useLanguage } from './LanguageProvider'

export default function PostLink({
  slug,
  className,
  children,
  'aria-label': ariaLabel,
}: {
  slug: string
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}) {
  const { lang } = useLanguage()
  const href = lang === 'ko' ? `/ko/posts/${slug}` : `/posts/${slug}`
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}
```

- [ ] **Step 2 — In `components/home/WritingSection.tsx`,** replace each post `<Link href={`/${post.path}`} …>` with `<PostLink slug={post.slug} …>` (import `PostLink from '@/components/PostLink'`; drop the now-unused `Link` import if no other links remain). The title link and the row link both become `PostLink`.

- [ ] **Step 3 — In `layouts/ListLayoutWithTags.tsx`,** replace the post-title `<Link href={`/${path}`} …>` (the article rows) with `<PostLink slug={post.slug} …>`. Keep the tag-rail `Link`s as-is (those are tag pages, not posts). Add `import PostLink from '@/components/PostLink'`.

- [ ] **Step 4 — In `layouts/PostLayout.tsx`,** the prev/next links use `/${prev.path}` / `/${next.path}`. Replace them with `<PostLink slug={prev.slug}>` / `<PostLink slug={next.slug}>` so prev/next honor the reading preference. Import `PostLink`. (Leave the `← Writing` back-link and tag links as plain `Link`.)

- [ ] **Step 5 — Verify:** `yarn build` (PostLink is a client component used inside server components — that is allowed). Confirm a post page + the home + `/posts` still build and the post links point to `/posts/<slug>` in the static HTML (EN default): `grep -o "/posts/2026-06-04-semble-architecture" out/index.html | head -1`.
- [ ] **Step 6 — Commit:** `git add components/PostLink.tsx components/home/WritingSection.tsx layouts/ListLayoutWithTags.tsx layouts/PostLayout.tsx && git commit -m "feat(i18n): preference-aware PostLink across home/list/post nav" -m "<trailer>"`

---

# Phase D — Listings & sitemap use canonical

### Task 9: Lists from `canonicalBlogs()`

**Files:** Modify `app/page.tsx`, `app/posts/page.tsx` (+ any `app/posts/page/[page]/page.tsx`), `app/tags/[tag]/page.tsx`. **Read each first.**

- [ ] **Step 1 — `app/page.tsx`:** change the posts source from `allCoreContent(sortPosts(allBlogs))` to `allCoreContent(canonicalBlogs())` (import `canonicalBlogs` from `@/lib/posts`; drop now-unused `sortPosts`/`allBlogs` imports if unused).
- [ ] **Step 2 — `app/posts/page.tsx`** (and pagination page if present): same swap — feed `ListLayoutWithTags` from `allCoreContent(canonicalBlogs())`.
- [ ] **Step 3 — `app/tags/[tag]/page.tsx`:** change the filter source from `allBlogs` to `canonicalBlogs()`:

```tsx
const filteredPosts = allCoreContent(
  canonicalBlogs().filter((post) => post.tags && post.tags.map((t) => slug(t)).includes(tag))
)
```

and `generateStaticParams` for tags is driven by `tag-data.json` (already canonical from Task 1) — no change.

- [ ] **Step 4 — Verify:** `yarn build`; confirm `/posts` and a `/tags/<tag>` list each post once (no duplicates) — with no `.en.mdx` yet, counts equal today's.
- [ ] **Step 5 — Commit:** `git add app/page.tsx app/posts/page.tsx "app/tags/[tag]/page.tsx" && git commit -m "feat(i18n): list home/posts/tags from canonical blogs" -m "<trailer>"` (include the pagination page path if you changed it).

---

### Task 10: Sitemap adds `/ko`

**Files:** Modify `app/sitemap.ts`. **Read it first.**

- [ ] **Step 1 — For each post, also emit the `/ko/posts/<slug>` URL.** Where the sitemap maps blog routes, build entries from `canonicalBlogs()`: a canonical `${siteUrl}/posts/<slug>` entry plus, when `hasBothLanguages(slug)`, a `${siteUrl}/ko/posts/<slug>` entry. Import `canonicalBlogs, hasBothLanguages` from `@/lib/posts`. Keep static routes as-is. (If the file currently maps `allBlogs`, switch it to `canonicalBlogs()` to avoid duplicate slugs.)
- [ ] **Step 2 — Verify:** `yarn build`; `grep -c "/posts/" out/sitemap.xml` is sane (no `.en` URLs; `/ko/` entries only where both languages exist — i.e. none yet).
- [ ] **Step 3 — Commit:** `git add app/sitemap.ts && git commit -m "feat(i18n): sitemap includes /ko post URLs" -m "<trailer>"`

- [ ] **Phase D gate:** `yarn build` passes.

---

# Phase E — Verify

### Task 11: End-to-end verification (incl. a temporary English sample)

**Files:** none committed (temporary sample is created then removed).

- [ ] **Step 1 — Baseline (no English):** `yarn build`. Confirm: every `/posts/<slug>` serves Korean (today's behavior), `/ko/posts/<slug>` also generated, build page count ≈ today + the `/ko` tree. `grep -rn "from-blue\|\\.en\\.mdx" app components layouts lib` → no stray refs.
- [ ] **Step 2 — Add a temporary English sample:** copy one post to `data/posts/2026-06-04-semble-architecture.en.mdx` (no real translation needed) — just change the title to `"Inside Semble (EN sample)"` and replace the body with a short English paragraph (this is throwaway). `yarn build`.
- [ ] **Step 3 — Confirm bilingual behavior in `out/`:**
  - `out/posts/2026-06-04-semble-architecture.html` now contains `Inside Semble (EN sample)` (canonical = English).
  - `out/ko/posts/2026-06-04-semble-architecture.html` contains the Korean title.
  - The canonical page's `<head>` has `hreflang="en"` and `hreflang="ko"` alternates: `grep -o 'hreflang="ko"' out/posts/2026-06-04-semble-architecture.html`.
  - Lists/home still show the post once.
- [ ] **Step 4 — Remove the sample:** `rm data/posts/2026-06-04-semble-architecture.en.mdx`; `yarn build` returns to baseline. (Do NOT commit the sample.)
- [ ] **Step 5 — `/notes` invariant:** `git diff main --stat -- app/kb components/kb` is empty; `.kb-theme` region of `css/tailwind.css` unchanged.
- [ ] **Step 6 — Final lint/build:** `yarn lint && yarn build` clean.

### Task 12: Branch handoff

- [ ] **Step 1 — Update spec status** to `Implemented` in the spec file; commit.
- [ ] **Step 2 — Use superpowers:finishing-a-development-branch.** Note for the follow-up translation sub-project: the framework is now in place — adding `data/posts/<slug>.en.mdx` files is all that's needed to make posts bilingual.

---

## Self-Review

**Spec coverage:** §3 content model → Task 1-2. §4 routing (EN canonical, /ko, hreflang, static) → Task 4-5, 10. §5 toggle/provider/PostLink → Task 6-8. §6 rollout (never-broken, inert until translated) → Task 11 Steps 1-2. §7 file map → File Structure + tasks. §8 success criteria → Task 11. §9 open items: toggle placement = header (Task 7); KO noindex vs indexed = indexed + hreflang (Task 4-5, 10); translation workflow = out of scope (Task 12 note).

**Placeholder scan:** No "TBD/handle edge cases". Task 9/10 say "read each first" for files whose exact current contents vary (pagination route, sitemap shape) — the change is specified concretely (swap source to `canonicalBlogs()`, add `/ko` entries); reading first is to match the file's existing structure, not a deferral.

**Type consistency:** `canonicalBlogs()/postBySlug()/hasBothLanguages()` signatures are defined in Task 2 and used identically in Tasks 4,5,9,10. `language` is `'en'|'ko'` everywhere. `PostLink` prop `slug` matches `post.slug`. `useLanguage()` returns `{lang,setLang}` used in Tasks 7,8.
