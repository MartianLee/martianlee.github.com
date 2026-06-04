# GitHub Profile README Redesign — MartianLee/MartianLee

- **Date**: 2026-06-05
- **Owner**: SeongHwa Joy (MartianLee)
- **Target repo**: `MartianLee/MartianLee` (special profile repo, `README.md`)
- **Goal**: Replace the current minimal README with a personality-driven profile that
  also showcases shipped side projects.

## Direction (agreed)

- **Focus**: Personality/persona first (B), with a project showcase woven in (partial A).
- **Language**: English.
- **Tone**: Playful / witty, 🐢 turtle character used actively.
- **Widgets**: Full set (stats, trophy, streak, snake) + blog feed (see caveat).
- **Framing**: "Builds a lot **and ships a lot**." Avoid any "can't finish" nuance.
  Volume is a strength, proven with numbers; shipping is proven with live demos.

## Recruiter-safety constraints

These were explicitly flagged and must hold:

1. **No "doesn't finish" signal.** Never imply unfinished work. Replace
   "shipping faster than I can finish" → "I build a lot, and actually ship them".
2. **AI framed positively.** "Mad at AIs" → "Deep into AI tooling & agent-driven
   development." No anti-AI reading.
3. **Cryptic in-jokes demoted.** "prev. Earth Driven Developer" moves to a light
   footer line, not the headline.
4. **Showcase proves completion.** Prefer projects with live demo / playable links
   so "I ship" is visually evident.
5. **Emoji/drip density** kept lively but not overwhelming (recruiter-readable).

## Section layout

1. **Header** — centered typing-SVG animation cycling catchphrases:
   - `Crazy Side Project Generator`
   - `I build a lot — and I ship a lot`
   - `Games, apps, and everything in between`
   - 🐢 wordmark above.

2. **whoami (About)** — witty bullet list:
   - 🚀 generates side projects at factory speed — and actually ships them
   - 🎮 games & tiny apps: Phaser, Godot, Flutter, React Native
   - 🤖 deep into AI tooling & agent-driven development
   - 📦 45+ repos and counting · 🐢 slow but never stops
   - 📍 Seoul · ✍️ writes about what he builds on the blog

3. **Side Project Lab (showcase)** — 2-column grid of repo pin cards via
   `github-readme-stats` for: `fit-claw`, `project-more-munch`,
   `godot-first-defense`, + blog. Each with a one-line witty caption and, where
   available, a live/playable link. Order so projects with live demos lead.

4. **Latest from the Blog** —
   - **v1 (now): static links** to recent posts, manually curated. The blog has no
     RSS feed (only `app/sitemap.ts`), so automation is not yet possible.
   - **Deferred follow-up**: add an RSS/Atom route to the blog repo
     (`martianlee.github.com`), then enable `gautamkrishnar/blog-post-workflow` to
     auto-populate this section.

5. **Stats & Toys** — full widgets:
   - GitHub Stats card (keep `catppuccin_latte` theme, matches current README)
   - 🏆 Trophy card (`ryo-ma/github-profile-trophy`)
   - 🔥 Streak card (`github-readme-streak-stats`)
   - 🐍 Snake contribution animation (generated GIF)

6. **Footer** — light witty close + links:
   - `🐢 build a lot, ship a lot`
   - `prev. "Earth Driven Developer" (a story for another day)`
   - Blog badge + repo links.

## Automation (GitHub Actions in MartianLee/MartianLee)

1. **Snake animation** — `Platane/snk` action on a daily cron + manual dispatch.
   Outputs a GIF to a branch (e.g. `output`) consumed by an `<img>` in the README.
2. **Blog feed** — **deferred** until the blog exposes RSS. Not part of v1.

## Out of scope (YAGNI)

- Blog RSS route creation (separate task in the blog repo; only a prerequisite note).
- Visitor counters, Spotify "now playing", and other novelty widgets.
- Localization / Korean version of the README.

## Success criteria

- README reads as energetic and distinctive, but a recruiter skimming it concludes
  "prolific maker who ships," with zero "unfinished" impression.
- Showcase cards render and link to working/live projects where possible.
- Stats, trophy, streak render; snake animation builds via Actions.
- No broken images or dead links.
