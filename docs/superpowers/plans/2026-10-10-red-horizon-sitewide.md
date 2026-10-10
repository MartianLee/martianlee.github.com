# Red Horizon Sitewide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved "Red Horizon" design (home hero A, pointer-lit project planets, year-axis career bars, horizon bands on every page, a live Mars globe on About) across the blog except the knowledge base.

**Architecture:** A self-contained design system lives in `css/red-horizon.css` with `rh-` class names and `--rh-` tokens, so nothing that exists today (KB, `.prose`, Tailwind utilities, shared tokens) changes. Pages are rebuilt as React components that port the approved static preview (`.notes/red-horizon/reference/`). Heavy WebGL renderers (home horizon, About globe) are plain TypeScript modules loaded with dynamic `import()` after first paint; all text is server-rendered HTML.

**Tech Stack:** Next.js 16 App Router (static export), React 19, Tailwind v4 (+ plain CSS file), next/font/google (Archivo variable with `wdth`), next-themes (`html.dark`), Contentlayer2, Node 24 `node --test` with native TypeScript type stripping, Playwright (installed in the repo) for screenshots.

Spec: `docs/superpowers/specs/2026-10-10-red-horizon-sitewide-design.md`. Preview: https://claude.ai/artifact/KVHyrUHhTQkEaRveQ9tPTf

## Global Constraints

- Work only in this worktree: `/Users/dede/workspace/martianlee.github.com/.claude/worktrees/red-horizon` (branch `feat/red-horizon`). Never `cd` to the original repo root and never touch the main checkout.
- Reference implementation (read-only): `/Users/dede/workspace/martianlee.github.com/.notes/red-horizon/reference/` (written `REF/` below). When this plan says "port REF/x lines a–b", copy that code and apply the renaming and adaptation rules below; do not redesign it.
- Package manager is **yarn 3.6.1 (berry)**; never `npm install`. Node 24. **No new dependencies.**
- Port 3456 belongs to the user's dev server. Do not start a dev server; verify with `yarn build` + `node .superpowers/sdd/rh-shots.mjs` (static `out/` served on a random port). Routes in that tool use the export file names: `/`, `/about.html`, `/posts.html`, `/posts/page/2.html`, `/posts/<slug>.html`, `/ko/posts/<slug>.html`, `/tags.html`, `/tags/<tag>.html`, `/projects.html`, `/projects/<slug>.html`, `/climate.html`, `/praisecat.html`, `/404.html`, `/kb.html`.
- `yarn build` does not regenerate Contentlayer. This plan does not change posts, so do not run Contentlayer. If `app/kb-data.json`, `app/tag-data.json` or `public/search.json` show up as modified after a build, restore them with `git checkout -- <file>`; never commit them.
- Every commit passes husky (lint-staged runs `eslint --fix` and `prettier --write`). Before committing run `yarn prettier --write <your files>` and `yarn eslint <your ts/tsx files>`; `yarn lint` must stay clean (typed linting + `jsx-a11y/recommended`).
- Files executed by `node --test` (`lib/**/*.ts`, `data/projectsData.ts` and their tests) use relative imports with the `.ts` extension, `import type` for types, no `enum`/`namespace`, no path aliases.
- **CSS rules.** Every new class starts with `rh-` (REF names are renamed: `.proj-row` → `.rh-proj-row`; exceptions: `.site-head` → `.rh-head`, `.ring` → `.rh-orb-ring`, REF reading rules `.prose …` → `.rh-reading …`). Every new custom property starts with `--rh-` (REF `--paper` → `--rh-paper`, `--display` → `--rh-display`, `--sun-x` → `--rh-sun-x`, etc.). Dark values go only in `html.dark { … }`; delete REF's `@media (prefers-color-scheme: dark)` and `[data-theme]` blocks. Never change the existing tokens (`--paper --ink --muted --line --surface --accent`), the existing `.prose` rules, or anything under `.kb-*`/`body.kb-active`.
- **JS rules.** No DOM access at module scope (static export renders on the server). Theme = `document.documentElement.classList.contains('dark')`, watched with a `MutationObserver` on the `class` attribute (helper in Task 3). Every listener, observer, timer and rAF started in an effect is removed in its cleanup. `prefers-reduced-motion: reduce` gets a still frame and no loops. Visible strings come from `useUI()` (EN/KO), never hard-coded English in client components.
- **Copy rules.** Use the strings defined in Task 2 verbatim. Korean strings are formal speech (~입니다/~합니다). Do not add em dashes to new copy (existing strings keep theirs). No invented facts or numbers.
- **KB must not change.** Task 3 and Task 11 compare `/kb.html`, `/kb/graph.html`, `/kb/2026-09-28-request-layers.html` against the baseline in `.superpowers/sdd/shots/kb-baseline/`.
- Commit trailer on every commit:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

---

## File map

| Path | Responsibility |
|---|---|
| `lib/mars/clock.ts` (+ `.test.ts`) | Mars24 clock: MSD, MTC, Ls, MY, season, Jezero LMST, EOT, subsolar point, Earth–Mars light time. Pure. |
| `lib/mars/format.ts` | Clock and light-time formatters (EN/KO). Pure. |
| `lib/tenure.ts` (+ `.test.ts`) | Career bar geometry and active-role lookup by year. Pure. |
| `lib/headings.ts` (+ `.test.ts`) | TOC parsing and "already numbered" detection. Pure. |
| `lib/mars/horizon-renderer.ts` | Home WebGL horizon (lazy chunk). `mountHorizon()`. |
| `lib/mars/globe-renderer.ts` | About WebGL globe (lazy chunk). `mountGlobe()`. |
| `css/red-horizon.css` | The whole Red Horizon system (`rh-` classes, `--rh-` tokens). |
| `components/hooks/useDarkTheme.ts` | Returns `isDark` and re-renders on `html.dark` changes. |
| `components/hooks/usePointerSun.ts` | Sets `--rh-lx/--rh-ly` on planet orbs from the pointer. |
| `components/hooks/useSettleOnView.ts` | Adds the settle class when a section title enters the viewport. |
| `components/HorizonBand.tsx` | Inner-page sky band (monument / headline / slim). |
| `components/ProjectOrb.tsx` | Procedural planet tile for a project `orb` key. |
| `components/MarsLightTime.tsx` | Live Seoul time + Earth→Mars light-time sentence. |
| `components/Header.tsx`, `components/Footer.tsx` | A header over the band; global contact strip + foot. |
| `components/home/MarsHorizon.tsx`, `MarsHud.tsx` | Home hero + live telemetry. |
| `components/home/ProjectsSection.tsx`, `WritingSection.tsx`, `ExperienceSection.tsx` | Home sections. |
| `components/TenureChart.tsx` | Year-axis bars + scrubber. |
| `components/posts/PostRow.tsx`, `components/posts/PostToc.tsx` | List row; sticky TOC with scroll spy + reading progress. |
| `components/NotFoundView.tsx` | 404 body (client, localized). |
| `components/about/MarsGlobe.tsx` | About globe figure, caption, controls. |
| `layouts/ListLayoutWithTags.tsx`, `layouts/PostLayout.tsx`, `layouts/AuthorLayout.tsx` | Rebuilt layouts. |
| `components/projects/ProjectsView.tsx`, `ProjectDetail.tsx` | Rebuilt projects pages. |
| `data/projectsData.ts` (+ `.test.ts`), `data/careerData.ts`, `lib/ui-strings.ts` | New fields and strings. |
| `app/layout.tsx`, `app/page.tsx`, `app/not-found.tsx`, `app/tags/page.tsx`, `app/posts/page.tsx`, `app/posts/page/[page]/page.tsx`, `app/climate/page.tsx`, `app/praisecat/page.tsx` | Wiring. |
| Delete: `components/home/Masthead.tsx`, `components/home/ContactSection.tsx`, `components/Card.tsx` | Replaced. |

---

### Task 1: Pure logic — Mars clock, formatters, tenure geometry, heading numbering

**Files:**
- Create: `lib/mars/clock.ts`, `lib/mars/format.ts`, `lib/mars/clock.test.ts`, `lib/tenure.ts`, `lib/tenure.test.ts`, `lib/headings.ts`, `lib/headings.test.ts`
- Modify: `package.json` (`scripts.test`)

**Interfaces (produced, used by Tasks 3, 5, 6, 8, 10):**
```ts
// lib/mars/clock.ts
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export interface MarsClock { msd: number; mtc: number; ls: number; my: number; season: Season; lmstJezero: number; nuMinusM: number; eot: number; subsolarLatDeg: number; subsolarLonEastDeg: number; au: number; lightSec: number }
export const JEZERO: { readonly latDeg: 18.44; readonly lonEastDeg: 77.45 }
export function marsClock(ms: number, ttMinusUtc?: number): MarsClock
// lib/mars/format.ts
export function formatClock(hours: number, withSeconds?: boolean): string   // "18:33:45"
export function formatLightTime(sec: number, lang: 'en' | 'ko'): string     // "13 min 18 s" | "13분 18초"
export function formatMsd(msd: number): string                               // "54,308.77"
// lib/tenure.ts
export interface TenureRole { company: string; role: string; startYear: number; endYear: number | null }
export interface TenureAxis { from: number; to: number }
export function yearFraction(date: Date): number
export function tenureAxis(roles: readonly TenureRole[], nowYear: number): TenureAxis
export function barSpan(role: TenureRole, axis: TenureAxis, now: number): { left: number; width: number }
export function activeRoles<T extends TenureRole>(roles: readonly T[], year: number, nowYear: number): T[]
export function scrubYears(axis: TenureAxis, nowYear: number): number[]
// lib/headings.ts
export interface TocEntry { value: string; url: string; depth: number }
export function parseToc(raw: unknown): TocEntry[]
export function hasNumberedHeadings(toc: readonly TocEntry[]): boolean
```

- [ ] **Step 1: Extend the test glob**

In `package.json` replace the `test` script with:
```json
"test": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test \"scripts/**/*.test.mjs\" \"components/**/*.test.ts\" \"lib/**/*.test.ts\" \"data/**/*.test.ts\""
```

- [ ] **Step 2: Write the failing tests**

`lib/mars/clock.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { marsClock } from './clock.ts'
import { formatClock, formatLightTime, formatMsd } from './format.ts'

const near = (a: number, b: number, eps: number, msg: string) =>
  assert.ok(Math.abs(a - b) <= eps, `${msg}: got ${a}, want ${b} ± ${eps}`)

test('reproduces the Mars24 worked example (2000-01-06T00:00Z, TT-UTC 64.184 s)', () => {
  const c = marsClock(Date.UTC(2000, 0, 6), 64.184)
  near(c.ls, 277.18759, 2e-4, 'Ls')
  near(c.msd, 44795.99976, 3e-5, 'MSD')
  near(c.nuMinusM, 4.44193, 2e-4, 'nu - M')
  near(c.eot, -5.18774, 3e-4, 'EOT')
  assert.equal(c.my, 24)
  assert.equal(c.season, 'winter')
})

test('Mars Year 39 begins on 2026-09-30 at about 08:21Z', () => {
  assert.equal(marsClock(Date.UTC(2026, 8, 30, 8, 0)).my, 38)
  assert.equal(marsClock(Date.UTC(2026, 8, 30, 9, 0)).my, 39)
  assert.equal(marsClock(Date.UTC(2026, 9, 10, 7)).season, 'spring')
})

test('Earth–Mars distance matches known geometry', () => {
  near(marsClock(Date.UTC(2027, 1, 19)).au, 0.678, 0.003, 'opposition 2027-02-19')
  near(marsClock(Date.UTC(2026, 0, 9)).au, 2.404, 0.003, 'conjunction 2026-01-09')
  near(marsClock(Date.UTC(2026, 9, 10, 7)).lightSec, 798.3, 1, 'light time 2026-10-10T07Z')
})

test('the subsolar meridian sits at local true solar time 12:00', () => {
  for (const t of [Date.UTC(2000, 0, 6), Date.UTC(2026, 9, 10, 7), Date.UTC(2027, 4, 1, 15, 30)]) {
    const c = marsClock(t)
    const ltst = (((c.mtc + c.subsolarLonEastDeg / 15 + c.eot / 15) % 24) + 24) % 24
    near(ltst, 12, 1e-6, 'LTST at the subsolar longitude')
    assert.ok(Math.abs(c.subsolarLatDeg) <= 25.5, 'subsolar latitude within ±25.5°')
  }
})

test('formatters', () => {
  assert.equal(formatClock(18.5625), '18:33:45')
  assert.equal(formatClock(23.725644, false), '23:43')
  assert.equal(formatLightTime(798.3, 'en'), '13 min 18 s')
  assert.equal(formatLightTime(798.3, 'ko'), '13분 18초')
  assert.equal(formatMsd(54308.7734), '54,308.77')
})
```

`lib/tenure.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activeRoles, barSpan, scrubYears, tenureAxis, yearFraction } from './tenure.ts'

const ROLES = [
  { company: 'UJET', role: 'Software Engineer 2', startYear: 2024, endYear: null },
  { company: 'TomorrowUse', role: 'Co-founder / CTO', startYear: 2021, endYear: 2023 },
  { company: 'Miso', role: 'Frontend Developer', startYear: 2020, endYear: 2021 },
]
const near = (a: number, b: number, msg: string) => assert.ok(Math.abs(a - b) < 1e-3, `${msg}: ${a} vs ${b}`)

test('axis runs from the first start year to the year after now', () => {
  assert.deepEqual(tenureAxis(ROLES, 2026), { from: 2020, to: 2027 })
})

test('bars run from the start-year tick to the end-year tick, ongoing roles to now', () => {
  const axis = { from: 2020, to: 2027 }
  const miso = barSpan(ROLES[2], axis, 2026.7726)
  near(miso.left, 0, 'Miso left'); near(miso.width, 100 / 7, 'Miso width')
  const tu = barSpan(ROLES[1], axis, 2026.7726)
  near(tu.left, 100 / 7, 'TomorrowUse left'); near(tu.width, 200 / 7, 'TomorrowUse width')
  const ujet = barSpan(ROLES[0], axis, 2026.7726)
  near(ujet.left, 400 / 7, 'UJET left'); near(ujet.width, ((2026.7726 - 2024) / 7) * 100, 'UJET width')
})

test('active roles count whole years inclusively', () => {
  const names = (y: number) => activeRoles(ROLES, y, 2026).map((r) => r.company)
  assert.deepEqual(names(2020), ['Miso'])
  assert.deepEqual(names(2021), ['TomorrowUse', 'Miso'])
  assert.deepEqual(names(2023), ['TomorrowUse'])
  assert.deepEqual(names(2024), ['UJET'])
  assert.deepEqual(names(2026), ['UJET'])
})

test('scrub years and year fraction', () => {
  assert.deepEqual(scrubYears({ from: 2020, to: 2027 }, 2026), [2020, 2021, 2022, 2023, 2024, 2025, 2026])
  near(yearFraction(new Date(Date.UTC(2026, 9, 10))), 2026 + 282 / 365, 'yearFraction 2026-10-10')
})
```

`lib/headings.test.ts`:
```ts
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
```

- [ ] **Step 3: Run the tests and see them fail**

Run: `yarn test`
Expected: FAIL (`Cannot find module …/lib/mars/clock.ts` and similar).

- [ ] **Step 4: Implement**

`lib/mars/clock.ts`:
```ts
// Mars clock: Mars24 algorithm (Allison & McEwen 2000; NASA GISS). Pure, no DOM.
// Verified against the Mars24 worked example: 2000-01-06T00:00Z gives Ls 277.18759°, MSD 44795.99976, EOT −5.18774°.

export const TT_MINUS_UTC_S = 69.184 // 37 leap seconds + 32.184 s, unchanged since 2017
export const JEZERO = { latDeg: 18.44, lonEastDeg: 77.45 } as const // Perseverance landing site
export const MY39_START_MSD = 54299.0962 // 2026-09-30T08:21Z, Ls = 0
export const SOLS_PER_MARS_YEAR = 668.5991
export const LIGHT_SECONDS_PER_AU = 499.004784

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface MarsClock {
  msd: number
  mtc: number
  ls: number
  my: number
  season: Season
  lmstJezero: number
  nuMinusM: number
  eot: number
  subsolarLatDeg: number
  subsolarLonEastDeg: number
  au: number
  lightSec: number
}

const D = Math.PI / 180
const mod = (a: number, n: number): number => ((a % n) + n) % n
const SEASONS: readonly Season[] = ['spring', 'summer', 'autumn', 'winter']

// JPL "Approximate Positions of the Planets" (1800–2050): a, e, I, L, ϖ, Ω and their rates per century.
type Elements = readonly number[]
const EARTH: Elements = [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0]
const MARS: Elements = [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]

function heliocentric(e: Elements, T: number): [number, number, number] {
  const a = e[0] + e[6] * T
  const ec = e[1] + e[7] * T
  const I = (e[2] + e[8] * T) * D
  const L = e[3] + e[9] * T
  const wb = e[4] + e[10] * T
  const O = e[5] + e[11] * T
  const w = (wb - O) * D
  const Or = O * D
  const M = (mod(L - wb + 180, 360) - 180) * D
  let E = M + ec * Math.sin(M)
  for (let k = 0; k < 12; k++) E -= (E - ec * Math.sin(E) - M) / (1 - ec * Math.cos(E))
  const x = a * (Math.cos(E) - ec)
  const y = a * Math.sqrt(1 - ec * ec) * Math.sin(E)
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(Or), sO = Math.sin(Or), cI = Math.cos(I), sI = Math.sin(I)
  return [
    (cw * cO - sw * sO * cI) * x + (-sw * cO - cw * sO * cI) * y,
    (cw * sO + sw * cO * cI) * x + (-sw * sO + cw * cO * cI) * y,
    sw * sI * x + cw * sI * y,
  ]
}

export function marsClock(ms: number, ttMinusUtc: number = TT_MINUS_UTC_S): MarsClock {
  const jdTT = 2440587.5 + ms / 8.64e7 + ttMinusUtc / 86400
  const dt = jdTT - 2451545.0
  const M = (19.3871 + 0.52402073 * dt) * D
  const aFMS = 270.3871 + 0.524038496 * dt
  const A = [0.0071, 0.0057, 0.0039, 0.0037, 0.0021, 0.002, 0.0018]
  const TAU = [2.2353, 2.7543, 1.1177, 15.7866, 2.1354, 2.4694, 32.8493]
  const PHI = [49.409, 168.173, 191.837, 21.736, 15.704, 95.528, 49.095]
  let pbs = 0
  for (let i = 0; i < 7; i++) pbs += A[i] * Math.cos(((0.985626 * dt) / TAU[i] + PHI[i]) * D)
  const nuMinusM =
    (10.691 + 3e-7 * dt) * Math.sin(M) + 0.623 * Math.sin(2 * M) + 0.05 * Math.sin(3 * M) +
    0.005 * Math.sin(4 * M) + 0.0005 * Math.sin(5 * M) + pbs
  const ls = mod(aFMS + nuMinusM, 360)
  const lsR = ls * D
  const eot = 2.861 * Math.sin(2 * lsR) - 0.071 * Math.sin(4 * lsR) + 0.002 * Math.sin(6 * lsR) - nuMinusM
  const msd = (dt - 4.5) / 1.0274912517 + 44796.0 - 0.0009626
  const mtc = mod(24 * msd, 24)
  const my = 39 + Math.floor((msd - MY39_START_MSD) / SOLS_PER_MARS_YEAR)
  const season = SEASONS[Math.floor(ls / 90)]
  const lmstJezero = mod(mtc + JEZERO.lonEastDeg / 15, 24)
  const subsolarLatDeg = Math.asin(0.42565 * Math.sin(lsR)) / D + 0.25 * Math.sin(lsR)
  const subsolarLonEastDeg = mod(360 - mod(15 * mtc + eot + 180, 360), 360)
  const T = dt / 36525
  const e = heliocentric(EARTH, T)
  const m = heliocentric(MARS, T)
  const au = Math.hypot(m[0] - e[0], m[1] - e[1], m[2] - e[2])
  return { msd, mtc, ls, my, season, lmstJezero, nuMinusM, eot, subsolarLatDeg, subsolarLonEastDeg, au, lightSec: au * LIGHT_SECONDS_PER_AU }
}
```

`lib/mars/format.ts`:
```ts
const pad2 = (n: number): string => String(n).padStart(2, '0')

export function formatClock(hours: number, withSeconds = true): string {
  const total = Math.floor((((hours % 24) + 24) % 24) * 3600)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return withSeconds ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`
}

export function formatLightTime(sec: number, lang: 'en' | 'ko'): string {
  const whole = Math.round(sec)
  const m = Math.floor(whole / 60)
  const s = whole % 60
  return lang === 'ko' ? `${m}분 ${s}초` : `${m} min ${s} s`
}

export function formatMsd(msd: number): string {
  return msd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
```

`lib/tenure.ts`:
```ts
export interface TenureRole {
  company: string
  role: string
  startYear: number
  endYear: number | null
}

export interface TenureAxis {
  from: number
  to: number
}

/** 2026-10-10 → 2026.7726 (share of the UTC year elapsed). */
export function yearFraction(date: Date): number {
  const y = date.getUTCFullYear()
  const start = Date.UTC(y, 0, 1)
  return y + (date.getTime() - start) / (Date.UTC(y + 1, 0, 1) - start)
}

/** From the earliest start year to the year after `nowYear`, so the current year has room. */
export function tenureAxis(roles: readonly TenureRole[], nowYear: number): TenureAxis {
  return { from: Math.min(...roles.map((r) => r.startYear)), to: nowYear + 1 }
}

/** Percent geometry: start-year tick to end-year tick; ongoing roles end at `now` (a year fraction). */
export function barSpan(role: TenureRole, axis: TenureAxis, now: number): { left: number; width: number } {
  const span = axis.to - axis.from
  const end = role.endYear ?? now
  return { left: ((role.startYear - axis.from) / span) * 100, width: ((end - role.startYear) / span) * 100 }
}

/** Roles held at any point of whole year `year`, start and end years inclusive. */
export function activeRoles<T extends TenureRole>(roles: readonly T[], year: number, nowYear: number): T[] {
  return roles.filter((r) => r.startYear <= year && year <= (r.endYear ?? nowYear))
}

/** Scrubber stops: every whole year on the axis up to `nowYear`. */
export function scrubYears(axis: TenureAxis, nowYear: number): number[] {
  const out: number[] = []
  for (let y = axis.from; y <= nowYear; y++) out.push(y)
  return out
}
```

`lib/headings.ts`:
```ts
export interface TocEntry {
  value: string
  url: string
  depth: number
}

export function parseToc(raw: unknown): TocEntry[] {
  if (Array.isArray(raw)) return raw as TocEntry[]
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as TocEntry[]) : []
    } catch {
      return []
    }
  }
  return []
}

const NUMBERED = /^\s*\d+[.)]\s/

/** True when the author already numbers the h2 sections, so automatic numbering must stay off. */
export function hasNumberedHeadings(toc: readonly TocEntry[]): boolean {
  return toc.some((h) => h.depth === 2 && NUMBERED.test(h.value))
}
```

- [ ] **Step 5: Run the tests and see them pass**

Run: `yarn test`
Expected: all suites PASS (the existing script/component tests too).

- [ ] **Step 6: Lint and commit**

```bash
yarn prettier --write lib/mars lib/tenure.ts lib/tenure.test.ts lib/headings.ts lib/headings.test.ts package.json
yarn eslint lib/mars lib/tenure.ts lib/headings.ts
git add lib/mars/clock.ts lib/mars/format.ts lib/mars/clock.test.ts lib/tenure.ts lib/tenure.test.ts lib/headings.ts lib/headings.test.ts package.json
git commit -m "feat(lib): Mars24 clock, tenure geometry, heading numbering (pure, tested)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Data and strings — project one-liners, career years, UI strings (EN/KO)

**Files:**
- Modify: `data/projectsData.ts`, `data/careerData.ts`, `lib/ui-strings.ts`
- Create: `data/projectsData.test.ts`

**Interfaces (produced):**
```ts
// data/projectsData.ts
export const ORB_KEYS: readonly ['hanji','munch','cheer','fish','invaders','shoulder','defense','gukbap','tracker','sontab']
export type OrbKey = (typeof ORB_KEYS)[number]
export interface Project { /* existing fields */ summary: string; summaryKo: string; orb: OrbKey }
// data/careerData.ts — every entry gains: startYear: number; endYear: number | null; and the type is exported:
export interface Career { company: string; role: string; roleKo?: string; period: string; startYear: number; endYear: number | null; description: string; descriptionKo?: string; techStack?: string[]; imgSrc?: string; href?: string }
// lib/ui-strings.ts
export function fill(template: string, vars: Record<string, string | number>): string
// UIStrings gains: hud, home, tenure, band, notFound, plus new keys in contact, list, projectsPage, about (see Step 5)
```

- [ ] **Step 1: Write the failing data test**

`data/projectsData.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import projectsData, { ORB_KEYS } from './projectsData.ts'

test('every project has short EN/KO one-liners and a known orb', () => {
  assert.equal(projectsData.length, 10)
  const orbs = new Set<string>()
  for (const p of projectsData) {
    assert.ok(p.summary.length > 0 && p.summary.length <= 100, `${p.slug}: summary length ${p.summary.length}`)
    assert.ok(p.summaryKo.length > 0 && p.summaryKo.length <= 80, `${p.slug}: summaryKo length ${p.summaryKo.length}`)
    assert.ok(p.summaryKo.endsWith('니다.'), `${p.slug}: summaryKo must be formal speech`)
    assert.ok((ORB_KEYS as readonly string[]).includes(p.orb), `${p.slug}: unknown orb ${p.orb}`)
    orbs.add(p.orb)
  }
  assert.equal(orbs.size, 10, 'each project has its own orb')
})
```

- [ ] **Step 2: Run it and see it fail**

Run: `yarn test`
Expected: FAIL (`ORB_KEYS` missing / `summary` undefined).

- [ ] **Step 3: Add the fields to `data/projectsData.ts`**

Above `export interface Project`, add:
```ts
export const ORB_KEYS = ['hanji', 'munch', 'cheer', 'fish', 'invaders', 'shoulder', 'defense', 'gukbap', 'tracker', 'sontab'] as const
export type OrbKey = (typeof ORB_KEYS)[number]
```
In `interface Project`, after `descriptionKo?: string`, add:
```ts
  /** One line for the home and the projects list. The long `description` stays on the detail page. */
  summary: string
  summaryKo: string
  orb: OrbKey
```
In each project object, right after its `descriptionKo` line, add exactly these three lines:

| slug | lines to add |
|---|---|
| hanji | `summary: 'A native macOS markdown editor for plain-file vaults, built with SwiftUI and TextKit 2.',` `summaryKo: 'SwiftUI와 TextKit 2로 만든, 마크다운 파일 폴더용 네이티브 macOS 에디터입니다.',` `orb: 'hanji',` |
| more-munch | `summary: 'Picks a fresh office lunch every day from nearby restaurants and your visit history.',` `summaryKo: '주변 식당과 방문 기록을 바탕으로 매일 새로운 점심을 골라 주는 서비스입니다.',` `orb: 'munch',` |
| cheercat | `summary: 'A daily journal for praising yourself, one small ritual at a time.',` `summaryKo: '매일 스스로를 칭찬하는 습관을 만드는 일기 앱입니다.',` `orb: 'cheer',` |
| earth-invaders | `summary: 'A Phaser 3 arcade shooter: hold off the aliens invading Earth.',` `summaryKo: '지구를 침공하는 외계인을 막는 Phaser 3 아케이드 슈팅 게임입니다.',` `orb: 'invaders',` |
| fish-tank-simulator | `summary: 'A pixel-art Pomodoro timer where finished focus sessions grow your aquarium.',` `summaryKo: '집중 세션을 마칠 때마다 수조가 자라는 픽셀아트 뽀모도로 타이머입니다.',` `orb: 'fish',` |
| shoulder-check | `summary: 'A bag-weight calculator for healthier shoulders, with saved bags.',` `summaryKo: '어깨 건강을 위해 가방 무게를 계산하고 저장해 두는 웹 앱입니다.',` `orb: 'shoulder',` |
| first-defense | `summary: 'A 2.5D roguelite tower-defense prototype in Godot 4.6, built around unit combos.',` `summaryKo: '유닛 조합을 중심으로 설계한 Godot 4.6 기반 2.5D 로그라이트 타워 디펜스 프로토타입입니다.',` `orb: 'defense',` |
| gukbap-tools | `summary: '90+ free Korean web tools for office and daily life. No login, no install.',` `summaryKo: '로그인과 설치 없이 바로 쓰는 무료 웹 도구 90여 개 모음입니다.',` `orb: 'gukbap',` |
| side-project-tracker | `summary: "A macOS app that tracks every side project's stage and staleness in one window.",` `summaryKo: '모든 사이드 프로젝트의 단계와 방치 여부를 한 창에서 보여 주는 macOS 앱입니다.',` `orb: 'tracker',` |
| sontab | `summary: 'A lightweight OneTab-style tab manager for Chrome. Local-only, no tracking.',` `summaryKo: '로컬에만 저장하고 추적하지 않는 가벼운 OneTab 스타일 크롬 탭 매니저입니다.',` `orb: 'sontab',` |

- [ ] **Step 4: Add career years to `data/careerData.ts`**

Change `interface Career` to `export interface Career` and add after `period: string`:
```ts
  /** Whole years only (no months are recorded); `endYear: null` means current. */
  startYear: number
  endYear: number | null
```
Add to the entries: UJET `startYear: 2024, endYear: null,` · TomorrowUse `startYear: 2021, endYear: 2023,` · Miso `startYear: 2020, endYear: 2021,` (each right after its `period` line).

- [ ] **Step 5: Add UI strings to `lib/ui-strings.ts`**

1) Below the `Lang` type, add:
```ts
/** Replace {name} placeholders: fill('{n} posts', { n: 69 }) → '69 posts'. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}
```
2) Extend `interface UIStrings`:
```ts
  hud: { live: string; lmst: string; mtc: string; msd: string; season: string; light: string; northern: string; seasons: { spring: string; summer: string; autumn: string; winter: string } }
  home: { projects: string; posts: string; experience: string }
  tenure: { label: string; hint: string; now: string; readout: string }
  band: { posts: string; projects: string; tags: string; writingLog: string; postCount: string; tagCount: string; latest: string; sideProjects: string; projectCount: string; appsCount: string; gamesCount: string }
  notFound: { eyebrow: string; noSignal: string; title: string; body: string; mars: string; home: string; posts: string }
```
and add keys to existing groups: `contact` gets `seoul: string; mars: string`; `list` gets `allTags: string; readGauge: string; pageOf: string; filterByTag: string; latestPosts: string`; `projectsPage` gets `intro: string; sunHint: string; kind: string; source: string; figure: string; previous: string; next: string`; `about` gets `name: string; globeLabel: string; litAt: string; subsolar: string; jezeroTime: string; season: string; faceSun: string; faceJezero: string; drag: string`.

3) Values. `en`:
```ts
    hud: {
      live: 'Live · Jezero Crater 18.44°N 77.45°E',
      lmst: 'Local solar time',
      mtc: 'Coordinated Mars time',
      msd: 'Mars sol date',
      season: 'Season',
      light: 'Earth → Mars light time',
      northern: 'northern',
      seasons: { spring: 'spring', summer: 'summer', autumn: 'autumn', winter: 'winter' },
    },
    home: { projects: 'Projects', posts: 'Recent posts', experience: 'Experience' },
    tenure: {
      label: 'Career timeline, 2020 to now',
      hint: 'Bars run from the start year to the end year. Hover or tap the timeline, or focus it and use the arrow keys, to read any year.',
      now: 'Now',
      readout: '{year} · {roles}',
    },
    band: {
      posts: 'Posts',
      projects: 'Projects',
      tags: 'Tags',
      writingLog: 'Writing log',
      postCount: '{n} posts',
      tagCount: '{n} tags',
      latest: 'latest {date}',
      sideProjects: 'Side projects',
      projectCount: '{n} projects',
      appsCount: '{n} apps & tools',
      gamesCount: '{n} games',
    },
    notFound: {
      eyebrow: 'Error 404',
      noSignal: 'No signal at this address',
      title: 'Signal lost',
      body: 'There is no page at this address. It may have moved, or it was never written.',
      mars: 'Even a reply from Mars takes {d} right now. This page is not on its way.',
      home: '← Back home',
      posts: 'Browse posts',
    },
```
plus in `contact`: `seoul: 'It is {time} in Seoul (UTC+9).', mars: 'A message to Mars would take {d} right now.',`
in `list`: `allTags: 'All {n} tags →', readGauge: '{n} min read', pageOf: '{current} / {total}', filterByTag: 'Filter by tag', latestPosts: 'Latest posts',`
in `projectsPage`: `intro: "Things I've built.", sunHint: 'Your pointer is the Sun for every planet on this page.', kind: 'Kind', source: 'Source', figure: 'Fig. 1', previous: 'Previous', next: 'Next',`
in `about`: `name: 'SeongHwa Lee', globeLabel: 'Mars as lit by the Sun right now', litAt: 'Mars as lit at {time} UTC', subsolar: 'Subsolar point', jezeroTime: 'Jezero local time', season: 'Season', faceSun: 'Face the Sun', faceJezero: 'Face Jezero', drag: 'Drag to rotate',`

`ko`:
```ts
    hud: {
      live: '실시간 · 제제로 크레이터 18.44°N 77.45°E',
      lmst: '현지 태양시',
      mtc: '화성 협정시',
      msd: '화성 솔 날짜',
      season: '계절',
      light: '지구 → 화성 빛 도달 시간',
      northern: '북반구',
      seasons: { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' },
    },
    home: { projects: '프로젝트', posts: '최근 글', experience: '경력' },
    tenure: {
      label: '경력 타임라인, 2020년부터 지금까지',
      hint: '막대는 시작 연도부터 종료 연도까지입니다. 타임라인에 마우스를 올리거나 탭하고, 포커스한 뒤 방향키로 연도를 읽을 수 있습니다.',
      now: '현재',
      readout: '{year} · {roles}',
    },
    band: {
      posts: '글',
      projects: '프로젝트',
      tags: '태그',
      writingLog: '글 기록',
      postCount: '글 {n}편',
      tagCount: '태그 {n}개',
      latest: '최근 {date}',
      sideProjects: '사이드 프로젝트',
      projectCount: '프로젝트 {n}개',
      appsCount: '앱·도구 {n}개',
      gamesCount: '게임 {n}개',
    },
    notFound: {
      eyebrow: '오류 404',
      noSignal: '이 주소에서는 신호가 없습니다',
      title: '신호 끊김',
      body: '이 주소에는 페이지가 없습니다. 옮겨졌거나 아직 쓰이지 않은 페이지입니다.',
      mars: '지금은 화성에서 오는 답장도 {d} 걸립니다. 이 페이지는 오고 있지 않습니다.',
      home: '← 홈으로',
      posts: '글 둘러보기',
    },
```
plus in `contact`: `seoul: '서울은 지금 {time}입니다(UTC+9).', mars: '지금 화성에 메시지를 보내면 {d} 걸립니다.',`
in `list`: `allTags: '태그 {n}개 전체 →', readGauge: '{n}분 분량', pageOf: '{current} / {total}', filterByTag: '태그로 거르기', latestPosts: '최근 글',`
in `projectsPage`: `intro: '직접 만든 것들입니다.', sunHint: '커서가 이 페이지 모든 행성의 태양입니다.', kind: '종류', source: '소스', figure: '그림 1', previous: '이전', next: '다음',`
in `about`: `name: '이성화', globeLabel: '지금 태양 빛을 받는 화성', litAt: '{time} UTC 기준 화성', subsolar: '태양 직하점', jezeroTime: '제제로 현지 시각', season: '계절', faceSun: '해 쪽 보기', faceJezero: '제제로 보기', drag: '끌어서 돌리기',`

- [ ] **Step 6: Run tests, typecheck, lint**

Run: `yarn test` → PASS. Run: `npx tsc --noEmit -p .` → no errors (TypeScript will flag any missing `summary`/`startYear`). Run: `yarn eslint data lib/ui-strings.ts`.

- [ ] **Step 7: Commit**

```bash
yarn prettier --write data/projectsData.ts data/projectsData.test.ts data/careerData.ts lib/ui-strings.ts
git add data/projectsData.ts data/projectsData.test.ts data/careerData.ts lib/ui-strings.ts
git commit -m "feat(data): project one-liners and orbs, career years, Red Horizon UI strings (EN/KO)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Foundation — fonts, Red Horizon CSS, layout, header, footer, band, orbs

**Files:**
- Create: `css/red-horizon.css`, `components/hooks/useDarkTheme.ts`, `components/HorizonBand.tsx`, `components/ProjectOrb.tsx`, `components/MarsLightTime.tsx`
- Modify: `css/tailwind.css`, `app/layout.tsx`, `components/Header.tsx`, `components/Footer.tsx`, `components/SectionContainer.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/posts/page.tsx`, `app/posts/page/[page]/page.tsx`, `app/tags/page.tsx`, `app/tags/[tag]/page.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/climate/page.tsx`, `app/praisecat/page.tsx`, `app/not-found.tsx`, `layouts/PostLayout.tsx` (only the temporary wrapper in Step 9)

**Interfaces (produced):**
```ts
export function useDarkTheme(): boolean                       // components/hooks/useDarkTheme.ts
export function watchDarkTheme(cb: (dark: boolean) => void): () => void  // same file; for non-React renderers
export default function HorizonBand(props: { title?: string; titleKo?: string; dot?: boolean; tele?: ReactNode; variant?: 'monument' | 'headline' | 'slim'; aside?: ReactNode; children?: ReactNode; headingId?: string }): JSX.Element
export default function ProjectOrb(props: { orb: OrbKey; size?: 'row' | 'hero' }): JSX.Element
export default function MarsLightTime(props: { variant: 'contact' | 'notFound' }): JSX.Element
// CSS: .rh-page (sets --rh-serif body font), .rh-wrap, .rh-sec, .rh-sec-head, .rh-sec-no, .rh-sec-link, .rh-chip, .rh-meta, .rh-tile, .rh-orb, .rh-orb-ring, .rh-o-<key>, .rh-band*, .rh-monument, .rh-tagchip, .rh-proj*, .rh-contact, .rh-status, .rh-foot, .rh-head and children
```

- [ ] **Step 1: Fonts in `app/layout.tsx`**

Replace the font imports and constants with:
```tsx
import { Archivo, JetBrains_Mono, Newsreader } from 'next/font/google'

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
  variable: '--font-archivo',
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
and use `className={`${archivo.variable} ${jetbrains_mono.variable} ${newsreader.variable} scroll-smooth`}` on `<html>`. (Space Grotesk was declared but never applied, see spec §3.2; it goes away.)

- [ ] **Step 2: Layout structure in `app/layout.tsx`**

Replace the `<body>…</body>` element with:
```tsx
      <body className="bg-paper text-ink antialiased" suppressHydrationWarning>
        <ThemeProviders>
          <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
          <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
            <Header />
            <main id="main">{children}</main>
          </SearchProvider>
          <Footer />
        </ThemeProviders>
      </body>
```
Remove the `SectionContainer` import from this file. Leave metadata, `<link>`s and `<meta>`s untouched.

- [ ] **Step 3: `css/tailwind.css`**

1. Directly under `@import 'tailwindcss';` add `@import './red-horizon.css';`.
2. Delete the line `--font-family-sans: var(--font-space-grotesk), …;` inside `@theme` (dead key; it references a removed font).
3. Change nothing else in this file.

- [ ] **Step 4: Create `css/red-horizon.css` (tokens + shared system)**

Write the file in this order. Apply the Global Constraints CSS rules (rename `--x` → `--rh-x`, `.x` → `.rh-x`, dark only in `html.dark`).

1. Tokens — light on `:root`, dark on `html.dark`:
   - from `REF/site.css` lines 4–7 (`--paper` … `--monument`, `--gutter`, `--col`) and lines 9–17 (dark values);
   - fonts: `--rh-display: var(--font-archivo), 'Archivo', 'Arial Black', 'Helvetica Neue', Arial, sans-serif; --rh-serif: var(--font-newsreader), '42dot Sans', Georgia, 'Times New Roman', serif; --rh-mono: var(--font-jetbrains), '42dot Sans', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;`
   - `--rh-accent-text: #9a3412` (dark `#f6ab83`);
   - band tokens from `REF/inner/inner.css` lines 2–7 (light) and 9–14 (dark): `--sun-x … --orb-ly` → `--rh-sun-x … --rh-orb-ly`.
2. `.rh-page { font: 400 17px/1.55 var(--rh-serif); color: var(--rh-ink); }` (REF set this on `body`; we scope it to Red Horizon pages so KB and climate keep their fonts).
3. Header — port `REF/site.css` lines 31–44 (`.site-head` … `@media (max-width:760px)`), renaming `.site-head` → `.rh-head`, `.wordmark` → `.rh-wordmark`, `.nav` → `.rh-nav`, `.tools` → `.rh-tools`, `.lang` → `.rh-lang`, `.icon-btn` → `.rh-icon-btn`, `.menu-btn` → `.rh-menu-btn`. Add: `.rh-nav a[aria-current="page"] { color: var(--rh-accent); }`. Change REF's `@media (max-width:760px)` breakpoint for hiding `.rh-nav` to `@media (max-width: 639px)`: the existing `MobileNav` button is `sm:hidden` (shown only below 640px), so both must switch at the same width or the nav disappears between 640 and 760px. REF's `.rh-menu-btn` rules are not needed (MobileNav renders its own button).
4. Editorial column + sections — `REF/site.css` lines 46–55 (`.wrap`, `.sec`, `.sec-head`, `.sec-no`, `.sec-head h2`, `.sec-link`, `.chip`, `.meta`) → `.rh-wrap`, `.rh-sec`, `.rh-sec-head`, `.rh-sec-no`, `.rh-sec-link`, `.rh-chip`, `.rh-meta`.
5. Orbs — `REF/site.css` lines 57–67 (`.tile`, `.orb`, `.orb i`, `.orb::after`, `.ring`, `.ring.front`, `.o-hanji`, `.o-munch`, `.o-cheer`, `.o-fish`) then `REF/inner/inner.css` lines 71–81 (pointer-lit `.orb` override with `--lx/--ly`, renamed `--rh-lx/--rh-ly`, `.o-invaders`, `.o-shoulder`, `.o-defense`, `.o-gukbap`, `.o-tracker`, `.o-sontab`, `.moonlet`) → `.rh-tile`, `.rh-orb`, `.rh-orb-ring`, `.rh-o-<key>`, `.rh-moonlet`.
6. Project rows — `REF/inner/inner.css` lines 54–70 (`.proj`, `.proj-row` …, `.proj-stack`, and its media queries) → `.rh-proj…`.
7. Band — `REF/inner/inner.css` lines 21–47 (`.band` … `.monument`, keyframes `dust`, `ping`, `settle` renamed `rh-dust`, `rh-ping`, `rh-settle`) → `.rh-band`, `.rh-band-sky`, `.rh-band-far`, `.rh-band-ground`, `.rh-band-inner`, `.rh-band-tele`, `.rh-monument`. Add the two variants:
   ```css
   .rh-band--headline .rh-monument { /* = REF/post.html .ptitle (amended after Task 3 review) */ margin: 0 0 .04em; max-width: 21ch; font-stretch: 100%; font-weight: 700; font-size: clamp(31px, 4.3vw, 58px); line-height: 1.05; letter-spacing: -.022em; white-space: normal; text-wrap: balance; text-transform: none; animation: rh-rise-in 1s cubic-bezier(.2,.7,.1,1) both; }  @keyframes rh-rise-in { from { transform: translateY(10px); } }
   .rh-band--slim { min-height: clamp(150px, 20vh, 190px); }
   .rh-band-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 24px clamp(24px, 4vw, 56px); }
   .rh-band-row > :first-child { min-width: 0; }
   @media (max-width: 760px) { .rh-band-row { grid-template-columns: minmax(0, 1fr); } }
   ```
8. Column helpers — `REF/inner/inner.css` lines 48–53 (`.lede`, `.status`, `.tagchip`) → `.rh-lede`, `.rh-status`, `.rh-tagchip`.
9. Contact strip + foot — `REF/site.css` lines 70–78 (`.contact` … `.foot`) → `.rh-contact`, `.rh-status`, `.rh-foot`; and the relay styles from `REF/index.html` lines 127–142 (`/* contact: a relay … */`) → `.rh-contact …`. Add `.rh-footer { font-family: var(--rh-serif); }` and `.rh-live-line { flex-basis: 100%; margin: 0; font: 500 12px/1.5 var(--rh-mono); color: var(--rh-muted); }`.
10. Reduced motion: `@media (prefers-reduced-motion: reduce) { [class^="rh-"], [class*=" rh-"], [class^="rh-"]::before, [class^="rh-"]::after { animation: none !important; transition: none !important; } }`.

Check: `grep -nE '^\s*\.[a-z]' css/red-horizon.css | grep -v '\.rh-'` prints nothing except selectors nested after an `.rh-` class (e.g. `.rh-band-tele .sep` → rename to `.rh-band-tele .rh-sep` so the check prints nothing). `grep -n 'prefers-color-scheme\|data-theme' css/red-horizon.css` prints nothing.

- [ ] **Step 5: `components/hooks/useDarkTheme.ts`**

```ts
'use client'

import { useEffect, useState } from 'react'

const isDarkNow = (): boolean => document.documentElement.classList.contains('dark')

/** Calls `cb` whenever next-themes flips the `dark` class on <html>. Returns an unsubscribe function. */
export function watchDarkTheme(cb: (dark: boolean) => void): () => void {
  const root = document.documentElement
  let last = isDarkNow()
  const obs = new MutationObserver(() => {
    const now = isDarkNow()
    if (now !== last) {
      last = now
      cb(now)
    }
  })
  obs.observe(root, { attributes: true, attributeFilter: ['class'] })
  return () => obs.disconnect()
}

/** React state that follows the site theme (false during SSR and the first client render). */
export function useDarkTheme(): boolean {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    setDark(isDarkNow())
    return watchDarkTheme(setDark)
  }, [])
  return dark
}
```

- [ ] **Step 6: `components/MarsLightTime.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { marsClock } from '@/lib/mars/clock'
import { formatLightTime } from '@/lib/mars/format'
import { fill } from '@/lib/ui-strings'
import { useUI } from './useUI'
import { useLanguage } from './LanguageProvider'

const seoulTime = (d: Date): string =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }).format(d)

/** Live sentence: Seoul time + Earth→Mars light time. Renders nothing until mounted (no build-time values). */
export default function MarsLightTime({ variant }: { variant: 'contact' | 'notFound' }) {
  const ui = useUI()
  const { lang } = useLanguage()
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  if (!now) return <span className="rh-live-placeholder" aria-hidden="true" />
  const d = formatLightTime(marsClock(now.getTime()).lightSec, lang)
  if (variant === 'notFound') return <span>{fill(ui.notFound.mars, { d })}</span>
  return (
    <span>
      {fill(ui.contact.seoul, { time: seoulTime(now) })} {fill(ui.contact.mars, { d })}
    </span>
  )
}
```

- [ ] **Step 7: Header — `components/Header.tsx`**

```tsx
'use client'

import { usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageToggle from './LanguageToggle'
import { useUI } from './useUI'
import type { UIStrings } from '@/lib/ui-strings'

const navLabel = (ui: UIStrings, href: string, fallback: string): string => {
  if (href === '/projects') return ui.nav.projects
  if (href === '/posts') return ui.nav.writing
  if (href === '/kb') return ui.nav.notes
  if (href === '/about') return ui.nav.about
  return fallback
}

const isCurrent = (pathname: string, href: string): boolean => {
  if (href === '/posts') return /^\/(posts|tags|ko\/posts)(\/|$)/.test(pathname)
  return pathname === href || pathname.startsWith(href + '/')
}

const Header = () => {
  const ui = useUI()
  const pathname = usePathname() ?? '/'
  return (
    <header className="rh-head site-chrome-header">
      <Link href="/" aria-label={siteMetadata.headerTitle} className="rh-wordmark">
        ML<span>.</span>
      </Link>
      <div className="rh-tools">
        <nav className="rh-nav" aria-label="Site">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
            >
              {navLabel(ui, link.href, link.title)}
            </Link>
          ))}
          <a className="rh-cv" href={siteMetadata.linkedin}>
            {ui.cv}
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
In `css/red-horizon.css` add: `.rh-nav .rh-cv { color: var(--rh-accent); }` and size the existing icon buttons inside the header: `.rh-tools button svg { width: 18px; height: 18px; }`. `ThemeSwitch`, `SearchButton`, `MobileNav`, `LanguageToggle` keep their behavior; only their icon size changes through that rule.

- [ ] **Step 8: Footer — `components/Footer.tsx`**

Port the relay interaction from `REF/index.html` lines 839–858 into the effect below (it draws a pulse from the status text to the hovered/focused link; keep its CSS classes renamed with `rh-`).
```tsx
'use client'

import { useEffect, useRef } from 'react'
import siteMetadata from '@/data/siteMetadata'
import MarsLightTime from './MarsLightTime'
import { useUI } from './useUI'

export default function Footer() {
  const ui = useUI()
  const contactRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const contact = contactRef.current
    if (!contact) return
    // Port REF/index.html lines 839–858 here, using `contact` instead of document.getElementById('contact'),
    // `contact.querySelector('.rh-wire')` for the wire and `contact.querySelector('.rh-status')` for the source.
    // Register listeners on `contact` and remove them in the cleanup you return.
    return () => {}
  }, [])
  return (
    <footer className="rh-footer site-chrome-footer">
      <div className="rh-wrap">
        <section className="rh-contact" id="contact" aria-label="Contact" ref={contactRef}>
          <span className="rh-wire" aria-hidden="true" />
          <p className="rh-status">
            <i aria-hidden="true" />
            {ui.contact.open}
          </p>
          <nav aria-label="Contact links">
            <a href={`mailto:${siteMetadata.email}`}>{ui.contact.email}</a>
            <a href={siteMetadata.github}>GitHub ↗</a>
            <a href={siteMetadata.linkedin}>LinkedIn ↗</a>
          </nav>
          <p className="rh-live-line">
            <MarsLightTime variant="contact" />
          </p>
        </section>
        <div className="rh-foot">
          <span>
            © {new Date().getFullYear()} {siteMetadata.author}
          </span>
          <span>{ui.footer.location}</span>
        </div>
      </div>
    </footer>
  )
}
```
Replace the comment in the effect with the ported code (do not leave the comment). The `.rh-wire` element and its CSS come from `REF/index.html` lines 127–142 and the markup at lines 282–287.

- [ ] **Step 9: `components/HorizonBand.tsx`, `components/ProjectOrb.tsx`, `components/SectionContainer.tsx`**

`components/HorizonBand.tsx` (SVG paths copied from `REF/inner/build.py` `BAND_SKY` / `BAND_GROUND`):
```tsx
'use client'

import type { ReactNode } from 'react'
import { useLanguage } from './LanguageProvider'

interface HorizonBandProps {
  title?: string
  titleKo?: string
  dot?: boolean
  tele?: ReactNode
  variant?: 'monument' | 'headline' | 'slim'
  aside?: ReactNode
  children?: ReactNode
  headingId?: string
}

export default function HorizonBand({ title, titleKo, dot = true, tele, variant = 'monument', aside, children, headingId = 'page-title' }: HorizonBandProps) {
  const { lang } = useLanguage()
  const text = lang === 'ko' && titleKo ? titleKo : title
  const slim = variant === 'slim'
  return (
    <section
      className={`rh-band rh-band--${variant}`}
      aria-labelledby={!slim && text ? headingId : undefined}
      aria-hidden={slim ? true : undefined}
    >
      <div className="rh-band-sky" aria-hidden="true" />
      <svg className="rh-band-far" viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className="rh-f1" d="M0 100V62h64l14-10h118l12 8h96l18-14h120l12 10h112l26-16h116l14 12h104l14-8h126l16 10h96l12-8h86l14 8h36v46z" />
        <path className="rh-f2" d="M0 100V80c56-4 108-3 156-7l16-24h112l18 22c64 6 128 9 200 6s128-8 196-5l20-38h138l18 30c62 7 128 11 196 5l18-14h112v45z" />
      </svg>
      {!slim && (
        <div className="rh-band-inner">
          <div className={aside ? 'rh-band-row' : undefined}>
            <div>
              {tele && <p className="rh-band-tele">{tele}</p>}
              {children}
              {text && (
                <h1 className="rh-monument" id={headingId}>
                  {text}
                  {dot && <span className="rh-dot">.</span>}
                </h1>
              )}
            </div>
            {aside}
          </div>
        </div>
      )}
      <div className="rh-band-ground" aria-hidden="true">
        <svg viewBox="0 0 1200 12" preserveAspectRatio="none" focusable="false">
          <path d="M0 12V7c120-4 240-4 360-1s240 4 360 0 240-5 360-1l120 1v6z" />
        </svg>
      </div>
    </section>
  )
}
```
`.rh-band-far .f1/.f2` in the ported CSS become `.rh-band-far .rh-f1/.rh-f2`.

`components/ProjectOrb.tsx`:
```tsx
import type { OrbKey } from '@/data/projectsData'

/** Procedural planet for a project. CheerCat has a ring; Side Project Tracker has moonlets (REF/inner/inner.css .moonlet). */
export default function ProjectOrb({ orb, size = 'row' }: { orb: OrbKey; size?: 'row' | 'hero' }) {
  return (
    <span className={`rh-tile rh-tile--${size}`} aria-hidden="true">
      {orb === 'cheer' && <span className="rh-orb-ring" />}
      <span className={`rh-orb rh-o-${orb}`}>
        <i />
      </span>
      {orb === 'cheer' && <span className="rh-orb-ring rh-front" />}
      {orb === 'tracker' && (
        <>
          <span className="rh-moonlet rh-m1" />
          <span className="rh-moonlet rh-m2" />
        </>
      )}
    </span>
  )
}
```
Match the ring/moonlet markup to the REF pages (`REF/index.html` projects list markup lines 205–229 and `REF/inner/projects.src.html`); if REF positions moonlets with other class names, port those names with `rh-`. `.ring.front` becomes `.rh-orb-ring.rh-front`.

`components/SectionContainer.tsx`:
```tsx
import { ReactNode } from 'react'

export default function SectionContainer({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-[1100px] px-5 sm:px-8 xl:px-0">{children}</section>
}
```
(unchanged markup; keep it, because pages that are not migrated yet need it as a wrapper.)

- [ ] **Step 10: Keep not-yet-migrated pages inside a container**

The root layout no longer wraps pages. Until each page is rebuilt (Tasks 4–10), wrap the returned JSX of these files in `<SectionContainer>…</SectionContainer>` (import from `@/components/SectionContainer`): `app/page.tsx`, `app/about/page.tsx`, `app/posts/page.tsx`, `app/posts/page/[page]/page.tsx`, `app/tags/page.tsx`, `app/tags/[tag]/page.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/climate/page.tsx`, `app/praisecat/page.tsx`, `app/not-found.tsx`. `PostLayout` already wraps itself in `SectionContainer`; leave it. Do not touch anything under `app/kb` or `app/notes`.

- [ ] **Step 11: Build, check KB, check the chrome**

```bash
yarn lint && yarn test && yarn build
git status --short   # restore app/kb-data.json, app/tag-data.json, public/search.json if listed
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task3-kb /kb.html,/kb/graph.html,/kb/2026-09-28-request-layers.html --only=desktop-light,desktop-dark,mobile-light --wait=2000
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task3 /,/about.html,/posts.html --only=desktop-light,mobile-light --wait=1500
```
Also measure the Archivo font the build emitted: `ls -la out/_next/static/media/*.woff2` and identify Archivo's file(s) (largest new latin file; `grep -l "Archivo" out/_next/static/chunks/*.css` shows the CSS that references them). Report the size in your summary; if the latin Archivo file is over 80 KB, say so (the controller decides on the static-instance fallback from spec §3.2; do not change it yourself).

Expected: lint/test/build pass; "all shots clean". Compare each `task3-kb/*.png` with the same file name in `.superpowers/sdd/shots/kb-baseline/` (open both with the Read tool): they must look identical. If KB lost its full-screen layout or fonts, fix it with rules scoped to `body.kb-active` (never by changing KB components). The other pages show the new header (ML. wordmark, mono nav) and the new footer (contact strip with the live Seoul/Mars sentence, foot line); their bodies still look old.

- [ ] **Step 12: Commit**

```bash
git add css/red-horizon.css css/tailwind.css app components/hooks/useDarkTheme.ts components/HorizonBand.tsx components/ProjectOrb.tsx components/MarsLightTime.tsx components/Header.tsx components/Footer.tsx components/SectionContainer.tsx
git commit -m "feat(ui): Red Horizon foundation: rh- design system, Archivo, header over the band, global contact footer" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 404, tags index, climate and praisecat bands

**Files:**
- Create: `components/NotFoundView.tsx`
- Modify: `app/not-found.tsx`, `app/tags/page.tsx`, `app/climate/page.tsx`, `app/praisecat/page.tsx`, `css/red-horizon.css`

**Interfaces:** Consumes `HorizonBand`, `MarsLightTime`, `useUI`, `fill`. Produces nothing new.

- [ ] **Step 1: 404**

Port the page CSS of `REF/inner/404.src.html` (its `<style>` block: lander silhouette, beacon blink, buttons) into `css/red-horizon.css` under `/* 404 */` with `rh-` names, plus `REF/inner/inner.css` `.btn`/`.btn--accent` → `.rh-btn`/`.rh-btn--accent` if not ported yet. Copy the lander `<svg>` markup from `REF/inner/404.src.html` into the `aside` below.

`components/NotFoundView.tsx`:
```tsx
'use client'

import Link from './Link'
import HorizonBand from './HorizonBand'
import MarsLightTime from './MarsLightTime'
import { useUI } from './useUI'

export default function NotFoundView() {
  const ui = useUI()
  return (
    <div className="rh-page">
      <HorizonBand
        title={ui.notFound.title}
        tele={
          <>
            <span className="rh-live"><i aria-hidden="true" />{ui.notFound.eyebrow}</span>
            <span className="rh-sep" aria-hidden="true">·</span>
            <span>{ui.notFound.noSignal}</span>
          </>
        }
        aside={<svg className="rh-lander" viewBox="0 0 160 120" aria-hidden="true" focusable="false">{/* paths from REF/inner/404.src.html */}</svg>}
      />
      <div className="rh-wrap">
        <p className="rh-nf-body">{ui.notFound.body}</p>
        <p className="rh-nf-mars"><MarsLightTime variant="notFound" /></p>
        <p className="rh-nf-actions">
          <Link className="rh-btn rh-btn--accent" href="/">{ui.notFound.home}</Link>
          <Link className="rh-btn" href="/posts">{ui.notFound.posts}</Link>
        </p>
      </div>
    </div>
  )
}
```
Replace the JSX comment with the copied `<path>`/`<rect>` elements (React attribute names). REF splits the title onto two lines (SIGNAL / LOST.); reproduce that with CSS (`.rh-band .rh-monument { max-width: 6.2ch; white-space: normal }` scoped to a `.rh-band--404` modifier you add via a `className` prop or a wrapper class). `app/not-found.tsx` becomes:
```tsx
import NotFoundView from '@/components/NotFoundView'

export default function NotFound() {
  return <NotFoundView />
}
```

- [ ] **Step 2: Tags index (`app/tags/page.tsx`)**

Keep `metadata` and the tag sorting. Render (server component; `HorizonBand` is a client component and can be used from here):
```tsx
    <div className="rh-page">
      <HorizonBand title="Tags" titleKo="태그" tele={<span>{sortedTags.length} tags</span>} />
      <div className="rh-wrap">
        <ul className="rh-tagcloud">
          {sortedTags.map((t) => (
            <li key={t}>
              <Link href={`/tags/${slug(t)}`} className="rh-tagchip" aria-label={`View posts tagged ${t}`}>
                {t.split(' ').join('-')}
                <span>{tagCounts[t]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
```
Add `.rh-tagcloud { list-style: none; margin: clamp(30px, 4vw, 48px) 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }` and `.rh-tagchip span { margin-left: 6px; opacity: .65; font-variant-numeric: tabular-nums; }`. Remove this page's temporary `SectionContainer`.

- [ ] **Step 3: climate and praisecat**

`app/climate/page.tsx`: render `<HorizonBand variant="slim" />` first, then the existing content inside `<SectionContainer>` (keep everything else as is).
`app/praisecat/page.tsx`: stop using `AuthorLayout`. Render `<HorizonBand variant="slim" />`, then `<SectionContainer><div className="prose max-w-none pt-10 pb-16">…the existing h1/h2/p children…</div></SectionContainer>`. Remove the now-unused imports (`AuthorLayout`, `allAuthors`, `coreContent`, `MDXLayoutRenderer` if unused).

- [ ] **Step 4: Verify**

```bash
yarn lint && yarn build
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task4 /404.html,/tags.html,/climate.html,/praisecat.html --ko --wait=1500
```
Expected: "all shots clean" except the pre-existing `THREE.Material: parameter 'color'` warning on /climate (it exists on main; note it, do not fix it here). Read the PNGs: 404 shows SIGNAL / LOST. with the lander and a live sentence; KO shows 신호 끊김; tags shows the TAGS. band and the cloud; climate and praisecat start with a short sky strip under the header.

- [ ] **Step 5: Commit**

```bash
git add components/NotFoundView.tsx app/not-found.tsx app/tags/page.tsx app/climate/page.tsx app/praisecat/page.tsx css/red-horizon.css
git commit -m "feat(ui): Red Horizon 404, tags index, slim bands on climate and praisecat" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Home hero — MarsHorizon, horizon renderer, live HUD

**Files:**
- Create: `components/home/MarsHorizon.tsx`, `components/home/MarsHud.tsx`, `lib/mars/horizon-renderer.ts`
- Modify: `app/page.tsx`, `css/red-horizon.css`
- Delete: `components/home/Masthead.tsx`

**Interfaces:**
```ts
// lib/mars/horizon-renderer.ts  (no React, no module-scope DOM)
export interface HorizonElements { hero: HTMLElement; canvas: HTMLCanvasElement; fallback: SVGSVGElement; title: HTMLElement }
export interface HorizonHandle { destroy(): void }
export function mountHorizon(el: HorizonElements, opts: { reducedMotion: boolean; dark: boolean }): HorizonHandle
// components/home/MarsHud.tsx
export default function MarsHud(): JSX.Element
// components/home/MarsHorizon.tsx
export default function MarsHorizon(): JSX.Element
```

- [ ] **Step 1: Hero CSS**

Port `REF/index.html` lines 11–42 (`/* hero (unchanged from A) */`) into `css/red-horizon.css` under `/* home hero */`: `.hero` → `.rh-hero`, `.sky` → `.rh-sky`, `.title` → `.rh-title`, `.eyebrow` → `.rh-eyebrow`, `.nw` → `.rh-nw`, `.bl` → `.rh-bl`, `.br` → `.rh-br`, `.dot` (inside `.rh-title h1`) → `.rh-dot`, `#mars` → `.rh-mars-canvas`, `.dunes` → `.rh-dunes`, `.fade` → `.rh-fade`, `.lead` → `.rh-lead`, `.hero-foot` → `.rh-hero-foot`, `.cta` → `.rh-cta`, `.cta-main` → `.rh-cta-main`, `.hud` → `.rh-hud`, `.live` → `.rh-live`, `.opt` → `.rh-opt`, `.w1/.w2` → `.rh-w1/.rh-w2`; keyframes: REF's hero `settle` (`.012em` → `-.03em`, REF/index.html line 21) differs from the inner `rh-settle` (`.01em` → `-.035em`), so port it as its own `@keyframes rh-hero-settle` with REF's values; compare REF's hero `ping` with the existing `rh-ping` and reuse it only if identical. Tokens it needs (`--sky-*`, `--far`, `--sand-d`, `--monument`) are the `--rh-` ones from Task 3. The hero sits under the absolute global header, so drop REF's `.site-head` inside the hero.

- [ ] **Step 2: `components/home/MarsHud.tsx`**

Port `REF/index.html` lines 333–352 (live telemetry) into a component. Markup = REF lines 188–200 (`<aside class="hud">`), with labels from `ui.hud`.
```tsx
'use client'

import { useEffect, useState } from 'react'
import { marsClock, type MarsClock } from '@/lib/mars/clock'
import { formatClock, formatLightTime, formatMsd } from '@/lib/mars/format'
import { useUI } from '../useUI'
import { useLanguage } from '../LanguageProvider'

export default function MarsHud() {
  const ui = useUI()
  const { lang } = useLanguage()
  const [c, setC] = useState<MarsClock | null>(null)
  useEffect(() => {
    const tick = () => setC(marsClock(Date.now()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  const dash = '—'
  return (
    <aside className="rh-hud" aria-label="Live Mars telemetry">
      <p className="rh-live"><i aria-hidden="true" />{ui.hud.live}</p>
      <dl>
        <dt>{ui.hud.lmst}</dt>
        <dd>{c ? formatClock(c.lmstJezero) : dash}</dd>
        <dt className="rh-opt">{ui.hud.mtc}</dt>
        <dd className="rh-opt">{c ? formatClock(c.mtc) : dash}</dd>
        <dt className="rh-opt">{ui.hud.msd}</dt>
        <dd className="rh-opt">{c ? formatMsd(c.msd) : dash}</dd>
        <dt>{ui.hud.season}</dt>
        <dd>
          {c ? `MY ${c.my} · Ls ${c.ls.toFixed(1)}°` : dash}
          {c && <span className="rh-opt"> · {ui.hud.northern} {ui.hud.seasons[c.season]}</span>}
        </dd>
        <dt>{ui.hud.light}</dt>
        <dd>{c ? formatLightTime(c.lightSec, lang) : dash}</dd>
      </dl>
    </aside>
  )
}
```
If REF formats any value differently (e.g. seconds on LMST), follow REF.

- [ ] **Step 3: `lib/mars/horizon-renderer.ts`**

Port `REF/index.html` lines 353–690 (the IIFE starting `/* the horizon: one fragment shader */`) into `mountHorizon(el, opts)`:
- Keep `VS`, `FS` (lines 378–497) verbatim as string constants at module scope (strings are fine at module scope; DOM is not).
- Replace `document.getElementById('hero'|'mars'|'dunes-fallback')` with `el.hero`, `el.canvas`, `el.fallback`; the title measurement (`measure()`, lines 567–585) reads `el.title` and the `.rh-w1`, `.rh-w2`, `.rh-bl` spans inside it.
- Replace REF `isDark()`/`onTheme()` (lines 357–369) with `opts.dark` for the initial state and `watchDarkTheme()` from `components/hooks/useDarkTheme.ts` for changes (import it with a relative path `../../components/hooks/useDarkTheme`). Keep REF's 1.5 s sun transition and CSS variable updates, writing the `--rh-` names.
- `still` (reduced motion) comes from `opts.reducedMotion`. Keep `lowPower`, adaptive scale (start 0.75, 0.5 on coarse pointers / ≤ 4 cores, step down 15% after warm-up), `#hq` handling may be dropped.
- Also skip WebGL when `navigator.connection?.saveData` is true: call `fail()` (shows the SVG fallback).
- Replace REF's `load`/`requestIdleCallback` boot scheduling (lines 686–689) with an immediate `boot()`; scheduling moves to the React component.
- `destroy()` cancels the rAF, disconnects observers (IntersectionObserver, theme watcher), removes `resize`/`pointermove`/`visibilitychange` listeners, and calls `gl.getExtension('WEBGL_lose_context')?.loseContext()`.

- [ ] **Step 4: `components/home/MarsHorizon.tsx`**

Markup from `REF/index.html` lines 145–202 minus the `<header>` (lines 148–166), with strings from `useUI()`:
```tsx
'use client'

import { useEffect, useRef } from 'react'
import siteMetadata from '@/data/siteMetadata'
import MarsHud from './MarsHud'
import { useUI } from '../useUI'

export default function MarsHorizon() {
  const ui = useUI()
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fallbackRef = useRef<SVGSVGElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let handle: { destroy(): void } | null = null
    let cancelled = false
    const start = async () => {
      const { mountHorizon } = await import('@/lib/mars/horizon-renderer')
      if (cancelled || !heroRef.current || !canvasRef.current || !fallbackRef.current || !titleRef.current) return
      handle = mountHorizon(
        { hero: heroRef.current, canvas: canvasRef.current, fallback: fallbackRef.current, title: titleRef.current },
        {
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          dark: document.documentElement.classList.contains('dark'),
        }
      )
    }
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 60))
    const idle = ric(() => void start(), { timeout: 1200 })
    return () => {
      cancelled = true
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number)
      handle?.destroy()
    }
  }, [])

  return (
    <section className="rh-hero" id="hero" aria-label="Introduction" ref={heroRef}>
      <div className="rh-sky" aria-hidden="true" />
      <p className="rh-lead">{ui.masthead.tagline}</p>
      <div className="rh-title" ref={titleRef}>
        <p className="rh-eyebrow">{ui.masthead.eyebrow}</p>
        <h1>
          <span className="rh-w1">MARTIAN</span> <br className="rh-br" />
          <span className="rh-w2">
            LEE<span className="rh-dot">.</span>
            <i className="rh-bl" aria-hidden="true" />
          </span>
        </h1>
      </div>
      <svg className="rh-dunes" ref={fallbackRef} viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true" focusable="false" hidden>
        <path style={{ fill: 'var(--rh-far)' }} d="M0 72V19h118l16 21 16 4q100-14 180-6l62 8 12-18h96l14 19 46-2q40 2 90 13l2 2h288l15-17q20-10 45-9v51z" />
        <path style={{ fill: 'var(--rh-sand-d)' }} d="M0 400V84c80-22 150-24 230-10s150 8 230-14 170-20 250 0 160 22 290 6V400z" />
      </svg>
      <noscript>
        <style>{'.rh-dunes[hidden]{display:block!important}'}</style>
      </noscript>
      <canvas className="rh-mars-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="rh-fade" aria-hidden="true" />
      <div className="rh-hero-foot">
        <nav className="rh-cta" aria-label="Start here">
          <a className="rh-cta-main" href="#projects">{ui.masthead.viewProjects}</a>
          <a href="/posts">{ui.masthead.writing}</a>
          <a href={siteMetadata.linkedin}>{ui.cv}</a>
          <a href={siteMetadata.github}>GitHub ↗</a>
        </nav>
        <MarsHud />
      </div>
    </section>
  )
}
```
The eyebrow in REF splits into `.nw` spans at the `·` separators; reproduce that by splitting `ui.masthead.eyebrow` on ` · ` and wrapping each part in `<span className="rh-nw">`. Use the `Link` component for internal links if `jsx-a11y`/Next lint asks for it.

- [ ] **Step 5: `app/page.tsx`**

```tsx
import { listedBlogs, localizedList } from '@/lib/posts'
import MarsHorizon from '@/components/home/MarsHorizon'
import ProjectsSection from '@/components/home/ProjectsSection'
import WritingSection from '@/components/home/WritingSection'
import ExperienceSection from '@/components/home/ExperienceSection'

export default async function Page() {
  const posts = localizedList(listedBlogs())
  return (
    <div className="rh-page">
      <MarsHorizon />
      <div className="rh-wrap">
        <ProjectsSection />
        <WritingSection posts={posts} />
        <ExperienceSection />
      </div>
    </div>
  )
}
```
Delete `components/home/Masthead.tsx` and `components/home/ContactSection.tsx` (the footer owns contact now).

- [ ] **Step 6: Verify**

```bash
yarn lint && yarn build
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task5 / --ko --wait=4000
```
Expected: "all shots clean". Read `home-en-desktop-light.png` and `home-en-desktop-dark.png` next to `REF` screenshots (`/private/tmp/claude-501/-Users-dede-workspace-martianlee-github-com/156b1c99-e469-491e-bd60-c013ca6afa52/scratchpad/home-directions/shots/board-a-desktop-light.png` and `-dark.png`): butterscotch afternoon / blue sunset, MARTIAN LEE. with E bars and the period clear of the dunes, HUD values filled. KO shot: Korean tagline/eyebrow/HUD labels. The headless renderer is CPU-only, so terrain is coarser than on a GPU; judge composition and legibility, not sharpness. Then check the built chunk sizes: `ls -la out/_next/static/chunks | sort -k5 -n | tail` and `gzip -9 -c <the horizon chunk> | wc -c` → the lazy horizon chunk must be ≤ 12 KB gz.

- [ ] **Step 7: Commit**

```bash
git add components/home/MarsHorizon.tsx components/home/MarsHud.tsx lib/mars/horizon-renderer.ts app/page.tsx css/red-horizon.css
git rm components/home/Masthead.tsx components/home/ContactSection.tsx
git commit -m "feat(home): Mars horizon hero with live telemetry (lazy WebGL, SVG fallback)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Home sections — pointer-lit projects, recent posts, career bars

**Files:**
- Create: `components/hooks/usePointerSun.ts`, `components/hooks/useSettleOnView.ts`, `components/TenureChart.tsx`
- Modify: `components/home/ProjectsSection.tsx`, `components/home/WritingSection.tsx`, `components/home/ExperienceSection.tsx`, `css/red-horizon.css`

**Interfaces:**
```ts
export function usePointerSun(listRef: RefObject<HTMLElement | null>): void   // sets --rh-lx/--rh-ly on every .rh-orb inside; REF/index.html 693–778
export function useSettleOnView(ref: RefObject<HTMLElement | null>): void     // toggles .rh-pre → removed when visible; REF CSS lines 43–46
export default function TenureChart(props: { roles: Career[] }): JSX.Element  // REF/index.html 253–280 markup, 779–829 script, CSS 93–126
```

- [ ] **Step 1: CSS**

Port `REF/index.html` lines 43–126 (settle, projects pointer-sun extras, posts, experience) into `css/red-horizon.css` under `/* home sections */` with `rh-` names (`.feat` → `.rh-feat`, `.rows` → `.rh-rows`, `.exp`/`.xp`/`.track`/`.axis` → `.rh-exp`/`.rh-xp`/`.rh-track`/`.rh-axis`, `.pre` → `.rh-pre`, etc.).

- [ ] **Step 2: Hooks**

`components/hooks/useSettleOnView.ts`:
```ts
'use client'

import { useEffect, type RefObject } from 'react'

/** Starts a section title slightly loose (.rh-pre) and lets it settle when it scrolls into view. Readable in both states. */
export function useSettleOnView(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) return // already visible: never animate content that is on screen
    el.classList.add('rh-pre')
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.remove('rh-pre')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}
```
`components/hooks/usePointerSun.ts`: port `REF/index.html` lines 693–778 (the projects part of the second script) into a hook that receives the list element ref, uses one rAF per pointer move, skips touch-only devices (`matchMedia('(hover: none)')`), sets `--rh-lx`/`--rh-ly` (and the row light variables REF sets, `rh-` prefixed) on each `.rh-orb`/row, gives keyboard focus the "Sun over the title" state, eases back on pointer leave, and removes every listener in its cleanup.

- [ ] **Step 3: `components/home/ProjectsSection.tsx`**

```tsx
'use client'

import { useRef } from 'react'
import Link from '@/components/Link'
import ProjectOrb from '@/components/ProjectOrb'
import projectsData from '@/data/projectsData'
import { useUI, useLocalized } from '@/components/useUI'
import { usePointerSun } from '@/components/hooks/usePointerSun'
import { useSettleOnView } from '@/components/hooks/useSettleOnView'
import type { Project } from '@/data/projectsData'

function Row({ p }: { p: Project }) {
  const summary = useLocalized(p.summary, p.summaryKo)
  const kind = useLocalized(p.kind, p.kindKo)
  return (
    <li>
      <Link href={`/projects/${p.slug}`} className="rh-proj-row">
        <ProjectOrb orb={p.orb} />
        <span className="rh-proj-main">
          <span className="rh-proj-title">
            {p.title} <span className="rh-chip">{kind}</span>
          </span>
          <span className="rh-proj-desc">{summary}</span>
        </span>
        <span className="rh-proj-stack">{(p.techStack ?? []).slice(0, 3).join(' · ')} →</span>
      </Link>
    </li>
  )
}

export default function ProjectsSection() {
  const ui = useUI()
  const listRef = useRef<HTMLUListElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  usePointerSun(listRef)
  useSettleOnView(titleRef)
  const featured = projectsData.filter((p) => p.featured).slice(0, 4)
  return (
    <section className="rh-sec" id="projects" aria-labelledby="projects-h">
      <div className="rh-sec-head">
        <span className="rh-sec-no">01</span>
        <h2 id="projects-h" ref={titleRef}>{ui.home.projects}</h2>
        <Link className="rh-sec-link" href="/projects">{ui.sections.allProjects}</Link>
      </div>
      <ul className="rh-proj" ref={listRef}>
        {featured.map((p) => (
          <Row key={p.slug} p={p} />
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 4: `components/home/WritingSection.tsx`**

Markup from `REF/index.html` lines 231–251 (two `.feat` articles with meta + title + summary, then three `.rows` links). Data: `posts.slice(0, 2)` featured, `posts.slice(2, 5)` rows, `pick(title, titleKo)` / `pick(summary, summaryKo)` as today, meta line `formatDate(date, siteMetadata.locale)` · `readingTime.text` · first two tags joined with ` / `. Section head: `02` + `ui.home.posts` + `ui.sections.allPosts` link to `/posts`; intro `<p className="rh-lede">{ui.sections.writingIntro}</p>`. Port the directional underline (the part of `REF/index.html` 693–778 handling `.feat h3 a` and `.rows a`: it sets `--o` to the side the pointer entered) as an effect in this component on its section ref; remove listeners in cleanup. Use `useSettleOnView` on the h2. Links use `PostLink` (as today) with the `rh-` classes from REF.

- [ ] **Step 5: `components/TenureChart.tsx` and `components/home/ExperienceSection.tsx`**

`TenureChart` renders REF `index.html` lines 253–280: one `<li>` per role (company `<h3>` + italic role + period + description + stack, then a `.rh-track` holding the bar positioned with `barSpan()`), then the axis with year labels from `scrubYears()` and the hint. Logic from REF lines 779–829, rewritten with `lib/tenure.ts`:
- `nowYear = new Date().getFullYear()`, `now = yearFraction(new Date())`, computed in an effect (render a static layout with `now = nowYear + 0.5` on the server, then update after mount to avoid a hydration mismatch).
- The axis is `role="slider"` with `tabIndex={0}`, `aria-label={ui.tenure.label}`, `aria-valuemin={axis.from}`, `aria-valuemax={nowYear}`, `aria-valuenow={year}`, `aria-valuetext={readout}`; ←/→ step a year, Home/End jump; pointer move/tap over a track or the axis sets the year.
- Readout = `fill(ui.tenure.readout, { year, roles: activeRoles(roles, year, nowYear).map((r) => `${r.company}, ${lang === 'ko' && r.roleKo ? r.roleKo : r.role}`).join(' · ') })`.
- Active bars get `.rh-on`; the scrub line is positioned by percentage; the ongoing bar shows the pulse dot.
- The one-time "energize" glow on first view uses an IntersectionObserver; bars are always drawn.
`ExperienceSection` = section head (`03` + `ui.home.experience` + CV link) + `<TenureChart roles={careerData} />`, with `useSettleOnView` on the h2.

- [ ] **Step 6: Verify**

```bash
yarn lint && yarn test && yarn build
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task6 / --ko --wait=3000
```
Then write a small throwaway script (do not commit) under `.superpowers/sdd/` that opens the built home page in Playwright, hovers the bottom-left of the projects list and the 2021 tick of the career axis, focuses the axis and presses ArrowRight twice, and screenshots the projects and experience sections in light and dark. Read the images: planets lit from the pointer side; the 2021 readout lists Miso and TomorrowUse; keyboard moves the scrub line; KO readout uses Korean roles. Expected: "all shots clean".

- [ ] **Step 7: Commit**

```bash
git add components/hooks/usePointerSun.ts components/hooks/useSettleOnView.ts components/TenureChart.tsx components/home css/red-horizon.css
git commit -m "feat(home): pointer-lit project planets, directional underlines, year-axis career bars with scrubber" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Posts list and tag pages

**Files:**
- Create: `components/posts/PostRow.tsx`
- Modify: `layouts/ListLayoutWithTags.tsx`, `app/posts/page.tsx`, `app/posts/page/[page]/page.tsx`, `app/tags/[tag]/page.tsx`, `css/red-horizon.css`

**Interfaces:**
```ts
interface ListLayoutProps { posts: LocalizedListItem[]; title: string; titleKo?: string; initialDisplayPosts?: LocalizedListItem[]; pagination?: { totalPages: number; currentPage: number }; stats: { listedTotal: number; tagTotal: number; latest: string; maxMinutes: number } }
export default function PostRow(props: { post: LocalizedListItem; maxMinutes: number }): JSX.Element
```

- [ ] **Step 1: CSS** — port the `<style>` block of `REF/inner/posts.src.html` (lines 4–70: `.plist`, `.rail*`, `.prows`, `.prow*`, `.gauge`, `.pager`, media queries, keyframes `charge` → `rh-charge`) with `rh-` names.

- [ ] **Step 2: Stats and page size**

In `app/posts/page.tsx` and `app/posts/page/[page]/page.tsx` set `const POSTS_PER_PAGE = 10` and pass `stats`:
```ts
import tagData from 'app/tag-data.json'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
const stats = {
  listedTotal: posts.length,
  tagTotal: Object.keys(tagData as Record<string, number>).length,
  latest: posts[0] ? formatDate(posts[0].date, 'en-US') : '',
  maxMinutes: Math.max(1, ...posts.map((p) => Math.ceil(p.readingTime.minutes))),
}
```
`app/tags/[tag]/page.tsx` passes the same shape computed from `localizedList(listedBlogs())` for `listedTotal`/`tagTotal`/`maxMinutes` and from `filteredPosts` for `latest`. Remove the temporary `SectionContainer` wrappers from these three pages.

- [ ] **Step 3: `components/posts/PostRow.tsx`** — markup from one row of `REF/posts.html` (inside `.prows`): `<li className="rh-prow">` with meta column (`<time>` + `.rh-gauge` with `style={{ '--v': minutes / maxMinutes } as CSSProperties}` and `aria-label={fill(ui.list.readGauge, { n: minutes })}` + `<span className="rh-rt">{minutes} min</span>`), main column (title via `PostLink` in `.rh-prow-title`, summary `.rh-prow-sum` (2-line clamp), tags: first 3 as `.rh-tagchip` links to `/tags/<slug>` + `<span className="rh-more">+{n}</span>`). Localized title/summary as in the current layout (`pick`).

- [ ] **Step 4: `layouts/ListLayoutWithTags.tsx`** — keep `Pagination` logic and the tag sorting, rebuild the render from `REF/inner/posts.src.html` lines 72–101: `HorizonBand` (title `title`/`titleKo`; for `/posts` pass `title="Posts" titleKo="글"` from `app/posts/page.tsx`; tele = `ui.band.writingLog` · `fill(ui.band.postCount,{n: stats.listedTotal})` · `fill(ui.band.tagCount,{n: stats.tagTotal})` · `fill(ui.band.latest,{date: stats.latest})`), `.rh-lede` intro (only on `/posts` pages), the `.rh-plist` grid with the tag rail (top 18 tags; `All` + `ui.list.allTags` link to `/tags`; `aria-current` on the active tag, as the current code computes it) and the `<ol className="rh-prows">` of `PostRow`s, then the pager (`ui.list.newer`, `fill(ui.list.pageOf, …)`, `ui.list.older`). Wrap in `<div className="rh-page">` + `<div className="rh-wrap">` like the other pages.

- [ ] **Step 5: Verify**

```bash
yarn lint && yarn build
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task7 /posts.html,/posts/page/2.html,/tags/architecture.html --ko --wait=1500
```
Expected: "all shots clean"; POSTS. band with real counts; rail on desktop, scroller with an edge fade at 390 px; summaries clamp to 2 lines; KO band title 글 and Korean summaries; pagination shows `1 / 7` (69 posts, 10 per page).

- [ ] **Step 6: Commit**

```bash
git add components/posts/PostRow.tsx layouts/ListLayoutWithTags.tsx app/posts app/tags css/red-horizon.css
git commit -m "feat(posts): Red Horizon list with tag rail, reading gauge, 10 posts per page" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Post detail

**Files:**
- Create: `components/posts/PostToc.tsx`
- Modify: `layouts/PostLayout.tsx`, `css/red-horizon.css`

**Interfaces:**
```ts
export default function PostToc(props: { toc: TocEntry[]; label: string }): JSX.Element   // sticky ≥1100px with scroll spy + sliding marker, <details> below; also renders the reading-progress hairline
```

- [ ] **Step 1: CSS** — port `REF/inner/inner.css` lines 82–143 (reading rules) as `.rh-reading …` (every `.prose X` selector becomes `.rh-reading X`), plus the `<style>` block of `REF/inner/post.src.html` (band headline meta, summary, stage chip, TOC, progress hairline, prev/next, data-plate blockquote, table box) with `rh-` names. Add the auto-numbering switch: the counter rules apply only under `.rh-reading[data-autonum="on"]`.

- [ ] **Step 2: `components/posts/PostToc.tsx`** — port the TOC scroll-spy and progress script from `REF/inner/post.src.html` into a client component (IntersectionObserver on the `h2/h3` ids from `toc`, sliding `.rh-toc-marker`, progress = scrollY over the article height on a passive scroll listener with rAF). Cleanup removes all listeners.

- [ ] **Step 3: `layouts/PostLayout.tsx`** — keep its props, `editUrl`, the language-aware strings `t`, `Comments`, prev/next data, `ScrollTopAndComment`. Replace the inline TOC parsing with `parseToc(content.toc)` and compute `const autonum = hasNumberedHeadings(toc) ? 'off' : 'on'`. Render: `<div className="rh-page">` → `HorizonBand variant="headline" title={title} dot={false}` with `children` = the back link (`/${basePath}` with `t.backToWriting`) · author · date · reading time (and the study-note marker for `kind === 'note'`) → `<div className="rh-wrap">` with the summary paragraph, stage chip + tag chips, a two-column grid (`<article className="prose rh-reading" data-autonum={autonum}>{children}</article>` + `<PostToc toc={toc} label={t.onThisPage} />` when `toc.length > 2`), then the tags/edit row, prev/next, and comments. Remove the `SectionContainer` wrapper. Keep the `prose` class next to `rh-reading` so mermaid, KaTeX and viz components keep their current rules.

- [ ] **Step 4: Verify on varied content**

```bash
yarn lint && yarn test && yarn build
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task8 /posts/2026-09-28-request-layers.html,/posts/2026-09-12-carbon-basics-daily-life.html,/posts/2026-09-12-archify-architecture.html,/ko/posts/2026-09-28-request-layers.html,/posts/2026-10-07-hyperframes-architecture.html --wait=3000
```
Expected: "all shots clean". Read the PNGs: long titles wrap in the band without collisions; the reading column is Newsreader ~20px; numbering appears only when the post's h2s are not already numbered; mermaid diagrams (archify) and 3D viz (carbon basics) render as before; the KO post shows Korean chrome; the note (hyperframes) shows the study-note marker.

- [ ] **Step 5: Commit**

```bash
git add components/posts/PostToc.tsx layouts/PostLayout.tsx css/red-horizon.css
git commit -m "feat(post): headline band, reading column, sticky TOC with scroll spy and progress" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Projects list and detail

**Files:**
- Modify: `components/projects/ProjectsView.tsx`, `components/projects/ProjectDetail.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `css/red-horizon.css`
- Delete: `components/Card.tsx`

- [ ] **Step 1: CSS** — port the `<style>` blocks of `REF/inner/projects.src.html` and `REF/inner/project.src.html` (group heads, hint line, detail hero orb rising behind the mesas, screenshot frame with crop marks and caption, spec sheet, neighbors, buttons) with `rh-` names.

- [ ] **Step 2: `ProjectsView`** — `HorizonBand title="Projects" titleKo="프로젝트"` with tele `ui.band.sideProjects` · `fill(ui.band.projectCount,{n:10})` · `fill(ui.band.appsCount,{n: apps.length})` · `fill(ui.band.gamesCount,{n: games.length})` (counts computed from `projectsData`), then `rh-wrap` with `.rh-lede` = `ui.projectsPage.intro`, a hint line with the ping dot = `ui.projectsPage.sunHint` (hidden on touch devices via CSS `@media (hover: none)`), and two sections (`01` `ui.projectsPage.apps`, `02` `ui.projectsPage.games`) whose rows reuse the same `Row` markup as the home (extract `Row` from `components/home/ProjectsSection.tsx` into `components/projects/ProjectRow.tsx` and import it in both places) inside `<ul className="rh-proj">` lists that use `usePointerSun`.

- [ ] **Step 3: `ProjectDetail`** — markup from `REF/inner/project.src.html`: `HorizonBand variant="headline"` with `dot={false}`, `title={project.title}`, `children` = back link (`ui.projectsPage.back`) · kind · category, `aside` = `<ProjectOrb orb={project.orb} size="hero" />` (pointer-lit, slow texture spin); then the long `description`/`descriptionKo` (`useLocalized`), Live demo / GitHub buttons (`.rh-btn`), the screenshot (`imgSrc`, `next/image` via `@/components/Image` with `loading="lazy"`) inside the crop-mark frame with caption `${ui.projectsPage.figure} · ${project.title}`, the spec sheet (`ui.projectsPage.kind`, `techStack`, `workflow`, `builtWithAI`, `source` = GitHub link when present), and neighbor cards (previous/next project in `projectsData` order with their orbs and `summary`).

- [ ] **Step 4: Remove the old card** — `git rm components/Card.tsx`; make sure nothing imports it (`grep -rn "components/Card'" app components layouts` prints nothing). Remove the temporary `SectionContainer` wrappers in `app/projects/page.tsx` and `app/projects/[slug]/page.tsx`.

- [ ] **Step 5: Verify**

```bash
yarn lint && yarn build
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task9 /projects.html,/projects/hanji.html,/projects/first-defense.html,/projects/more-munch.html --ko --wait=1500
```
Expected: "all shots clean"; every project has its own planet; no project screenshots on the list; detail pages show the rising planet, long description and framed screenshot (more-munch has no screenshot: the frame is omitted, no empty box); KO shows Korean one-liners and labels.

- [ ] **Step 6: Commit**

```bash
git add components/projects app/projects css/red-horizon.css components/home/ProjectsSection.tsx
git commit -m "feat(projects): planet list with one-liners, detail page with rising planet and spec sheet" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: About — "Mars, right now"

**Files:**
- Create: `components/about/MarsGlobe.tsx`, `lib/mars/globe-renderer.ts`
- Modify: `layouts/AuthorLayout.tsx`, `app/about/page.tsx`, `css/red-horizon.css`

**Interfaces:**
```ts
// lib/mars/globe-renderer.ts
export interface GlobeElements { port: HTMLElement; canvas: HTMLCanvasElement; still: SVGSVGElement; pin: HTMLElement; pinText: HTMLElement; sunMark: SVGElement }
export interface GlobeHandle { faceSun(): void; faceJezero(): void; update(clock: MarsClock): void; destroy(): void }
export function mountGlobe(el: GlobeElements, opts: { reducedMotion: boolean; dark: boolean; clock: MarsClock }): GlobeHandle
// components/about/MarsGlobe.tsx
export default function MarsGlobe(): JSX.Element
```

- [ ] **Step 1: CSS** — port `REF/about.html` lines 11–108 (`--port … --ground` tokens as `--rh-port …` with dark values under `html.dark`; band, eyepiece, bio, compact experience) with `rh-about-` names for the About-only classes (`.band` → `.rh-about-band`, `.sky` → `.rh-about-sky`, `.land` → `.rh-about-land`, `.band-in` → `.rh-about-in`, `.who`, `.name`, `.globe`, `.reticle`, `.still`, `.ctl`, `.cap` …). The star field `box-shadow` list stays verbatim.

- [ ] **Step 2: `lib/mars/globe-renderer.ts`** — port `REF/about.html` lines 271–538 (VS/FS shaders lines 327–414 verbatim; `build`, `resize`, `draw`, `overlay`, `step`, `sync`, `goTo`, `fail`, `boot`) into `mountGlobe`. Replace REF's inline `mars()` (lines 189–228) with `marsClock()` from `lib/mars/clock.ts` (it now returns `eot`, `subsolarLatDeg`, `subsolarLonEastDeg`, `lmstJezero`); replace `document.getElementById('g-…')` with `el.*`; theme via `opts.dark` + `watchDarkTheme`; reduced motion from `opts.reducedMotion`; `faceSun`/`faceJezero` call REF's `goTo`; `destroy()` removes pointer/keyboard/resize/visibility listeners, observers and the rAF, and loses the context.

- [ ] **Step 3: `components/about/MarsGlobe.tsx`** — markup from `REF/about.html` lines 145–185 (`<figure class="globe">`: the still SVG Mars that paints first, canvas, reticle SVG with N/E/S/W and ticks, the Jezero pin, the caption `dl`, and the controls) with strings from `ui.about` (`globeLabel` as the figure's `aria-label`; caption labels `litAt` via `fill`, `subsolar`, `jezeroTime`, `season`; buttons `faceSun`, `faceJezero`; hint `drag`). Caption values come from `marsClock(Date.now())` in an effect (update every 5 s; placeholders before mount). Lazy-load the renderer exactly like `MarsHorizon` (idle callback + dynamic import + cleanup). The figure is keyboard-focusable (`tabIndex={0}`) and arrow keys rotate it (handled in the renderer).

- [ ] **Step 4: `layouts/AuthorLayout.tsx`** — keep the props and the EN/KO bio switch (`lang === 'ko' ? <AboutBioKo /> : children`). Render `<div className="rh-page">`: the About band from `REF/about.html` lines 113–187 (sky with stars, mesa land, `.rh-about-in` grid with the `who` block: `ui.masthead.eyebrow` split into `rh-nw` spans, `<h1 className="rh-about-name">{ui.about.name}<span className="rh-dot">.</span></h1>`, and `<MarsGlobe />`), then `<div className="rh-wrap">` with the bio in `<div className="prose rh-reading rh-about-bio">` and the compact experience rows (REF lines 252–262; data from `careerData`, localized role/description; section head `ui.about.experience` + CV link). Remove the old contact block (the footer has it). `app/about/page.tsx` drops its temporary `SectionContainer`.

- [ ] **Step 5: Verify**

```bash
yarn lint && yarn test && yarn build
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/task10 /about.html --ko --wait=4000
```
Then a throwaway Playwright script that drags the globe 200 px left and clicks "Face Jezero", screenshotting after each. Expected: "all shots clean"; the globe reads as Mars (Syrtis Major, Valles Marineris, polar cap), lit on the real day side; caption values filled; the bio sits on plain paper with nothing moving behind it; KO shows 이성화. and Korean caption labels; at 390 px the globe sits above the name and the bio is full width.

- [ ] **Step 6: Commit**

```bash
git add components/about/MarsGlobe.tsx lib/mars/globe-renderer.ts layouts/AuthorLayout.tsx app/about/page.tsx css/red-horizon.css
git commit -m "feat(about): live Mars globe lit by the real Sun, reading-first bio" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Cleanup and full verification

**Files:**
- Modify: `css/tailwind.css` (remove dead kit rules only), `lib/ui-strings.ts` (remove dead keys only), any file with leftover temporary wrappers

- [ ] **Step 1: Dead code** — for each old kit class (`.eyebrow`, `.sec-head`, `.sec-num`, `.chip`, `.list-row`, `.ghost-btn`, `.reading-measure`), run `grep -rn "<class>" app components layouts --include=*.tsx`; delete the CSS rule only when nothing uses it (KB and climate may still use some). For each `ui-strings` key that the old components used (`sections.projects`, `sections.writing`, `sections.experience`, `masthead.*` if unused, `projectsPage.eyebrow`, `projectsPage.title`), grep `ui\.<group>\.<key>` and delete only unused keys from the interface and both languages. Confirm no `SectionContainer` wrapper remains on a Red Horizon page (`grep -rn SectionContainer app layouts components` lists only climate, praisecat and the component itself).

- [ ] **Step 2: Full checks**

```bash
yarn lint && yarn test && yarn build
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/final /,/about.html,/posts.html,/posts/2026-09-28-request-layers.html,/ko/posts/2026-09-28-request-layers.html,/tags.html,/tags/architecture.html,/projects.html,/projects/hanji.html,/404.html,/climate.html,/praisecat.html --ko --wait=3000
node .superpowers/sdd/rh-shots.mjs .superpowers/sdd/shots/final-kb /kb.html,/kb/graph.html,/kb/2026-09-28-request-layers.html --only=desktop-light,desktop-dark,mobile-light --wait=2000
```
Expected: "all shots clean" (only the pre-existing /climate THREE warning is allowed); KB shots identical to `.superpowers/sdd/shots/kb-baseline/`.

- [ ] **Step 3: Weight report** — write a throwaway Playwright script that loads `/` from the static server and sums `performance.getEntriesByType('resource')` transfer sizes by type (script, font, img, css) and prints them with the FCP. Expected: images 0 on the home; record JS/font totals in the final report (the live site measured JS 311 KB, fonts 182 KB, images 746 KB on 2026-10-10).

- [ ] **Step 4: Commit**

```bash
git add -A css lib components layouts app
git commit -m "chore(ui): remove the replaced Bold Editorial kit and unused strings" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
