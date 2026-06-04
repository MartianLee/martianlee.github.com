# martianlee.github.com — Working Notes

MartianLee's personal blog / digital garden. Next.js App Router + Contentlayer2 + Tailwind.

## Core commands (the ones that matter)

- `yarn dev` — builds contentlayer, then starts dev server at `http://localhost:3456`. **Port 3456 is fixed.**
- `yarn build` — static build + postbuild. Must pass before deploy.
- `yarn lint` — eslint. Must pass before committing (husky is set up).
- Node 24 (`.nvmrc`), package manager is **yarn 3.6.1 (berry)**. Do NOT use `npm install`.
- **Deploy is automatic on merge to `main`** (GitHub Actions). No manual deploy step — just merge.

## Writing a post

- Location: `data/posts/`, filename `YYYY-MM-DD-slug.mdx`.
- **Bilingual pairs**: always create the Korean `slug.mdx` AND the English `slug.en.mdx` together. Locale is detected from the `.en` suffix, so the English version MUST end in `.en.mdx`.
- Minimum frontmatter:
  ```yaml
  ---
  title: '...'
  date: 2026-01-01 18:00:00 +0900 # always include the +0900 timezone
  tags: ['tag1', 'tag2']
  summary: '...' # for SEO / list previews, 1–2 sentences
  author: MartianLee
  ---
  ```
- Optional fields: `draft: true` (unpublished), `lastmod`, `stage` (seedling | budding | evergreen — digital-garden maturity, default budding), `topic`, `canonicalUrl`, `bibliography`.

## Writing tone (hard rule)

- Korean body text uses **formal speech** (경어체: ~입니다 / ~합니다). Never use plain form (~이다 / ~한다).
- The English version is a natural translation of the same content — no literal/machine-translation style.

## Don't

- Add the Korean post but forget the `.en.mdx` (breaks the pair).
- Create posts outside `data/posts/`.
- Mistake the root-level `*.png` files (leftover screenshots) or `example-posts/` for real content.
