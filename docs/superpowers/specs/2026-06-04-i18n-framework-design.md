# i18n Framework — Bilingual Posts (EN default / KO toggle)

- **Date:** 2026-06-04
- **Status:** Implemented on branch `i18n/framework` (2026-06-04). Verified end-to-end via a temporary `.en.mdx` sample (canonical EN, `/ko` KO, hreflang, sitemap, single-listing) then removed; baseline (no translations) unchanged.
- **Scope of this spec:** The bilingual **framework** only. Actually translating the ~80 Korean posts is a **separate follow-up sub-project** (subagent-driven, phased).
- **Builds on:** the merged "Bold Editorial" redesign.

---

## 1. Goal & Context

The blog targets global developer roles, so posts should default to **English**, with the original **Korean available via a per-post toggle**. Today every post in `data/posts/*.mdx` is Korean and the route is `/posts/<slug>` (single language). The site is statically exported (`output: 'export'`, GitHub Pages), so Next's built-in i18n routing is unavailable — we build locale routing manually.

### Approved product decisions

- **Bilingual:** English is the default/canonical language; Korean is available via toggle.
- **Toggle scope = post content only.** Site UI (nav, labels, buttons) stays English always — no UI-string translation.
- **`/notes` (KB) excluded** — stays Korean, no i18n.

---

## 2. Scope

**In scope (this spec — the framework):**

- Bilingual content model in contentlayer.
- EN-canonical + KO-prefixed routing, both statically generated.
- Per-post language toggle + `hreflang` SEO.
- Graceful fallback so the site never breaks while translation is incomplete.

**Out of scope → follow-up sub-project:**

- Translating the existing ~80 Korean posts to English (content work; subagent-driven, phased, recent/important first).
- UI-string i18n (not wanted — UI is English-only).
- `/notes` i18n.

---

## 3. Content model

- Existing `data/posts/<slug>.mdx` stays **Korean** (no change, keeps working today).
- The English version is added alongside as **`data/posts/<slug>.en.mdx`** when translated.
- Language and pairing are **inferred from the filename** — no frontmatter changes required:
  - `contentlayer.config.ts` adds two computed fields to `Blog`:
    - `language`: `'en'` if `_raw.sourceFileName` ends with `.en.mdx`, else `'ko'`.
    - `translationKey`: the post slug with any trailing `.en` removed — i.e. both `<slug>.mdx` (ko) and `<slug>.en.mdx` (en) resolve to the **same** key (e.g. `2026-06-04-semble-architecture`), pairing the two language versions.
  - The existing `slug`/`path` computed fields must also strip a trailing `.en`, so the two versions share one clean URL (no `.en` anywhere in a URL). Because `slug` is then shared by both versions, any post lookup filters by **slug + language**.
- _Rejected alternative:_ `posts/en/` + `posts/ko/` subfolders (cleaner separation but larger structural change and churns existing files). The `.en.mdx` suffix is the minimal-change option and requires no rename of the 80 existing files.

---

## 4. Routing (static export)

- **English = canonical:** `/posts/<slug>`. For each `translationKey`, the canonical doc is the English version if it exists, else the Korean version (fallback). `app/posts/[...slug]/page.tsx` `generateStaticParams` iterates unique `translationKey`s.
- **Korean = `/ko/posts/<slug>`:** a new route `app/ko/posts/[...slug]/page.tsx` that renders the Korean doc for each `translationKey` that has one (all current posts). Reuses the same `PostLayout`.
- Both route trees are statically generated.
- **Lists / home / projects / about / tags stay English-only** (no `/ko` variants) — the toggle is post-content-only, and these pages render English UI + (English-or-fallback) post titles.
- **SEO:** each post page emits `<link rel="alternate" hreflang="en" href=".../posts/<slug>">` and `hreflang="ko" href=".../ko/posts/<slug>">` when both exist, plus `hreflang="x-default"` → English. `sitemap.ts` includes the `/ko/posts/<slug>` URLs.

---

## 5. Toggle UI — global reading preference

- **Keep the header `EN / KO` toggle** (and in `MobileNav`). Default **EN**.
- A client **`LanguageProvider`** stores the reading-language preference in `localStorage` (key `lang`, default `'en'`), wrapping the app inside the existing providers. `components/LanguageToggle.tsx` is **kept and wired** to it (not deleted).
- **Preference-aware post links:** post links across the site (home "Selected writing", `/posts` list, tags) render through a client **`PostLink`** that resolves the href from the preference — EN → `/posts/<slug>` (canonical, English-or-fallback), KO → `/ko/posts/<slug>` (Korean, which always exists). The static HTML ships the EN href (SEO / no-JS default); the client swaps to the KO href when that preference is set.
- **On a post page:** the toggle also navigates to the sibling-language URL and updates the preference. Both URLs always exist (Korean is always present; English once translated), so the toggle is always functional; for a not-yet-translated post the EN canonical simply shows the Korean fallback.

---

## 6. Rollout (phased, never-broken)

- This framework ships first. Because no `.en.mdx` exists yet, every post is Korean: canonical `/posts/<slug>` serves Korean (today's behavior) and `/ko/posts/<slug>` is the same content. The header `EN / KO` toggle is present but has no visible effect (both languages resolve to Korean) until translations land.
- As the translation sub-project adds `<slug>.en.mdx` files, those posts' canonical flips to English and the toggle appears. "English default" becomes true incrementally (recent/important posts first).
- The site is valid and navigable at every step.

---

## 7. Implementation map (files)

- `contentlayer.config.ts` — add `language` + `translationKey` computed fields; make `slug`/`path` strip trailing `.en`.
- `app/posts/[...slug]/page.tsx` — canonical EN route: `generateStaticParams` over unique `translationKey`s; pick English-else-Korean doc; render `PostLayout`; emit hreflang.
- **New** `app/ko/posts/[...slug]/page.tsx` — KO route: params over keys with a Korean doc; render the Korean doc.
- `layouts/PostLayout.tsx` (+ `PostSimple.tsx`, `PostBanner.tsx`) — receive the doc's `language`; emit `hreflang` + canonical; on a post page the header toggle switches to the sibling URL.
- **New** `LanguageProvider` (client context; `localStorage` `lang`, default `en`) added inside `app/theme-providers.tsx` (alongside the theme provider). `components/Header.tsx` / `components/MobileNav.tsx` **keep** `LanguageToggle`, now wired to the provider.
- **New** `components/PostLink.tsx` (client) — resolves a post href from the preference; used by `components/home/WritingSection.tsx`, `layouts/ListLayoutWithTags.tsx`, and `app/tags/[tag]` post lists in place of raw `/posts/<slug>` links.
- `app/sitemap.ts` — add `/ko/posts/<slug>` entries.
- Search index (`createSearchIndex` in `contentlayer.config.ts`) — index **canonical (English-or-fallback) docs only**, so the Cmd+K palette doesn't show duplicate bilingual entries.
- Prev/next + any post listing logic — operate on **canonical docs keyed by `translationKey`** (dedupe so a post isn't listed twice).

---

## 8. Success criteria / Verification

- [ ] `yarn build` static-exports cleanly with the new `/ko/posts/...` tree.
- [ ] With no `.en.mdx`: every `/posts/<slug>` serves Korean (current behavior), no toggle, build identical in spirit to today.
- [ ] Add one sample `<slug>.en.mdx`: `/posts/<slug>` now serves English, `/ko/posts/<slug>` serves Korean, toggle appears on both and links correctly, hreflang present.
- [ ] Lists/home/search show each post once (no bilingual duplicates).
- [ ] Header `EN / KO` toggle persists across pages (localStorage, default EN); in KO mode, clicking a post from home/list opens its `/ko/posts/<slug>` version.
- [ ] `/notes` (KB) untouched.

---

## 9. Open items (resolve during implementation)

- Exact toggle placement/visual in `PostLayout` (top-right of the header block vs near meta).
- Whether `/ko` Korean posts should be `noindex` or fully indexed with hreflang (default: indexed + hreflang).
- Translation sub-project: ordering (recent/featured first), per-post subagent workflow, and how to keep code blocks / mermaid / frontmatter intact during translation — defined in that sub-project's own spec.
