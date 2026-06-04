# Blog Redesign — "Bold Editorial"

- **Date:** 2026-06-04
- **Status:** Implemented on branch `redesign/bold-editorial` (2026-06-04). Verified light/dark + post/about/kb in-browser.
- **Supersedes:** `2026-05-13-homepage-ai-portfolio-redesign-design.md` (the "AI portfolio" home — the very look this redesign moves away from)
- **Scope of this spec:** Visual redesign only, built i18n-ready. The i18n framework and post translation are **separate follow-up specs.**

---

## 1. Goal & Problem

현재 블로그는 Tailwind Next.js Starter Blog 템플릿의 기본 외형이라 "AI가 찍어낸 홈" 처럼 보입니다. 목표는 **"매우 뛰어나지만 감각 있는, 힙한 개발자"** 의 인상입니다.

추가 제약(글로벌 개발자 취업 목표에서 파생):

- 사이트 카피는 **영어 기본**. (i18n 토글로만 한국어 노출 — 본 스펙의 후속)
- **리크루터 친화적** — 포지셔닝/경력/CV/연락처가 쉽게 스캔되어야 함.

### AI 느낌의 주범 (제거 대상)

1. "Professional Blue" 단일 팔레트 (`css/tailwind.css`의 `--color-primary-*`가 blue).
2. `components/home/HeroSection.tsx` — 떠다니는 그라데이션 블롭(`animate-blob`), 이름에 입힌 그라데이션 글자, 3초마다 바뀌는 직함, `scale-105` 버튼, 일반적 카피("6+ years… millions of users").
3. 템플릿 기본 섹션 구성(Hero → TechStack → Featured → Recent), 로고 그리드, 메트릭 카운터.

### 살릴 자산

- 폰트 감각: Space Grotesk + JetBrains Mono (유지/강화).
- `/notes`(KB)의 앰버-온-다크 "Knowledge IDE" 테마 — 사이트에서 가장 개성 있는 부분. **그대로 유지.**

---

## 2. Scope

**In scope (this spec):**

- 디자인 시스템(팔레트·타이포·폭·부품 키트) 재정의.
- 페이지 리디자인: 홈, 포스트, 글 목록/태그, 프로젝트, About, 404, 헤더/푸터.
- i18n-readiness 훅(EN/KO 토글 자리, 한국어 폰트 폴백, 로케일 비종속 컴포넌트).
- 죽은 코드/AI 템플릿 시그널 제거.

**Out of scope → follow-up specs:**

- i18n 프레임워크(라우팅, 메시지 카탈로그, EN 기본/KO 토글 동작). 정적 export(GitHub Pages) 제약 고려 필요.
- 기존 한국어 글의 영어 번역.
- `/notes`(KB) 내부 리디자인 — **건드리지 않음.**

---

## 3. Direction & Principles — "Bold Editorial"

방향 A(Editorial)를 **영어 + 매우 볼드한 타이포**로 확장. 잡지 같은 절제 + 큰 그로테스크 타이포 + 단색 액센트.

원칙:

1. **타이포가 주인공.** 큰 Space Grotesk Bold masthead, 읽기용 세리프 본문.
2. **단색 + 단일 액센트.** 따뜻한 종이/잉크 모노톤에 러스트(rust) 하나.
3. **구조를 드러낸다.** 모노 eyebrow, 번호 매긴 섹션(`01 —`), 얇은 룰 라인, 날짜/메타는 모노.
4. **2단 폭.** 구조는 넓게(1100px), 읽는 글은 좁게(820px).
5. **정직한 개성.** `/notes`는 한국어 + 앰버로 "다른 세계"임을 콘셉트로 인정.
6. **장식 금지.** 블롭/그라데이션 글자/회전 직함/scale 호버/이모지 카드 없음.

---

## 4. Foundations

### 4.1 Color

**Light (default)**

| Token         | Hex       | 용도                         |
| ------------- | --------- | ---------------------------- |
| paper         | `#f4efe4` | 페이지 배경(따뜻한 종이)     |
| surface       | `#fbf9f3` | 카드/코드 인라인 배경        |
| ink           | `#1a1712` | 본문 텍스트(warm near-black) |
| muted         | `#8c8475` | 보조 텍스트/메타             |
| line          | `#ddd6c7` | 보더/룰                      |
| accent        | `#c2410c` | 러스트 액센트(링크/마크)     |
| accent-strong | `#9a3412` | hover                        |

**Dark (toggle) — warm, not cold gray**

| Token   | Hex       |
| ------- | --------- |
| bg      | `#14110b` |
| surface | `#1d1a12` |
| text    | `#e9e3d5` |
| muted   | `#8c8475` |
| line    | `#2b2720` |
| accent  | `#ea580c` |

**Tailwind 매핑 (저-churn 전략):** `css/tailwind.css`의 `--color-primary-*` blue 램프를 **rust 램프로 교체**하면 기존 `text-primary-500/600` 사용처가 자동으로 러스트가 됨. 제안 램프(anchor: 500 `#ea580c`, 600 `#c2410c`, 700 `#9a3412`):

```
50 #fef6f0 · 100 #fde8da · 200 #fbcfb4 · 300 #f6ab83 · 400 #f07c4e
500 #ea580c · 600 #c2410c · 700 #9a3412 · 800 #7c2d12 · 900 #6b2613 · 950 #3a1206
```

추가로 paper/ink/muted/line/surface 시맨틱 토큰을 정의하고, `.dark`에서 값이 뒤집히도록 구성. 기존 `bg-white/dark:bg-gray-950`, `text-black/dark:text-white`(`app/layout.tsx`)와 `divide-gray-*`, `text-gray-*` 직접 사용처를 시맨틱 토큰으로 점진 치환.

### 4.2 Typography

| 역할                    | 폰트                                                |
| ----------------------- | --------------------------------------------------- |
| Display / UI / headings | **Space Grotesk** (700/600/500)                     |
| 본문(글 읽기)           | **Newsreader** (serif, 400/500 + italic)            |
| 라벨 / 메타 / 코드      | **JetBrains Mono**                                  |
| 한국어 폴백             | **Pretendard** (토글 시 본문·네비, 그리고 `/notes`) |

- `app/layout.tsx`: `Instrument_Serif` 제거, **`Newsreader` 추가**. Space Grotesk·JetBrains Mono 유지. Pretendard는 폰트 스택 폴백으로 추가(`next/font` 또는 CDN).
- `--font-family-serif`를 Newsreader로 교체. sans 스택에 Pretendard 폴백 포함: `var(--font-space-grotesk), 'Pretendard', ui-sans-serif, …`.

**스케일(대략):** display(masthead) `clamp(56px, 9vw, 98px)`/700/lh 0.82 · h1(post) 48 · h2 28 · h3 19~20 · body **20px / lh 1.7 (serif)** · meta/label 11~12 mono.

### 4.3 Width — 2단 폭

- 구조(홈/목록/프로젝트/포스트 헤더): **max-width ~1100px** (`SectionContainer`를 1100으로; 현재 `max-w-3xl xl:max-w-5xl`에서 상향).
- 글 본문(prose): **max-width ~820px, body 20px** (현재 `prose max-w-none`을 820 컬럼으로 제약). 제목·메타·이미지는 1100, 읽는 텍스트만 820.

### 4.4 Kit of parts

- **eyebrow** — 모노, 11px, letter-spacing 0.16em, uppercase, 러스트.
- **section number** — `01 — Projects` 모노, 상단 1.5px 잉크 룰 + 우측 "All … →".
- **rule** — 1px line 컬러.
- **tag chip** — 모노 11px, 1px line 보더, pill.
- **link** — 러스트 + 얇은 언더라인(underline-offset 3px).
- **ghost button** — 1.5px 잉크 보더, 투명 배경(현재 그라데이션/scale 버튼 대체).
- **list row** — 좌: 제목(그로테스크 600/700) + 세리프 dek, 우: 모노 날짜/메타, 하단 1px line.

---

## 5. Copy deck (English, 제안 — 사용자 최종 확정 대상)

- Hero eyebrow: `Software Engineer @ UJET · ex-Founder/CTO · Seoul, open to global roles`
- Hero masthead: `MARTIAN LEE.`
- **Hero line (확정):** `I move fast with AI — and keep the decisions that matter human.`
- Writing 섹션 dek (확정): `I take large codebases apart and write down how they actually work.`
- Availability: `Open to senior / staff engineering roles — globally.`
- Footer: `© 2026 Martian Lee — hand-built, no template energy.` / `Seoul · UTC+9`

> 주의: eyebrow/availability 같은 사실 주장(현직/직함/구직 의사)은 구현 전 사용자 확인. About 장문에는 사용자 노트의 철학("Coordinating Externalized Intelligence, but important decisions stay human")을 반영.

---

## 6. Pages

### 6.1 Header (`components/Header.tsx`)

- 종이 배경, 좌: `ML.` 워드마크. 우: 모노 네비 `Projects · Writing · Notes · About · CV ↗`.
- 우측 클러스터: **EN/KO 토글(스텁)** · 테마 스위치(☾) · ⌘K 검색.
- nav 순서 `data/headerNavLinks.ts` 갱신: Projects, Writing(=/posts), Notes(=/kb), About. **"Home" 항목 제거**(`ML.` 워드마크가 home 링크). CV는 별도(외부 PDF) 링크.
- 모바일: 풀스크린 모노 메뉴(`MobileNav` 리스타일).

### 6.2 Footer (`components/Footer.tsx`)

- 미니멀 모노. 카피 + `Seoul · UTC+9` + 소셜 아이콘(현재 다수 → mail/github/linkedin 등 실제 있는 것만).

### 6.3 Home (`app/page.tsx` + `components/home/*`)

순서:

1. **Masthead hero** — eyebrow / `MARTIAN LEE.` / hero line / 액션 모노 링크(View projects ↓ · Writing · CV ↗ · GitHub ↗). 블롭/회전/그라데이션 전부 제거.
2. **01 — Projects** — featured 프로젝트(`data/projectsData.ts`) row 리스트 + 기술스택 모노 + GitHub/Demo. "All projects →".
3. **02 — Selected writing** — 머리글 dek("I take large codebases apart…"). 상위 2건은 큰 타이틀+세리프 요약, 이하 모노 리스트. "All posts →".
4. **03 — Experience** — `data/careerData.ts` 타임라인(UJET / Stepping / Miso) + "Download CV (PDF) ↗".
5. **Contact/availability** — 🟢 availability 라인 + Email/GitHub/LinkedIn.
6. **Footer.**

`/notes` 프로모 스트립은 홈에 **두지 않음**(상단바에만).

### 6.4 Post (`layouts/PostLayout.tsx`, `PostSimple.tsx`)

- **넓은 헤더(1100):** ← Writing, 태그, h1(48), 세리프 dek, 메타(아바타·날짜·읽기시간).
- **좁은 본문(820/20 serif):** prose 컬럼 제약.
- **코드블록 warm 리테마** — 기존 night-owl(파랑/보라) 대신 warm-dark 배경 + 러스트 키워드 + 절제된 그린 문자열. `css/tailwind.css`의 `.prose pre/code`와 `css/prism.css` 토큰 색 교체.
- 블록쿼트: 러스트 좌측 보더. 인라인 코드: warm.
- **목차** — 인라인 "On this page"(기본). 우측 sticky 사이드바는 옵션 enhancement.
- 하단: 태그 / Edit on GitHub / prev·next / giscus 코멘트(유지).

### 6.5 Posts list & Tags (`layouts/ListLayoutWithTags.tsx`)

- 홈 row 시스템 재사용(1100). 좌측 태그 필터 레일(모노). 페이지네이션 모노.
- 태그 인덱스: 모노 태그 + 카운트.

### 6.6 Projects (`app/projects`, `components/Card.tsx`)

- 무거운 카드 대신 에디토리얼 row 리스트. game/non-game 그룹 유지(절제된 헤딩). 기술스택 모노 한 줄 + GitHub/Demo 링크. featured 우선.

### 6.7 About (`layouts/AuthorLayout.tsx`, `data/authors/*`)

- 820 세리프 장문. 바이오 + 철학(Externalized Intelligence / 결정은 사람) + Experience 타임라인 + CV(PDF) + 연락처. 리크루터 정조준.

### 6.8 404 (`app/not-found.tsx`)

- 작은 에디토리얼 처리(거대한 `404` 그로테스크 + 모노 한 줄 + Home 링크).

### 6.9 `/notes` (KB) — **변경 없음**

- `app/kb/*`, `components/kb/*`, `css/tailwind.css`의 `.kb-theme`/`body.kb-active`/`.kb-breakout` 전부 유지. 한국어 유지. 새 디자인은 진입(헤더 nav)만 일관되게.

---

## 7. i18n-readiness (이번 스펙에서 "대비"만)

- 헤더에 **EN/KO 토글 컴포넌트(스텁)** 배치 — 클릭 동작은 후속 스펙에서 연결. 기본 표기 `EN / KO`(EN active).
- **Pretendard 폴백**을 폰트 스택에 포함(토글 시/`/notes`에서 한국어가 깔끔).
- 컴포넌트는 **로케일 비종속**으로: UI 문자열을 흩뿌리지 말고 가능한 한 한곳(예: `data/siteMetadata` 또는 작은 strings 모듈)에 모아 후속 next-intl 류 도입을 쉽게.
- 라우팅/콘텐츠 번역 구조는 **건드리지 않음**(후속).

---

## 8. Implementation map (files)

**교체/리디자인**

- `css/tailwind.css` — primary 램프 rust로, paper/ink/muted/line/surface 토큰 추가, dark warm 토큰, `.prose` 색/폭, 코드 warm 리테마. `.kb-theme*`는 유지. `animate-blob`/blob keyframes 제거.
- `css/prism.css` — 코드 토큰 색 warm 팔레트로.
- `app/layout.tsx` — 폰트(Newsreader 추가, Instrument 제거, Pretendard 폴백), body 배경/텍스트를 시맨틱 토큰으로.
- `app/page.tsx` — 새 홈 구성(아래 컴포넌트 사용).
- `components/Header.tsx`, `components/Footer.tsx`, `components/MobileNav.tsx` — 리디자인 + 토글 슬롯.
- `components/SectionContainer.tsx` — 1100 폭.
- `layouts/PostLayout.tsx` (+ `PostSimple.tsx`) — 2단 폭, 코드, 목차, 메타.
- `layouts/ListLayoutWithTags.tsx` — 에디토리얼 리스트.
- `layouts/AuthorLayout.tsx` — About.
- `components/Card.tsx` / projects 페이지 — 프로젝트 row.
- `data/headerNavLinks.ts` — nav 순서/항목.
- `components/Tag.tsx`, `components/Link.tsx` — 칩/링크 스타일.

**신규**

- `components/LanguageToggle.tsx` (스텁).
- 홈 섹션 컴포넌트: `Masthead`, `ProjectsSection`, `WritingSection`, `ExperienceSection`, `ContactSection` (기존 home/\* 재작성 또는 신규).
- CV PDF 에셋 자리(`public/static/...`) — 실제 파일은 사용자 제공 전까지 링크 placeholder.

**삭제**

- `app/Main.tsx` (죽은 코드).
- `components/home/Greeting.tsx` (그라데이션 인사), `HeroSection.tsx`(블롭 히어로), `TechStackSection.tsx`(로고 그리드), `ImpactMetricsSection.tsx`(메트릭). `FeaturedSection.tsx`/`RecentPostsSection.tsx`는 새 Writing/Projects 섹션으로 흡수.

---

## 9. Success criteria / Verification

- [ ] 사이트 어디에도 blue primary 없음 — 러스트 액센트만.
- [ ] 블롭/회전 직함/그라데이션 글자/scale 호버/로고 그리드/메트릭 카운터 부재.
- [ ] 홈이 새 순서(Hero → Projects → Writing → Experience → Contact), 전부 영어.
- [ ] 글 본문 820/20 세리프, 헤더는 1100. 코드블록 warm.
- [ ] 다크모드가 warm near-black로 일관.
- [ ] 헤더에 EN/KO 토글(스텁) + Pretendard 폴백 동작.
- [ ] `/notes`(KB) 외형/동작 변화 없음.
- [ ] 정적 export 빌드(`yarn build`)·lint 통과, 데스크톱/모바일 스크린샷 확인, 텍스트 오버랩 없음, `prefers-reduced-motion` 존중.

---

## 10. Open items (구현 전 확정)

- eyebrow/availability 최종 워딩(사실 주장 검증).
- 본문 세리프(Newsreader) 최종 확정 — 글 레이아웃에서 OK 받았으나 실제 렌더 후 재확인.
- 목차: 인라인 vs sticky 사이드바(기본 인라인).
- CV PDF 실제 파일 확보 시점.
