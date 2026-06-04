# GitHub Profile README Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal `MartianLee/MartianLee` profile README with a personality-driven, recruiter-safe README that proves "builds a lot AND ships a lot," plus a daily snake-animation GitHub Action.

**Architecture:** The README lives in the special profile repo `MartianLee/MartianLee` (separate from this blog repo). We clone it locally, build `README.md` section-by-section using markdown + hosted widget images + `github-readme-stats` pin cards, add one GitHub Actions workflow (`Platane/snk`) that regenerates a contribution-snake SVG daily into an `output` branch, then push. The blog feed is **static links** for v1 (the blog has no RSS feed yet).

**Tech Stack:** GitHub-flavored Markdown, hosted README widgets (`github-readme-stats`, `github-readme-streak-stats`, `github-profile-trophy`, `readme-typing-svg`), GitHub Actions (`Platane/snk@v3`), `gh` CLI + git.

---

## Notes & gotchas (read first)

- **Two repos.** This plan's content is built in `MartianLee/MartianLee`, NOT in the blog repo where this plan file lives.
- **Widget rate-limits.** Public widget hosts occasionally return `503` (github-readme-stats) or `402` (github-profile-trophy) when probed via curl. This is the shared public instance being rate-limited, not a broken URL. Verify these in a browser, not curl. The existing README already relies on `github-readme-stats`, so it is acceptable.
- **Blog URL pattern (confirmed 200):** `https://martianlee.github.io/posts/<filename-without-.en.mdx>` — e.g. `https://martianlee.github.io/posts/2026-06-04-semble-architecture`.
- **Theme:** keep `catppuccin_latte` across widgets to match the current README.
- **Push policy:** do NOT push until the user explicitly approves the final README (see Task 8).
- **No automated tests apply** to a README. "Verify" steps here are HTTP-status checks (`curl`) and a local markdown render preview.

## File structure (in `MartianLee/MartianLee`)

- Modify/Create: `README.md` — the entire profile.
- Create: `.github/workflows/snake.yml` — daily snake-animation generator.

---

## Task 1: Set up a local working copy of the profile repo

**Files:**

- Working dir: clone `MartianLee/MartianLee` next to the blog repo.

- [ ] **Step 1: Clone the profile repo**

```bash
cd /Users/dede/workspace
gh repo clone MartianLee/MartianLee
cd MartianLee
```

- [ ] **Step 2: Confirm current README and branch**

Run: `git branch --show-current && cat README.md`
Expected: `main` (or `master`); README shows current minimal content (title + blog badge + stats card).

- [ ] **Step 3: Create a working branch**

```bash
git checkout -b feat/profile-readme-redesign
```

Expected: switched to new branch.

---

## Task 2: Header — typing-SVG catchphrase

**Files:**

- Modify: `README.md` (replace entire file; this task writes the top of the new file).

- [ ] **Step 1: Replace README.md with the header block**

Write `README.md` starting with:

```markdown
<div align="center">

# 🐢 Martian Lee

<a href="https://readme-typing-svg.demolab.com">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&pause=1000&center=true&vCenter=true&width=600&lines=Crazy+Side+Project+Generator;I+build+a+lot+%E2%80%94+and+I+ship+a+lot;Games%2C+apps%2C+and+everything+in+between" alt="typing tagline" />
</a>

</div>
```

- [ ] **Step 2: Verify the typing-SVG URL responds**

Run: `curl -s -o /dev/null -w "%{http_code}\n" "https://readme-typing-svg.demolab.com?font=JetBrains+Mono&lines=test"`
Expected: `200`

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "feat: add animated header to profile README"
```

---

## Task 3: whoami (About) section

**Files:**

- Modify: `README.md` (append below header).

- [ ] **Step 1: Append the whoami block**

Append to `README.md`:

```markdown
### whoami 🐢

- 🚀 I generate side projects at factory speed — and actually ship them
- 🎮 Games & tiny apps: **Phaser**, **Godot**, **Flutter**, **React Native**
- 🤖 Deep into **AI tooling & agent-driven development**
- 📦 **45+ repos and counting** · 🐢 slow but never stops
- 📍 Seoul · ✍️ I write about what I build on [my blog](https://martianlee.github.io)
```

- [ ] **Step 2: Verify no "unfinished" language is present**

Run: `grep -iE "can'?t finish|never finish|unfinished|faster than i (can )?finish|mad at ai" README.md`
Expected: no matches (exit code 1 / empty output). This enforces the recruiter-safety constraint.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "feat: add whoami section"
```

---

## Task 4: Shipped Games + Other Projects (proves shipping)

**Files:**

- Modify: `README.md` (append).

**Two subsections. "Shipped Games" leads, because playable links are the strongest proof of "ships a lot."**

Confirmed live & playable (both return 200):

- `meme-chapchu` — **live web game**, https://meme-chapchu.vercel.app/
- `godot-first-defense` — **playable in browser** (Godot web export on GitHub Pages), https://martianlee.github.io/godot-first-defense/

Non-game builds:

- `fit-claw` — self-hosted, agent-first fitness logging backend (Bun + Hono + SQLite)
- `project-more-munch` — lunch-recommendation service for office workers (NestJS + Prisma)

> **User-supplied additions:** the user said more games are shipped (web + GitHub Pages), but several live from **private** repos whose deploy URLs can't be auto-discovered. Before this task, ask the user for any extra live game URLs and add each as a `▶ Play` row in the Shipped Games table using the same pattern. If none are supplied, ship with the two confirmed games.

- [ ] **Step 1: Append the Shipped Games section**

Append to `README.md`:

```markdown
### 🎮 Shipped Games

> Playable, in your browser, right now — no install.

<table>
  <tr>
    <td width="50%" valign="top">
      <a href="https://martianlee.github.io/godot-first-defense/">
        <img src="https://github-readme-stats.vercel.app/api/pin/?username=MartianLee&repo=godot-first-defense&theme=catppuccin_latte" alt="godot-first-defense" />
      </a>
      <p>🏰 <b>First Defense</b> — a Godot 4.6 2.5D roguelike tower defense: 3-unit merges, tag synergies, relics & meta progression. <b><a href="https://martianlee.github.io/godot-first-defense/">▶ Play in browser</a></b></p>
    </td>
    <td width="50%" valign="top">
      <a href="https://meme-chapchu.vercel.app/">
        <img src="https://github-readme-stats.vercel.app/api/pin/?username=MartianLee&repo=meme-chapchu&theme=catppuccin_latte" alt="meme-chapchu" />
      </a>
      <p>🎵 <b>찹츄 녹음기</b> — a meme rhythm web game. Tap chap/chu, make a beat, share the link. <b><a href="https://meme-chapchu.vercel.app/">▶ Play it</a></b></p>
    </td>
  </tr>
</table>
```

- [ ] **Step 2: Append the Other Projects section**

Append to `README.md`:

```markdown
### 🧰 Other Projects

<table>
  <tr>
    <td width="50%" valign="top">
      <a href="https://github.com/MartianLee/fit-claw">
        <img src="https://github-readme-stats.vercel.app/api/pin/?username=MartianLee&repo=fit-claw&theme=catppuccin_latte" alt="fit-claw" />
      </a>
      <p>💪 <b>fit-claw</b> — a self-hosted, agent-first fitness logging backend (Bun · Hono · SQLite). Log workouts by chat, not forms.</p>
    </td>
    <td width="50%" valign="top">
      <a href="https://github.com/MartianLee/project-more-munch">
        <img src="https://github-readme-stats.vercel.app/api/pin/?username=MartianLee&repo=project-more-munch&theme=catppuccin_latte" alt="project-more-munch" />
      </a>
      <p>🍱 <b>More Munch</b> — a lunch-recommendation service for office workers (NestJS · Prisma), with an AI-assistant integration.</p>
    </td>
  </tr>
</table>
```

- [ ] **Step 3: Verify both live game links return 200**

Run:

```bash
for u in "https://martianlee.github.io/godot-first-defense/" "https://meme-chapchu.vercel.app/"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 10 "$u")  $u"
done
```

Expected: both `200`. Also run this for any user-supplied game URLs added in Step 1.

- [ ] **Step 4: Verify each showcased repo exists**

Run: `for r in godot-first-defense meme-chapchu fit-claw project-more-munch; do gh repo view MartianLee/$r --json name -q .name; done`
Expected: each repo name prints (no errors).

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "feat: add Shipped Games and Other Projects sections"
```

---

## Task 5: Latest from the Blog — static links (v1)

**Files:**

- Modify: `README.md` (append).

- [ ] **Step 1: Append the blog section**

Append to `README.md`:

```markdown
### ✍️ Latest from the Blog

I read codebases and write architecture deep-dives at **[martianlee.github.io](https://martianlee.github.io)**:

- [Semble Architecture: agent-oriented RAG with static embeddings](https://martianlee.github.io/posts/2026-06-04-semble-architecture)
- [CodeGraph: the code intelligence layer beneath coding agents](https://martianlee.github.io/posts/2026-06-04-codegraph-architecture)
- [WeKnora: RAG + ReAct agent + Wiki mode in one framework](https://martianlee.github.io/posts/2026-05-30-weknora-architecture)
- [Ruflo: an agent OS on top of Claude Code](https://martianlee.github.io/posts/2026-05-17-ruflo-architecture)
- [OpenHands: running a coding agent as a product](https://martianlee.github.io/posts/2026-05-17-openhands-architecture)
```

- [ ] **Step 2: Verify every blog link returns 200**

Run:

```bash
for s in 2026-06-04-semble-architecture 2026-06-04-codegraph-architecture 2026-05-30-weknora-architecture 2026-05-17-ruflo-architecture 2026-05-17-openhands-architecture; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' -L https://martianlee.github.io/posts/$s)  $s"
done
```

Expected: all `200`. If any is non-200, fix the slug or drop that line before committing.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "feat: add static blog links section"
```

---

## Task 6: Stats & Toys — widgets

**Files:**

- Modify: `README.md` (append).

- [ ] **Step 1: Append the stats/widgets block**

Append to `README.md` (the snake `<img>` points to the `output` branch produced in Task 7; it will 404 until that workflow runs once — acceptable, GitHub shows alt text meanwhile):

```markdown
### 📊 Stats & Toys

<div align="center">

<img src="https://github-readme-stats.vercel.app/api?username=MartianLee&show_icons=true&theme=catppuccin_latte" alt="GitHub stats" height="165" />
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=MartianLee&layout=compact&theme=catppuccin_latte" alt="Top languages" height="165" />

<img src="https://github-readme-streak-stats.herokuapp.com/?user=MartianLee&theme=catppuccin_latte" alt="GitHub streak" />

<img src="https://github-profile-trophy.vercel.app/?username=MartianLee&theme=flat&no-frame=true&column=7&margin-w=8" alt="Trophies" />

<img src="https://raw.githubusercontent.com/MartianLee/MartianLee/output/github-contribution-grid-snake.svg" alt="Contribution snake animation" />

</div>
```

- [ ] **Step 2: Verify streak + top-langs widget URLs respond in a browser**

Run: `curl -s -o /dev/null -w "%{http_code}\n" -L "https://github-readme-streak-stats.herokuapp.com/?user=MartianLee&theme=catppuccin_latte"`
Expected: `200`. (For `github-readme-stats` and `github-profile-trophy`, a curl `503`/`402` is the shared instance rate-limiting — open the URL in a browser to confirm it renders.)

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "feat: add stats, streak, trophy, and snake widgets"
```

---

## Task 7: Snake animation GitHub Action

**Files:**

- Create: `.github/workflows/snake.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/snake.yml`:

```yaml
name: Generate Snake

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Generate snake SVG
        uses: Platane/snk@v3
        with:
          github_user_name: ${{ github.repository_owner }}
          outputs: |
            dist/github-contribution-grid-snake.svg

      - name: Push to output branch
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> Note: if the repo default branch is `master`, change the `push.branches` entry accordingly. Verify with `git branch --show-current` from Task 1.

- [ ] **Step 2: Validate the YAML parses**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/snake.yml')); print('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/snake.yml
git commit -m "ci: add daily snake-animation workflow"
```

---

## Task 8: Footer, final review, and push

**Files:**

- Modify: `README.md` (append footer).

- [ ] **Step 1: Append the footer**

Append to `README.md`:

```markdown
---

<div align="center">

🐢 <i>build a lot, ship a lot</i><br/>
<sub>prev. "Earth Driven Developer" — a story for another day</sub>

<br/><br/>

<a href="https://martianlee.github.io/"><img src="https://img.shields.io/badge/BLOG-92A051?style=flat-square&logo=blogger&logoColor=white" alt="blog"/></a>
<a href="https://github.com/MartianLee"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="github"/></a>

</div>
```

- [ ] **Step 2: Full recruiter-safety + link sweep**

Run:

```bash
grep -iE "can'?t finish|never finish|unfinished|faster than i (can )?finish|mad at ai" README.md && echo "FOUND BAD PHRASE" || echo "clean"
```

Expected: `clean`.

- [ ] **Step 3: Local markdown render preview**

Render the README locally to eyeball layout (pick whichever is available):

```bash
grip README.md --export /tmp/readme-preview.html 2>/dev/null && echo "rendered to /tmp/readme-preview.html" || echo "grip not installed; open the GitHub preview after pushing"
```

Manually confirm: header animation block, 2x2 showcase grid, blog links, widgets, footer all present and ordered correctly.

- [ ] **Step 4: Get explicit user approval to push**

Show the user the final `README.md` (and the preview if rendered). Per push policy, do NOT push until they say yes.

- [ ] **Step 5: Push the branch and open a PR**

```bash
git push -u origin feat/profile-readme-redesign
gh pr create --title "Redesign profile README" --body "Personality-first profile that proves shipping volume; adds daily snake workflow."
```

(Or, if the user prefers to commit straight to the default branch, merge/fast-forward instead.)

- [ ] **Step 6: Trigger the snake workflow once so the animation appears**

After merge to the default branch:

```bash
gh workflow run "Generate Snake" -R MartianLee/MartianLee
```

Then confirm the `output` branch gets `github-contribution-grid-snake.svg` and the README image resolves.

---

## Deferred follow-up (out of scope for this plan)

- Add an RSS/Atom route to the blog repo (`martianlee.github.com`), then replace Task 5's static blog list with `gautamkrishnar/blog-post-workflow` auto-population.
