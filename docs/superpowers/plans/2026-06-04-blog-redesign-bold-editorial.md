# Blog Redesign — "Bold Editorial" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic "AI-template" look (Professional Blue, gradient blobs, rotating roles) with a "Bold Editorial" system — warm paper + rust accent, bold Space Grotesk masthead, serif reading column — across the whole site, built i18n-ready.

**Architecture:** Foundations first (color tokens, fonts, width, a shared "kit of parts" CSS layer), then everything else consumes those tokens/classes. Tailwind `primary-*` ramp is swapped blue→rust so existing `primary` utilities recolor automatically; semantic color tokens (`paper/ink/muted/line/surface/accent`) are CSS variables that flip in `.dark`, so light/dark stays consistent with no `dark:` churn.

**Tech Stack:** Next.js (static export) · Tailwind CSS v4 (`@theme` in `css/tailwind.css`) · contentlayer2 · `next/font/google` · next-themes.

**Spec:** `docs/superpowers/specs/2026-06-04-blog-redesign-bold-editorial-design.md`

**Branch:** `redesign/bold-editorial` (already created; spec already committed).

---

## Conventions

**This is a visual redesign — TDD-by-unit-test does not fit CSS/JSX styling.** The disciplined equivalent used here per task is: make the change → automated gate → visual check → commit.

**Standard Verify (run unless a task says otherwise):**

```bash
# automated gate
yarn lint
npx tsc --noEmit
```

Expected: no errors. (`.contentlayer/generated` types already exist.)

**Visual check:** dev server runs on port **3456**.

```bash
# start once, leave running in a separate shell
yarn dev
```

Then screenshot the affected URL in **light and dark** (toggle via the header ☾) at desktop (1440w) and mobile (390w). Use Playwright (already a dependency) or the `run`/`verify` skills. Confirm: no blue remains, no layout overlap, dark mode is warm.

**Per-phase gate:** at the end of each phase run a full build:

```bash
yarn build
```

Expected: contentlayer builds, `next build` succeeds, static export to `out/` completes.

**Commit cadence:** one commit per task (message shown in each task). Co-author trailer on every commit:

```
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

**Hard invariant — do NOT touch `/notes` (KB):** leave `app/kb/*`, `components/kb/*`, and the `.kb-theme` / `body.kb-active` / `.kb-breakout` blocks in `css/tailwind.css` unchanged. A final task verifies `/kb` is visually identical.

---

## File Structure

**Created**

- `components/LanguageToggle.tsx` — EN/KO toggle (visual stub; wiring is a follow-up spec).
- `components/home/Masthead.tsx` — hero.
- `components/home/ProjectsSection.tsx`, `WritingSection.tsx`, `ExperienceSection.tsx`, `ContactSection.tsx` — home sections.

**Modified**

- `css/tailwind.css` — tokens, kit classes, prose/code retheme, remove blob keyframes. (KB blocks untouched.)
- `css/prism.css` — warm code token palette.
- `app/layout.tsx` — fonts + body tokens.
- `components/SectionContainer.tsx` — 1100px.
- `components/Header.tsx`, `components/Footer.tsx`, `components/MobileNav.tsx`, `data/headerNavLinks.ts`.
- `app/page.tsx` — home composition.
- `layouts/PostLayout.tsx`, `layouts/PostSimple.tsx`, `layouts/PostBanner.tsx`.
- `layouts/ListLayoutWithTags.tsx`, `layouts/AuthorLayout.tsx`.
- `components/Card.tsx`, `app/projects/page.tsx`, `components/Tag.tsx`, `components/Link.tsx`, `app/not-found.tsx`.

**Deleted**

- `app/Main.tsx` (dead).
- `components/home/Greeting.tsx`, `HeroSection.tsx`, `TechStackSection.tsx`, `ImpactMetricsSection.tsx`, `FeaturedSection.tsx`, `RecentPostsSection.tsx` (replaced by new sections).

---

# Phase A — Foundations

### Task A1: Color tokens (rust ramp + warm semantic tokens) & remove blob keyframes

**Files:** Modify `css/tailwind.css` (the `@theme {…}` block at top, lines ~3-20; the `@keyframes blob` + `.animate-blob` + `animation-delay-*` block lines ~24-61).

- [ ] **Step 1 — Replace the `@theme` block** (fonts + primary ramp + semantic token mappings):

```css
@theme {
  --font-family-sans: var(--font-space-grotesk), 'Pretendard', ui-sans-serif, system-ui, sans-serif;
  --font-family-mono: var(--font-jetbrains), ui-monospace, monospace;
  --font-family-serif: var(--font-newsreader), Georgia, serif;

  /* Rust accent ramp (replaces Professional Blue) */
  --color-primary-50: #fef6f0;
  --color-primary-100: #fde8da;
  --color-primary-200: #fbcfb4;
  --color-primary-300: #f6ab83;
  --color-primary-400: #f07c4e;
  --color-primary-500: #ea580c;
  --color-primary-600: #c2410c;
  --color-primary-700: #9a3412;
  --color-primary-800: #7c2d12;
  --color-primary-900: #6b2613;
  --color-primary-950: #3a1206;

  /* Semantic tokens — values flip in .dark via the vars below */
  --color-paper: var(--paper);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-accent: var(--accent);
}

:root {
  --paper: #f4efe4;
  --surface: #fbf9f3;
  --ink: #1a1712;
  --muted: #8c8475;
  --line: #ddd6c7;
  --accent: #c2410c;
}
:where(.dark) {
  --paper: #14110b;
  --surface: #1d1a12;
  --ink: #e9e3d5;
  --muted: #8c8475;
  --line: #2b2720;
  --accent: #ea580c;
}
```

- [ ] **Step 2 — Delete** the `@keyframes blob`, `.animate-blob`, `.animation-delay-2000`, `.animation-delay-4000` rules (no longer used once HeroSection is replaced; deleting now prevents reuse).

- [ ] **Step 3 — Verify:** `npx tsc --noEmit` (CSS-only change, just ensure nothing references the removed classes yet: `grep -rn "animate-blob\|animation-delay" app components layouts` → only `components/home/HeroSection.tsx`, which is deleted in Phase C. That is expected.)

- [ ] **Step 4 — Commit:** `git commit -am "feat(design): rust ramp + warm semantic color tokens, drop blob animation"`

---

### Task A2: Editorial "kit of parts" CSS classes

**Files:** Modify `css/tailwind.css` (append after the `@theme`/token blocks, before the prism token styles).

- [ ] **Step 1 — Add the shared kit** (every page/component uses these → DRY + consistent):

```css
/* ========================================
   Bold Editorial — Kit of parts
   ======================================== */
.eyebrow {
  @apply text-accent font-mono text-[11px] tracking-[0.16em] uppercase;
}
.sec-head {
  @apply border-ink mb-7 flex items-baseline justify-between border-t-[1.5px] pt-3;
}
.sec-num {
  @apply text-muted font-mono text-xs tracking-[0.12em] uppercase;
}
.list-row {
  @apply border-line flex items-start justify-between gap-6 border-b py-3.5;
}
.chip {
  @apply border-line text-muted rounded-full border px-2.5 py-0.5 font-mono text-[11px];
}
.ghost-btn {
  @apply border-ink hover:bg-ink hover:text-paper rounded-md border-[1.5px] px-4 py-2 font-semibold transition-colors;
}
.editorial-link {
  @apply text-accent underline decoration-[color:var(--accent)]/30 underline-offset-[3px] transition-colors hover:decoration-[color:var(--accent)]/60;
}
```

- [ ] **Step 2 — Verify:** `yarn lint` (CSS @apply with the new `accent/ink/line/muted/paper` utilities must resolve — they exist from A1). Expected: no "class does not exist" errors.

- [ ] **Step 3 — Commit:** `git commit -am "feat(design): add editorial kit-of-parts classes"`

---

### Task A3: Fonts (add Newsreader + Pretendard, drop Instrument Serif) & body tokens

**Files:** Modify `app/layout.tsx` (font imports lines ~4-31; `<html className>` line ~88; `<body className>` line ~101-104).

- [ ] **Step 1 — Swap fonts.** Replace the `Instrument_Serif` import/const with `Newsreader`, add Pretendard. Top of file:

```tsx
import { Space_Grotesk, JetBrains_Mono, Newsreader } from 'next/font/google'
```

```tsx
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

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
})
```

- [ ] **Step 2 — Pretendard fallback.** Add to `app/layout.tsx` head (Pretendard isn't on Google Fonts; use the CDN stylesheet so the `'Pretendard'` family in the sans stack resolves). Add inside the `<head>` links:

```tsx
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
/>
```

- [ ] **Step 3 — Update html/body classes.** `<html>` variable list: replace `instrument_serif.variable` with `newsreader.variable`:

```tsx
className={`${space_grotesk.variable} ${jetbrains_mono.variable} ${newsreader.variable} scroll-smooth`}
```

`<body>`: swap the hardcoded white/gray for semantic tokens:

```tsx
className = 'bg-paper text-ink antialiased'
```

(Remove the `dark:bg-gray-950 dark:text-white` — tokens flip automatically.) Also update the two `<meta name="theme-color">` values: light `content="#f4efe4"`, dark `content="#14110b"`.

- [ ] **Step 4 — Verify:** `npx tsc --noEmit && yarn lint`. Then `yarn dev` and confirm the page background is warm paper (light) / warm near-black (dark), text is ink.

- [ ] **Step 5 — Commit:** `git commit -am "feat(design): Newsreader serif + Pretendard fallback, body uses semantic tokens"`

---

### Task A4: Width system (1100 structure / 820 reading) + serif prose

**Files:** Modify `components/SectionContainer.tsx`; modify `css/tailwind.css` (the `.prose` rules region, ~lines 236-320).

- [ ] **Step 1 — Widen the container** (`components/SectionContainer.tsx`):

```tsx
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return <section className="mx-auto max-w-[1100px] px-5 sm:px-8 xl:px-0">{children}</section>
}
```

- [ ] **Step 2 — Add reading-measure + serif-body prose rules** to `css/tailwind.css` (append in the prose region). The post body gets `.reading-measure`; serif applies to body text, grotesk stays on headings:

```css
.reading-measure {
  @apply mx-auto max-w-[820px];
}
.reading-measure .prose {
  font-family: var(--font-family-serif);
  font-size: 20px;
}
.reading-measure .prose p,
.reading-measure .prose li {
  @apply leading-[1.72];
}
.reading-measure .prose h1,
.reading-measure .prose h2,
.reading-measure .prose h3,
.reading-measure .prose h4 {
  font-family: var(--font-family-sans);
}
```

- [ ] **Step 3 — Verify:** `yarn lint`. (Applied to a real post in Task D1.)

- [ ] **Step 4 — Commit:** `git commit -am "feat(design): 1100 structural width + 820 serif reading measure"`

---

### Task A5: Warm code-block retheme

**Files:** Modify `css/tailwind.css` (`.prose pre`, `.prose code`, `.remark-code-title`, `.highlight-line` ~lines 102-130 & 286-296); modify `css/prism.css` (token colors).

- [ ] **Step 1 — Warm the prose code containers** in `css/tailwind.css`:

```css
.prose pre {
  @apply border-line my-6 overflow-x-auto rounded-lg border p-4 text-sm;
  background: #16130d;
}
.prose pre code {
  @apply bg-transparent p-0;
  color: #e9e3d5;
}
.prose code {
  @apply bg-surface text-accent rounded px-1.5 py-0.5 font-mono text-sm;
}
.prose :not(pre) > code::before,
.prose :not(pre) > code::after {
  content: none;
}
```

Update `.remark-code-title` to `@apply ... bg-[#241f15] text-[#cbbf9f]` and `.highlight-line` to use `border-[color:var(--accent)] bg-[#241f15]`.

- [ ] **Step 2 — Recolor Prism tokens** in `css/prism.css` to the warm palette (keep structure; change colors):
  - comment/prolog → `#6b6354` italic
  - keyword/tag/operator/selector → `#ea580c`
  - string/inserted/attr-value/char → `#9bb069`
  - function/class-name/constant → `#e9e3d5`
  - number/boolean/builtin → `#e0a458`
  - punctuation → `#8c8475`
  - variable/regex/important → `#cbbf9f`

- [ ] **Step 3 — Verify:** `yarn dev`, open any existing post under `/posts/...`, confirm code blocks are warm-dark with rust keywords (no blue/purple night-owl).

- [ ] **Step 4 — Commit:** `git commit -am "feat(design): warm code-block + Prism retheme"`

- [ ] **Phase A gate:** `yarn build` succeeds.

---

# Phase B — Chrome

### Task B1: Nav links

**Files:** Modify `data/headerNavLinks.ts`.

- [ ] **Step 1 — New order, drop Home, label /posts as Writing, /kb as Notes:**

```ts
const headerNavLinks = [
  { href: '/projects', title: 'Projects' },
  { href: '/posts', title: 'Writing' },
  { href: '/kb', title: 'Notes' },
  { href: '/about', title: 'About' },
]

export default headerNavLinks
```

- [ ] **Step 2 — Commit:** `git commit -am "feat(design): editorial nav order (Projects/Writing/Notes/About)"`

---

### Task B2: LanguageToggle stub

**Files:** Create `components/LanguageToggle.tsx`.

- [ ] **Step 1 — Visual stub** (EN active, KO muted; no routing yet — wiring is the i18n follow-up spec):

```tsx
'use client'

export default function LanguageToggle() {
  return (
    <div
      className="text-muted font-mono text-xs"
      aria-label="Language (English active; Korean coming soon)"
      title="Korean toggle coming soon"
    >
      <span className="text-ink font-bold">EN</span>
      <span className="px-1 opacity-40">/</span>
      <span className="cursor-not-allowed">KO</span>
    </div>
  )
}
```

- [ ] **Step 2 — Verify:** `npx tsc --noEmit`.
- [ ] **Step 3 — Commit:** `git commit -am "feat(i18n): add EN/KO language toggle stub"`

---

### Task B3: Header redesign

**Files:** Modify `components/Header.tsx`.

- [ ] **Step 1 — Replace with the editorial header** (`ML.` wordmark + mono nav + CV + toggle + theme + search). Keep `SearchButton`, `ThemeSwitch`, `MobileNav`:

```tsx
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageToggle from './LanguageToggle'

const Header = () => {
  return (
    <header className="site-chrome-header flex items-center justify-between py-7">
      <Link
        href="/"
        aria-label={siteMetadata.headerTitle}
        className="text-xl font-bold tracking-tight"
      >
        ML<span className="text-accent">.</span>
      </Link>
      <div className="flex items-center gap-4 font-mono text-xs sm:gap-5">
        <nav className="hidden items-center gap-5 sm:flex">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="text-ink hover:text-accent transition-colors"
            >
              {link.title}
            </Link>
          ))}
          <a href="/static/cv.pdf" className="text-accent">
            CV ↗
          </a>
        </nav>
        <LanguageToggle />
        <ThemeSwitch />
        <SearchButton />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
```

Note: `/static/cv.pdf` is a placeholder path — leave the link; the real PDF is provided later (tracked in spec §10).

- [ ] **Step 2 — Verify:** `yarn dev`, confirm header is paper/ink/mono, nav order correct, `ML.` links home, ☾ + ⌘K present. Light + dark.
- [ ] **Step 3 — Commit:** `git commit -am "feat(design): editorial header with wordmark + CV + lang toggle"`

---

### Task B4: Footer redesign

**Files:** Modify `components/Footer.tsx`.

- [ ] **Step 1 — Minimal mono footer** (only real socials: mail, github, linkedin):

```tsx
import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer className="site-chrome-footer border-line mt-16 border-t">
      <div className="text-muted flex flex-col gap-4 py-7 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {siteMetadata.author} — hand-built, no template energy.
        </span>
        <div className="flex items-center gap-4">
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={5} />
          <SocialIcon kind="github" href={siteMetadata.github} size={5} />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={5} />
          <span>Seoul · UTC+9</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2 — Verify:** `yarn dev`, footer is one quiet mono line, light + dark.
- [ ] **Step 3 — Commit:** `git commit -am "feat(design): minimal mono footer"`

---

### Task B5: MobileNav restyle

**Files:** Modify `components/MobileNav.tsx` (read current file first; keep its open/close state logic and `headerNavLinks` source, restyle the panel).

- [ ] **Step 1 — Restyle** the slide-in panel: `bg-paper text-ink`, links in `font-mono text-lg`, add the `CV ↗` link and `LanguageToggle` at the bottom. Replace any `bg-white/dark:bg-gray-*` with `bg-paper`, link colors with `text-ink hover:text-accent`. Keep the existing toggle button/icon and a11y attributes.
- [ ] **Step 2 — Verify:** `yarn dev` at 390w; open menu, confirm paper/mono styling, nav order matches B1, light + dark.
- [ ] **Step 3 — Commit:** `git commit -am "feat(design): restyle mobile nav to editorial"`

- [ ] **Phase B gate:** `yarn build` succeeds.

---

# Phase C — Home

> All home sections use the kit classes from A2 and read real data from `data/projectsData.ts`, `data/careerData.ts`, and contentlayer posts.

### Task C1: Masthead

**Files:** Create `components/home/Masthead.tsx`.

- [ ] **Step 1:**

```tsx
import siteMetadata from '@/data/siteMetadata'

export default function Masthead() {
  return (
    <section className="pt-12 pb-16 sm:pt-16">
      <p className="eyebrow mb-5">
        Software Engineer @ UJET · ex-Founder/CTO · Seoul, open to global roles
      </p>
      <h1 className="text-[clamp(3.5rem,11vw,6.5rem)] leading-[0.82] font-bold tracking-[-0.045em]">
        MARTIAN
        <br />
        LEE<span className="text-accent">.</span>
      </h1>
      <p className="text-ink/90 mt-7 max-w-[24ch] font-serif text-2xl leading-[1.4]">
        I move fast with AI — and keep the decisions that matter human.
      </p>
      <div className="mt-8 flex flex-wrap gap-6 font-mono text-sm">
        <a href="#projects" className="text-accent border-accent border-b-2 pb-0.5">
          ↓ View projects
        </a>
        <a href="/posts" className="text-muted hover:text-accent">
          Writing
        </a>
        <a href="/static/cv.pdf" className="text-muted hover:text-accent">
          CV ↗
        </a>
        <a href={siteMetadata.github} className="text-muted hover:text-accent">
          GitHub ↗
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 2 — Commit:** `git commit -am "feat(home): bold masthead hero"`

---

### Task C2: ProjectsSection (home)

**Files:** Create `components/home/ProjectsSection.tsx`.

- [ ] **Step 1:** show up to 4 `featured` projects as editorial rows:

```tsx
import Link from '@/components/Link'
import projectsData from '@/data/projectsData'

export default function ProjectsSection() {
  const featured = projectsData.filter((p) => p.featured).slice(0, 4)
  return (
    <section id="projects" className="py-12">
      <div className="sec-head">
        <span className="sec-num">01 — Projects</span>
        <Link href="/projects" className="text-muted hover:text-accent font-mono text-xs">
          All projects →
        </Link>
      </div>
      <div>
        {featured.map((p) => {
          const link = p.demo || p.github || p.href
          return (
            <div key={p.title} className="list-row">
              <div>
                <h3 className="text-xl font-bold">
                  {link ? (
                    <Link href={link} className="hover:text-accent transition-colors">
                      {p.title}
                    </Link>
                  ) : (
                    p.title
                  )}
                </h3>
                <p className="text-muted mt-1 font-serif text-base">{p.description}</p>
              </div>
              {p.techStack && (
                <span className="text-muted shrink-0 pt-1 font-mono text-xs whitespace-nowrap">
                  {p.techStack.slice(0, 3).join(' · ')} →
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

Note: descriptions in `data/projectsData.ts` are Korean today; they will be translated in the i18n follow-up. Rendering is language-agnostic — no code change needed when copy is translated.

- [ ] **Step 2 — Commit:** `git commit -am "feat(home): projects section (editorial rows)"`

---

### Task C3: WritingSection (home)

**Files:** Create `components/home/WritingSection.tsx`.

- [ ] **Step 1:** top 2 posts as large entries (grotesk title + serif summary + mono meta), next 3 as rows. Receives `posts`:

```tsx
import Link from '@/components/Link'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'

export default function WritingSection({ posts }: { posts: CoreContent<Blog>[] }) {
  const featured = posts.slice(0, 2)
  const rest = posts.slice(2, 5)
  return (
    <section className="py-12">
      <div className="sec-head">
        <span className="sec-num">02 — Selected writing</span>
        <Link href="/posts" className="text-muted hover:text-accent font-mono text-xs">
          All posts →
        </Link>
      </div>
      <p className="text-muted mb-8 max-w-[60ch] font-serif text-lg">
        I take large codebases apart and write down how they actually work.
      </p>
      <div className="flex flex-col gap-7">
        {featured.map((post) => (
          <article key={post.slug}>
            <div className="text-muted font-mono text-[11px] tracking-wide">
              {formatDate(post.date, siteMetadata.locale)} · {post.readingTime.text} ·{' '}
              {post.tags?.slice(0, 2).join(' / ')}
            </div>
            <h3 className="mt-1.5 text-2xl leading-tight font-bold tracking-tight">
              <Link href={`/${post.path}`} className="hover:text-accent transition-colors">
                {post.title}
              </Link>
            </h3>
            {post.summary && (
              <p className="text-muted mt-2 max-w-[64ch] font-serif">{post.summary}</p>
            )}
          </article>
        ))}
      </div>
      <div className="mt-8">
        {rest.map((post) => (
          <div key={post.slug} className="list-row items-baseline">
            <Link
              href={`/${post.path}`}
              className="hover:text-accent text-[17px] font-semibold transition-colors"
            >
              {post.title}
            </Link>
            <span className="text-muted shrink-0 font-mono text-xs">
              {formatDate(post.date, siteMetadata.locale)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2 — Commit:** `git commit -am "feat(home): selected writing section"`

---

### Task C4: ExperienceSection (home)

**Files:** Create `components/home/ExperienceSection.tsx`.

- [ ] **Step 1:** career timeline from `data/careerData.ts`:

```tsx
import careerData from '@/data/careerData'

export default function ExperienceSection() {
  return (
    <section className="py-12">
      <div className="sec-head">
        <span className="sec-num">03 — Experience</span>
        <a href="/static/cv.pdf" className="text-accent font-mono text-xs">
          Download CV (PDF) ↗
        </a>
      </div>
      <div>
        {careerData.map((c) => (
          <div key={c.company} className="list-row">
            <div>
              <h3 className="text-xl font-bold">
                {c.company} <span className="text-muted text-base font-medium">— {c.role}</span>
              </h3>
              <p className="text-muted mt-1 font-serif text-base">
                {c.description}
                {c.techStack ? ` · ${c.techStack.join(' · ')}` : ''}
              </p>
            </div>
            <span className="text-muted shrink-0 pt-1 font-mono text-xs whitespace-nowrap">
              {c.period}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2 — Commit:** `git commit -am "feat(home): experience/CV timeline"`

---

### Task C5: ContactSection (home)

**Files:** Create `components/home/ContactSection.tsx`.

- [ ] **Step 1:**

```tsx
import siteMetadata from '@/data/siteMetadata'

export default function ContactSection() {
  return (
    <section className="border-ink mt-6 border-t py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 font-mono text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
          <span>Open to senior / staff engineering roles — globally.</span>
        </div>
        <div className="text-accent flex gap-5 font-mono text-sm">
          <a href={`mailto:${siteMetadata.email}`}>Email ↗</a>
          <a href={siteMetadata.github}>GitHub ↗</a>
          <a href={siteMetadata.linkedin}>LinkedIn ↗</a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2 — Commit:** `git commit -am "feat(home): contact/availability strip"`

---

### Task C6: Wire home page + delete dead components

**Files:** Modify `app/page.tsx`; delete `app/Main.tsx`, `components/home/{Greeting,HeroSection,TechStackSection,ImpactMetricsSection,FeaturedSection,RecentPostsSection}.tsx`.

- [ ] **Step 1 — New `app/page.tsx`:**

```tsx
import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from '.contentlayer/generated'
import Masthead from '@/components/home/Masthead'
import ProjectsSection from '@/components/home/ProjectsSection'
import WritingSection from '@/components/home/WritingSection'
import ExperienceSection from '@/components/home/ExperienceSection'
import ContactSection from '@/components/home/ContactSection'

export default async function Page() {
  const posts = allCoreContent(sortPosts(allBlogs))
  return (
    <>
      <Masthead />
      <ProjectsSection />
      <WritingSection posts={posts} />
      <ExperienceSection />
      <ContactSection />
    </>
  )
}
```

- [ ] **Step 2 — Delete dead files:**

```bash
git rm app/Main.tsx components/home/Greeting.tsx components/home/HeroSection.tsx components/home/TechStackSection.tsx components/home/ImpactMetricsSection.tsx components/home/FeaturedSection.tsx components/home/RecentPostsSection.tsx
```

- [ ] **Step 3 — Verify:** `grep -rn "home/HeroSection\|home/Greeting\|home/TechStack\|home/ImpactMetrics\|home/FeaturedSection\|home/RecentPosts\|app/Main" app components layouts` → no remaining imports. Then `npx tsc --noEmit && yarn dev`, review full home in light + dark + 390w mobile. Confirm order Hero→Projects→Writing→Experience→Contact, all English chrome, no blobs/rotating roles.
- [ ] **Step 4 — Commit:** `git commit -am "feat(home): compose editorial home, remove AI-template sections"`

- [ ] **Phase C gate:** `yarn build` succeeds.

---

# Phase D — Reading & lists

### Task D1: PostLayout

**Files:** Modify `layouts/PostLayout.tsx`.

- [ ] **Step 1 — Restructure** to wide header (1100, via SectionContainer) + narrow body (`reading-measure`), mono meta, inline TOC from `content.toc`, kit footer. Replace the whole returned JSX:

```tsx
import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from '.contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { formatDate } from 'pliny/utils/formatDate'

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags, readingTime } = content
  const basePath = path.split('/')[0]
  const author = authorDetails[0]

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        {/* WIDE HEADER */}
        <header className="pt-6">
          <Link href={`/${basePath}`} className="text-muted hover:text-accent font-mono text-xs">
            ← Writing
          </Link>
          {tags && (
            <div className="mt-7 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag key={tag} text={tag} />
              ))}
            </div>
          )}
          <h1 className="mt-3 max-w-[18ch] text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
            {title}
          </h1>
          {content.summary && (
            <p className="text-muted mt-4 max-w-[60ch] font-serif text-xl leading-snug">
              {content.summary}
            </p>
          )}
          <div className="text-muted mt-6 flex flex-wrap items-center gap-3 font-mono text-xs">
            {author?.name && <span>{author.name}</span>}
            <span>·</span>
            <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
            <span>·</span>
            <span>{readingTime.text}</span>
          </div>
        </header>

        <hr className="border-line mt-6" />

        {/* NARROW BODY */}
        <div className="reading-measure pt-9">
          {Array.isArray(content.toc) && content.toc.length > 2 && (
            <nav className="border-line mb-9 rounded-lg border p-4 font-mono text-[12.5px] leading-relaxed">
              <div className="text-muted mb-1.5 text-[10px] tracking-[0.1em] uppercase">
                On this page
              </div>
              {(content.toc as { value: string; url: string; depth: number }[])
                .filter((h) => h.depth <= 3)
                .map((h) => (
                  <a
                    key={h.url}
                    href={h.url}
                    className="hover:text-accent block"
                    style={{ paddingLeft: `${(h.depth - 1) * 12}px` }}
                  >
                    {h.value}
                  </a>
                ))}
            </nav>
          )}

          <div className="prose max-w-none break-words">{children}</div>

          {/* FOOTER */}
          <div className="border-line mt-12 flex items-center justify-between border-t pt-5 font-mono text-xs">
            <div className="flex gap-2">
              {tags?.map((tag) => (
                <Tag key={tag} text={tag} />
              ))}
            </div>
            <Link href={editUrl(filePath)} className="text-accent">
              Edit on GitHub ↗
            </Link>
          </div>

          {(prev || next) && (
            <div className="mt-7 flex justify-between gap-5">
              <div>
                {prev?.path && (
                  <>
                    <div className="text-muted font-mono text-[11px]">← PREVIOUS</div>
                    <Link href={`/${prev.path}`} className="hover:text-accent font-semibold">
                      {prev.title}
                    </Link>
                  </>
                )}
              </div>
              <div className="text-right">
                {next?.path && (
                  <>
                    <div className="text-muted font-mono text-[11px]">NEXT →</div>
                    <Link href={`/${next.path}`} className="hover:text-accent font-semibold">
                      {next.title}
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {siteMetadata.comments && (
            <div className="pt-10" id="comment">
              <Comments slug={slug} />
            </div>
          )}
        </div>
      </article>
    </SectionContainer>
  )
}
```

Note: `PageTitle`, `Image`, author-avatar sidebar removed (single author; avatar not needed in the editorial header). If `authorDetails[0]` may be undefined, the optional chaining covers it.

- [ ] **Step 2 — Verify:** `npx tsc --noEmit && yarn dev`, open a real architecture post. Confirm: wide title/meta (~1100), body constrained to 820 serif at 20px, warm code, inline TOC, rust links. Light + dark + mobile.
- [ ] **Step 3 — Commit:** `git commit -am "feat(post): editorial post layout (wide header, 820 serif body, TOC)"`

---

### Task D2: PostSimple & PostBanner consistency

**Files:** Modify `layouts/PostSimple.tsx`, `layouts/PostBanner.tsx` (read each first).

- [ ] **Step 1 — Apply the same shell:** wrap the article body in `<div className="reading-measure"><div className="prose max-w-none">…</div></div>`, title in `text-4xl font-bold tracking-[-0.03em]`, meta in mono, replace any `text-primary`/gray hardcodes with tokens. Keep their existing data wiring.
- [ ] **Step 2 — Verify:** if any post uses `layout: PostSimple`/`PostBanner` in frontmatter, open it; else confirm `npx tsc --noEmit` and a build.
- [ ] **Step 3 — Commit:** `git commit -am "feat(post): align PostSimple/PostBanner with editorial system"`

---

### Task D3: ListLayoutWithTags rewrite

**Files:** Modify `layouts/ListLayoutWithTags.tsx` (full rewrite of the blue/gradient/scale markup; keep the data logic — `tagData`, `displayPosts`, pagination props).

- [ ] **Step 1 — Replace `Pagination`** internals with mono ghost links:

```tsx
function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname.split('/')[1]
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages
  return (
    <nav className="border-line mt-10 flex items-center justify-between border-t pt-6 font-mono text-sm">
      {prevPage ? (
        <Link
          href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
          rel="prev"
          className="hover:text-accent"
        >
          ← Newer
        </Link>
      ) : (
        <span className="text-muted/40">← Newer</span>
      )}
      <span className="text-muted">
        {currentPage} / {totalPages}
      </span>
      {nextPage ? (
        <Link
          href={`/${basePath}/page/${currentPage + 1}`}
          rel="next"
          className="hover:text-accent"
        >
          Older →
        </Link>
      ) : (
        <span className="text-muted/40">Older →</span>
      )}
    </nav>
  )
}
```

- [ ] **Step 2 — Replace the list body** (header + tag rail + rows). Keep the `tagCounts/sortedTags/displayPosts` computations:

```tsx
return (
  <div>
    <div className="pt-2 pb-8">
      <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{title}</h1>
    </div>
    <div className="grid gap-10 md:grid-cols-[180px_1fr]">
      {/* tag rail */}
      <aside className="hidden md:block">
        <div className="sec-num mb-3">Tags</div>
        <div className="flex flex-col gap-1.5 font-mono text-sm">
          <Link
            href="/posts"
            className={
              pathname.startsWith('/posts') && !pathname.includes('/tags/')
                ? 'text-accent'
                : 'text-muted hover:text-accent'
            }
          >
            All
          </Link>
          {sortedTags.map((t) => (
            <Link
              key={t}
              href={`/tags/${slug(t)}`}
              className={
                pathname.split('/tags/')[1] === slug(t)
                  ? 'text-accent'
                  : 'text-muted hover:text-accent'
              }
            >
              {t} <span className="opacity-50">({tagCounts[t]})</span>
            </Link>
          ))}
        </div>
      </aside>
      {/* rows */}
      <div>
        {displayPosts.map((post) => {
          const { path, date, title, summary, tags } = post
          return (
            <article
              key={path}
              className="list-row flex-col items-start sm:flex-row sm:items-baseline"
            >
              <div className="sm:pr-8">
                <h2 className="text-xl font-bold tracking-tight">
                  <Link href={`/${path}`} className="hover:text-accent transition-colors">
                    {title}
                  </Link>
                </h2>
                {summary && <p className="text-muted mt-1.5 max-w-[60ch] font-serif">{summary}</p>}
                {tags && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Tag key={t} text={t} />
                    ))}
                  </div>
                )}
              </div>
              <time dateTime={date} className="text-muted mt-2 shrink-0 font-mono text-xs sm:mt-0">
                {formatDate(date, siteMetadata.locale)}
              </time>
            </article>
          )
        })}
        {pagination && pagination.totalPages > 1 && (
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
        )}
      </div>
    </div>
  </div>
)
```

Remove the now-unused `useState`/`isTagsOpen` collapsible. Keep imports actually used.

- [ ] **Step 3 — Verify:** `npx tsc --noEmit && yarn dev`, open `/posts` and a `/tags/<tag>`. Confirm editorial rows + mono tag rail, no blue. Light + dark + mobile.
- [ ] **Step 4 — Commit:** `git commit -am "feat(list): editorial posts list + tag rail"`

---

### Task D4: Tag chip + Tags index

**Files:** Modify `components/Tag.tsx`; check `app/tags/page.tsx` (read first).

- [ ] **Step 1 — `components/Tag.tsx`** → use the `.chip` kit class:

```tsx
import Link from 'next/link'
import { slug } from 'github-slugger'

interface Props {
  text: string
}

const Tag = ({ text }: Props) => (
  <Link
    href={`/tags/${slug(text)}`}
    className="chip hover:border-accent hover:text-accent mr-2 transition-colors"
  >
    {text.split(' ').join('-')}
  </Link>
)

export default Tag
```

- [ ] **Step 2 — Tags index** (`app/tags/page.tsx`): restyle the tag cloud to mono `.chip` rows with counts; replace any `text-primary`/gradient. (Apply tokens; structure stays.)
- [ ] **Step 3 — Verify:** `yarn dev` `/tags`. Light + dark.
- [ ] **Step 4 — Commit:** `git commit -am "feat(design): editorial tag chips + tags index"`

- [ ] **Phase D gate:** `yarn build` succeeds.

---

# Phase E — Projects, About, 404

### Task E1: Projects page + Card → editorial rows

**Files:** Modify `app/projects/page.tsx` (read first) and `components/Card.tsx`.

- [ ] **Step 1 — Rework `Card.tsx`** into an editorial row (drop the bordered image card; keep props):

```tsx
import Link from './Link'

interface CardProps {
  title: string
  description: string
  imgSrc?: string
  href?: string
  techStack?: string[]
  workflow?: string[]
  aiTools?: string[]
  demo?: string
  github?: string
}

const Card = ({ title, description, techStack, aiTools, demo, github, href }: CardProps) => {
  const link = demo || github || href
  return (
    <div className="list-row flex-col items-start sm:flex-row sm:items-baseline">
      <div className="sm:pr-8">
        <h2 className="text-xl font-bold tracking-tight">
          {link ? (
            <Link href={link} className="hover:text-accent transition-colors">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="text-muted mt-1.5 max-w-[64ch] font-serif">{description}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
          {demo && (
            <Link href={demo} className="text-accent">
              Live Demo ↗
            </Link>
          )}
          {github && (
            <Link href={github} className="text-muted hover:text-accent">
              GitHub ↗
            </Link>
          )}
          {aiTools?.length ? (
            <span className="text-muted">built with {aiTools.join(', ')}</span>
          ) : null}
        </div>
      </div>
      {techStack && (
        <span className="text-muted mt-2 shrink-0 font-mono text-xs whitespace-nowrap sm:mt-0">
          {techStack.slice(0, 4).join(' · ')}
        </span>
      )}
    </div>
  )
}

export default Card
```

- [ ] **Step 2 — Projects page** (`app/projects/page.tsx`): page title `text-4xl font-bold`, group game/non-game with `.sec-head` + `.sec-num` labels, render `<Card />` rows. Replace any container/grid that assumed the old card. Read the current file and keep its data import + grouping.
- [ ] **Step 3 — Verify:** `yarn dev` `/projects`. Editorial rows, rust links, group headers. Light + dark + mobile.
- [ ] **Step 4 — Commit:** `git commit -am "feat(projects): editorial project rows"`

---

### Task E2: About (AuthorLayout)

**Files:** Modify `layouts/AuthorLayout.tsx` (read first); content in `data/authors/default.mdx`.

- [ ] **Step 1 — Editorial about:** name as masthead (`text-5xl font-bold`), eyebrow role line, the bio body in `reading-measure` serif `prose`, then reuse the experience timeline pattern from C4 (inline the same markup over `careerData`), an availability line (green dot), and contact (email/github/linkedin) + `CV (PDF) ↗`. Replace gray/primary hardcodes with tokens. Keep the `children` (MDX bio) render inside the prose block.
- [ ] **Step 2 — Verify:** `yarn dev` `/about`. Light + dark + mobile.
- [ ] **Step 3 — Commit:** `git commit -am "feat(about): editorial about + experience + contact"`

---

### Task E3: 404

**Files:** Modify `app/not-found.tsx`.

- [ ] **Step 1:**

```tsx
import Link from '@/components/Link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-start py-24">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="text-7xl font-bold tracking-[-0.04em] sm:text-8xl">
        Lost the thread<span className="text-accent">.</span>
      </h1>
      <p className="text-muted mt-5 font-serif text-xl">
        This page doesn't exist — or hasn't been written yet.
      </p>
      <Link href="/" className="ghost-btn mt-8 font-mono text-sm">
        ← Back home
      </Link>
    </div>
  )
}
```

- [ ] **Step 2 — Verify:** `yarn dev` `/some-missing-url`. Light + dark.
- [ ] **Step 3 — Commit:** `git commit -am "feat(design): editorial 404"`

- [ ] **Phase E gate:** `yarn build` succeeds.

---

# Phase F — Verify & finish

### Task F1: Full-site verification sweep

**Files:** none (verification only).

- [ ] **Step 1 — Build & lint clean:** `yarn build && yarn lint` → both pass.
- [ ] **Step 2 — Grep for residue:**

```bash
grep -rn "from-blue\|to-slate\|animate-blob\|bg-blue-600\|Instrument_Serif\|scale-105" app components layouts css
```

Expected: no matches (KB files may legitimately use their own amber vars — they are not in this grep's scope of blue/blob).

- [ ] **Step 3 — Screenshot matrix** (Playwright, light + dark, 1440w + 390w): `/`, `/posts`, a `/posts/<arch-post>`, `/projects`, `/about`, `/tags`, `/404`. Confirm: rust-only accent, warm dark, 820 reading column, no overlaps.
- [ ] **Step 4 — `/notes` invariant:** screenshot `/kb` before/after the branch — must be visually identical (amber Knowledge IDE intact). `git diff main -- app/kb components/kb` and the `.kb-theme` region of `css/tailwind.css` → **no changes**.
- [ ] **Step 5 — Reduced motion / a11y:** confirm no essential content depends on motion; nav/links have accessible names; contrast holds on paper/ink.
- [ ] **Step 6 — Commit** any final tweaks: `git commit -am "chore(design): verification fixes"` (skip if clean).

### Task F2: Branch handoff

- [ ] **Step 1 — Update spec status** to `Implemented` in `docs/superpowers/specs/2026-06-04-blog-redesign-bold-editorial-design.md`, commit.
- [ ] **Step 2 — Use superpowers:finishing-a-development-branch** to choose merge / PR / cleanup. (Outstanding pre-merge items from spec §10: real `CV.pdf` asset; confirm eyebrow/availability factual wording with the user.)

---

## Self-Review

**Spec coverage:** §4 Foundations → A1-A5. §5 Copy deck → embedded in C1/C3/C5/header. §6.1 Header → B1-B3. §6.2 Footer → B4. §6.3 Home → C1-C6. §6.4 Post → D1-D2. §6.5 List/Tags → D3-D4. §6.6 Projects → E1. §6.7 About → E2. §6.8 404 → E3. §6.9 /notes untouched → enforced in Conventions + F1 Step 4. §7 i18n hooks → B2 (toggle), A3 (Pretendard), language-agnostic rendering noted in C2. §8 file map → File Structure + per-task paths. §9 success criteria → F1. §10 open items → carried into F2.

**Placeholder scan:** `/static/cv.pdf` is an intentional, documented placeholder asset (spec §10, surfaced in F2) — not a code placeholder. No "TODO/handle edge cases/fill in" steps; every code step has real code.

**Type consistency:** Post fields used (`path, slug, date, title, summary, tags, readingTime.text, toc`) are confirmed in `contentlayer.config.ts`. `careerData` fields (`company, role, period, description, techStack`) and `projectsData` fields (`title, description, featured, techStack, demo, github, href, aiTools`) match `data/*.ts`. `Tag` text prop, `SectionContainer` children prop, `WritingSection`/`PostLayout` prop shapes consistent across tasks.
