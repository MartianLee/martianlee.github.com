# Red Horizon 사이트 전체 리디자인 설계

- 날짜: 2026-10-10
- 상태: 승인됨 (2026-10-10 프리뷰 확인 후 "지금 좋습니다")
- 프리뷰(페이지별, 클릭 가능): https://claude.ai/artifact/KVHyrUHhTQkEaRveQ9tPTf
- 방향 비교 보드와 원본 시안: https://claude.ai/artifact/KBeQx4jtqcPjDdxW1RTc3o , 라이브 `/lab` (noindex)
- 레퍼런스 구현(프리뷰 소스): `/Users/dede/workspace/martianlee.github.com/.notes/red-horizon/reference/` (untracked)
- 진행 방식: 설계·플랜·리뷰는 메인 모델, 태스크별 구현은 sonnet 서브에이전트, 시각 검증은 Playwright 스크린샷

## 1. 배경과 목표

홈 비주얼 업데이트 요구사항은 네 가지였습니다. ① 모션 그래픽 ② 시각적으로 화려함 ③ 첫 로딩이 아주 빠를 것(에셋 최소) ④ AI가 만든 걸 알아도 "와" 하는 느낌. 세 시안 중 A(Red Horizon)를 골랐고, 사용자 결정은 다음과 같습니다.

1. A의 히어로(화성 지평선에 반쯤 묻힌 이름, 라이트=화성의 오후, 다크=파란 일몰, 실시간 화성 계기판)는 그대로 둡니다.
2. 홈의 나머지 섹션(프로젝트, 최근 글, 경력, 연락)에도 고품질 인터랙션을 넣습니다.
3. 경력은 C 시안의 연도 축 재직 기간 막대를 A 언어로 다시 그립니다.
4. KB(`/kb` 이하)를 뺀 모든 페이지에 A 느낌을 적용합니다.
5. About에는 새 A 스타일 모션 그래픽을 넣되, 글자가 잘 읽히는 것이 최우선입니다.
6. 프로젝트 설명은 홈과 목록에서 한 줄로 줄이고, 긴 설명은 상세 페이지에만 둡니다.
7. 글 상세의 자동 섹션 번호와 스크롤 목차, `/climate`는 크롬(헤더, 푸터, 서체)만 맞추는 것, 경력 막대의 연 단위 표시는 제안대로 갑니다.

이번에 하지 않는 것: KB 리디자인, 기존 글 요약 일괄 수정, 새 기능(검색 개편 등), 이미지 추가.

## 2. 레퍼런스 구현

프리뷰는 정적 HTML로 이미 완성된 코드입니다. 구현은 이 코드를 React 컴포넌트와 CSS로 옮기는 작업이며, 모양과 동작이 다르면 레퍼런스가 기준입니다.

| 영역 | 레퍼런스 파일 (`.notes/red-horizon/reference/`) |
|---|---|
| 공통 토큰·헤더·섹션·오브·푸터 | `site.css` |
| 홈 (히어로 + 섹션 인터랙션 + 경력 막대 + 연락 줄) | `index.html` (히어로 원본은 `a-original.html`) |
| 내부 페이지 공통 밴드, 목록·상세 스타일 | `inner/inner.css`, `inner/*.src.html` (빌드 결과는 `posts.html` 등) |
| 글 목록 / 글 상세 | `posts.html`, `post.html` |
| 프로젝트 목록 / 상세 | `projects.html`, `project.html` |
| 404 | `404.html` |
| About (화성 지구본) | `about.html` |
| 화성 시계 (Mars24, 검증됨) | `shared/mars-clock.js` |

프리뷰 전용 요소는 옮기지 않습니다: 하단 프리뷰 바(`#prevbar`), `data-theme` 기반 테마 전환, Google Fonts `<link>`.

## 3. 디자인 시스템

### 3.1 테마 토큰

사이트 테마는 next-themes가 `<html class="dark">`로 바꿉니다. 프리뷰의 `prefers-color-scheme`/`[data-theme]` 블록은 `:root`(라이트)와 `html.dark`(다크) 두 블록으로 옮깁니다.

**A 시스템은 `--rh-` 접두어가 붙은 자기 토큰만 씁니다.** 기존 토큰(`--paper --surface --ink --muted --line --accent`)과 Tailwind 매핑(`text-muted` 등)은 값을 바꾸지 않습니다. KB가 `text-muted`를 50곳에서 쓰고 있어서, 공유 토큰 값을 바꾸면 KB 화면이 달라지기 때문입니다.

| 토큰 | 라이트 | 다크 | 비고 |
|---|---|---|---|
| `--rh-paper` | #f4efe4 | #14110b | 기존 `--paper`와 같은 값 |
| `--rh-surface` | #fbf8f1 | #1c1812 | |
| `--rh-ink` | #1a1712 | #ebe4d6 | |
| `--rh-muted` | #6b6356 | #a59c8b | 기존 #8c8475보다 대비가 높음 |
| `--rh-line` | #dcd4c4 | #2c271f | |
| `--rh-accent` | #c2410c | #ea580c | |
| `--rh-accent-text` | #9a3412 | #f6ab83 | 하늘 위 작은 액센트 글자 대비용 |
| `--rh-head-accent` | #5c1d07 | #f6ab83 | 헤더 액센트 글자(현재 메뉴·hover·CV). 실제 밴드 픽셀 위 최저 대비 라이트 5.30:1, 다크 7.29:1(기본 밴드). `--rh-accent`는 라이트 1.97:1, 다크는 해 광륜·메사 위에서 1.96:1까지 떨어짐 |
| `--rh-ok` | #2f7d46 | #4fb36d | 상태 점 |
| `--rh-space` | #211c16 | #0b0907 | 오브 타일 바탕 |
| `--rh-sky-z --rh-sky-m --rh-sky-h --rh-far --rh-sand-d --rh-monument` | site.css 값 | site.css 값 | 하늘 |
| 밴드용(`--rh-sun`, ground, `--rh-far-2`, dust 등) | inner.css 값 | inner.css 값 | 내부 페이지 밴드 |

### 3.2 서체

- 확인된 사실: Tailwind v4는 `@theme`의 `--font-family-sans` 키를 `.font-sans` 유틸리티에 쓰지 않습니다(`.font-sans` = 시스템 UI 서체). 하지만 변수 자체는 쓰입니다(Task 3에서 정정): `.reading-measure .prose h1–h4`(PostLayout·PostSimple·PostBanner·AuthorLayout)와 viz 컴포넌트 3개(BridgeSpectrum·PixelVsMesh·BridgeLineage, KB 노트 안에서도 렌더)가 `var(--font-family-sans)` = Space Grotesk를 씁니다.
- 그래서 전역 `font-sans`는 그대로 두고, Space Grotesk와 `--font-family-sans` 줄도 그대로 두되 `preload: false`로 바꿉니다. 쓰는 글자가 있는 페이지에서만 내려받습니다(KB 차트 라벨 유지).
- Display: **Archivo** 정적 인스턴스 2개(next/font/local, `variable: '--font-archivo'`, 라틴 서브셋 각 약 14.5 KB). 이름·밴드 제목은 `font-stretch: 125%` + 800, 제목류는 100% + 700. 가변 폰트(next/font/google, `axes: ['wdth']`)의 라틴 파일이 88 KB로 측정되어 아래 규칙대로 전환했습니다. 굵기 800 = 확장형(wdth 125) 파일, 700 = 표준 폭(wdth 100) 파일로 1:1 대응하므로, 800 표준 폭이나 700 확장형 조합은 쓰지 않습니다(브라우저는 폭을 합성하지 않음).
- A 컴포넌트는 `--rh-display`(Archivo 스택), `--rh-serif`(Newsreader + 42dot Sans 스택), `--rh-mono`(JetBrains Mono + 42dot Sans 스택)를 명시적으로 씁니다. A 페이지의 최상위 래퍼(`.rh-page`)가 본문 기본 서체를 `--rh-serif`로 정합니다(프리뷰에서 body가 하던 역할).
- 빌드 후 Archivo woff2 크기를 재고, 라틴 서브셋이 80 KB를 넘으면 `next/font/local`로 두 정적 인스턴스(wdth 100/700, wdth 125/800)를 셀프 호스팅합니다.

### 3.3 CSS 구성

- `css/red-horizon.css` 하나를 새로 만들어 `css/tailwind.css`에서 `@import` 합니다. site.css, inner.css, 각 페이지 레퍼런스의 `<style>`을 여기로 옮깁니다.
- **모든 클래스는 `rh-` 접두어**를 붙입니다(`.proj-row` → `.rh-proj-row`). 예외적인 이름: `.site-head` → `.rh-head`, `.ring` → `.rh-orb-ring`(Tailwind `ring` 유틸리티와 충돌), 글 본문 규칙(`.prose …`)은 `.rh-reading …`으로 범위를 좁힙니다(KB의 `.prose`를 건드리지 않기 위해).
- 오브 조명은 inner.css 방식(`--lx`/`--ly` CSS 변수)으로 통일합니다. site.css의 고정값(36% 32%)은 기본값으로만 남깁니다.
- 기존 Bold Editorial 유틸리티(`.eyebrow .sec-head .sec-num .chip .list-row .ghost-btn .reading-measure` 등)는 마지막 태스크에서 사용처를 확인해, 아무도 쓰지 않는 것만 삭제합니다.
- 모든 애니메이션은 `prefers-reduced-motion: reduce`에서 꺼집니다.

## 4. 레이아웃 구조

### 4.1 루트 레이아웃 (`app/layout.tsx`)

지금은 헤더·본문·푸터 전체가 `SectionContainer`(max-w 1100) 안에 있어서 풀블리드 하늘을 그릴 수 없습니다. 바꾼 뒤:

```tsx
<body className="bg-paper text-ink antialiased">
  <ThemeProviders>
    <Analytics … />
    <SearchProvider …>
      <Header />            {/* 밴드 위에 absolute */}
      <main id="main">{children}</main>
    </SearchProvider>
    <Footer />              {/* 연락 줄 + 바닥글, 내부에서 .wrap */}
  </ThemeProviders>
</body>
```

- 페이지는 각자 밴드(또는 홈 히어로)를 맨 위에 그리고, 본문은 `.wrap`(최대 1100px + 거터)으로 감쌉니다. `SectionContainer`는 `.wrap`과 같은 폭으로 바꿔 climate 등 기존 페이지에서 계속 씁니다.
- KB: `body.kb-active` 규칙이 `> section`(옛 SectionContainer)을 겨냥합니다. 루트에서 컨테이너가 빠지므로 KB 셸이 풀스크린을 유지하는지 확인하고, 필요하면 셀렉터를 `body.kb-active main` 기준으로 고칩니다. KB 화면은 바꾸지 않는 것이 원칙입니다.

### 4.2 헤더 (`components/Header.tsx`)

A의 헤더: `ML.` 워드마크(Archivo wide 800, 점은 액센트), mono 12px 내비(Projects · Posts · Notes · About · CV ↗, 현재 섹션 표시), EN/KO 토글, 테마 스위치, 검색, 760px 이하 메뉴 버튼. 위치는 `absolute`로 첫 밴드 위에 겹칩니다. 모든 비KB 페이지는 밴드(최소 slim)로 시작하므로 헤더 아래가 항상 하늘입니다. `site-chrome-header` 클래스는 KB 숨김용으로 유지합니다.

### 4.3 푸터 (`components/Footer.tsx`)

A의 연락 줄 + 바닥글을 전역 푸터로 옮깁니다. 연락 줄: 초록 상태 점 + "Open to senior / staff engineering roles — globally.", 링크 Email ↗(mailto) · GitHub ↗ · LinkedIn ↗, 그 아래 실시간 문구 "It is HH:MM in Seoul (UTC+9). A message to Mars would take 13 min 17 s right now."(클라이언트 마운트 후 계산, §7.3). 링크 hover/focus 시 신호 펄스(홈 레퍼런스). 바닥글: `© 2026 MartianLee` · `Seoul · UTC+9`. 홈의 `ContactSection`과 About의 연락 블록은 중복이므로 삭제합니다.

## 5. 페이지별 설계

### 5.1 홈 (`app/page.tsx`)

- **히어로** `components/home/MarsHorizon.tsx` (client). 레퍼런스 `index.html`의 히어로를 그대로 옮깁니다: CSS 하늘 → 실제 `<h1>MARTIAN LEE.</h1>` → 투명 하늘 WebGL 캔버스(사구가 글자 아래를 덮음, "LEE." 아래는 낮은 골짜기) → 전경 텍스트(태그라인, 아이브로, CTA) + HUD. WebGL 코드는 `lib/mars/horizon-renderer.ts`로 분리하고 첫 페인트 뒤(`requestIdleCallback`, 타임아웃 1.2s) 동적 import합니다. 실패·모션 줄이기·저사양 폴백, 테마 전환 시 해 이동(1.5s), 적응형 렌더 스케일(0.75 → 단계적 하향)은 레퍼런스 그대로입니다.
- **HUD** `components/home/MarsHud.tsx` (client): 제제로 크레이터 현지 시각, MTC, MSD, `MY 39 · Ls 4.9° · northern spring`, 지구→화성 빛 시간. 1초마다 갱신. SSR에서는 자리표시(—)를 그리고 마운트 후 채웁니다(정적 빌드 시점 값이 박히면 안 됨).
- **01 Projects**: 대표 프로젝트 4개, 한 줄 설명(`summary`), 프로젝트별 CSS 오브. 포인터가 태양: 오브의 밝은 면·명암 경계·하이라이트가 포인터 쪽으로 돌고, 행의 빛이 포인터를 따라갑니다. 키보드 포커스는 해가 제목 위에 있는 상태와 같습니다. 터치 기기에서는 끕니다. 훅: `components/hooks/usePointerSun.ts`.
- **02 Recent posts**: 대표 2편(요약 포함) + 3행. 밑줄이 포인터가 들어온 쪽에서 그려지고 나간 쪽으로 걷힙니다. 메타 줄은 대문자 텔레메트리. 행은 포인터를 따라가는 빛 + 살짝 이동 + → 표시.
- **03 Experience**: `components/TenureChart.tsx` (client). 2020–2027 연도 축, 역할별 막대(시작 연도 눈금 → 종료 연도 눈금, 재직 중은 오늘까지 + 펄스 점). 스크러버: 포인터 hover/탭, 또는 축에 포커스 후 ←/→/Home/End(`role="slider"`, `aria-valuetext`). 읽기 문구 예: "2021 · Miso, Frontend Developer · TomorrowUse, Co-founder / CTO". 화면에 들어올 때 막대가 한 번 빛납니다(항상 그려져 있음). 레이아웃 계산은 `lib/tenure.ts`(순수 함수).
- **섹션 제목 정착**: 화면에 들어오면 자간이 조여지는 효과(`components/hooks/useSettleOnView.ts`), 두 상태 모두 읽힘.

### 5.2 내부 페이지 공통 밴드 (`components/HorizonBand.tsx`)

레퍼런스 `inner/inner.css`의 `.band` 패턴: CSS 하늘(라이트: 옅은 해와 헤일로, 다크: 지평선의 파란 일몰), SVG 메사 실루엣(제목 뒤), 바닥 띠가 종이로 페이드, CSS transform 먼지 드리프트, mono 텔레메트리 한 줄. 제목은 지평선에 선 기념비(Archivo wide)이며 어떤 글자의 아래 획도 가리지 않습니다. WebGL은 쓰지 않습니다.

```ts
type HorizonBandProps = {
  title: string            // 큰 제목 (POSTS., PROJECTS. 등). KO 모드면 titleKo
  titleKo?: string
  tele?: ReactNode         // 텔레메트리 한 줄 (실제 수치만)
  variant?: 'monument' | 'headline' | 'slim'   // 목록=monument, 글·프로젝트 상세=headline, climate/praisecat=slim
  dot?: boolean            // 액센트 마침표
  aside?: ReactNode        // 오른쪽 요소(프로젝트 오브, About 지구본, 404 착륙선)
  children?: ReactNode     // 제목 아래 요소(뒤로가기·메타 등)
}
```

### 5.3 글 목록·태그 (`layouts/ListLayoutWithTags.tsx`, `app/tags/page.tsx`)

- 밴드: `POSTS.`(태그 페이지는 태그 이름), 텔레메트리 "Writing log · 69 posts · 276 tags · latest Oct 8, 2026"(빌드 시 데이터에서 계산).
- 데스크톱: 스티키 태그 레일(상위 18개 + "All 276 tags →"). 모바일: 가장자리 페이드가 있는 가로 스크롤러.
- 행: 날짜 + 읽기 시간 게이지(분 ÷ 목록 최대 분), Archivo 제목, 요약 2줄 클램프(전체 요약은 글 상세에), 태그 칩 최대 3개 + "+N". hover/focus 시 빛 스윕, 러스트 밑줄, 게이지 충전, 날짜 러스트.
- 페이지네이션: "← Newer / 1 / 7 / Older →".
- `/tags`: 밴드 `TAGS.` + 칩 구름(카운트 포함).

### 5.4 글 상세 (`layouts/PostLayout.tsx`)

- 밴드(headline): "← Posts · MartianLee · Sep 28, 2026 · 6 min read" + 제목(Archivo wdth 100, 균형 줄바꿈).
- 밴드 아래: 요약(Newsreader 큰 글씨), stage 칩 + 태그 칩.
- 본문: Newsreader 20px, 68ch. 제목은 Archivo, h2 앞에 러스트 mono 섹션 번호(CSS counter). **이미 번호가 붙은 글은 자동 번호를 끕니다**: TOC의 depth 2 항목 중 하나라도 `/^\d+[.)]\s/`로 시작하면 `data-autonum="off"`.
- 목차: 1100px 이상은 오른쪽 스티키 + 스크롤 스파이 + 미끄러지는 러스트 마커, 그 아래는 `<details>`. 상단 러스트 읽기 진행 헤어라인.
- 표는 숫자 우정렬·tabular-nums·모바일 가로 스크롤, 메타데이터 blockquote는 데이터 플레이트 스타일.
- 이전/다음, Edit on GitHub, 댓글(giscus)은 유지. 모션은 본문 칼럼에 넣지 않습니다.
- 확인 대상: mermaid 글, 3D viz 글(탄소 기초), 한국어 글(`/ko/posts/…`), `kind: note` 글.

### 5.5 프로젝트 (`components/projects/ProjectsView.tsx`, `ProjectDetail.tsx`)

- 목록: 밴드 `PROJECTS.` + "Side projects · 10 projects · 7 apps & tools · 3 games", 그룹 "01 Apps & tools"(7), "02 Games"(3). 모든 프로젝트에 고유 오브(inner.css의 6개 추가분 포함), 포인터 태양 조명. 스크린샷 이미지는 목록에서 쓰지 않습니다.
- 상세: 밴드(headline) + 지평선 뒤로 떠오르는 큰 오브(포인터 조명, 느린 회전), 긴 설명(`description`), Live demo / GitHub 버튼, 스크린샷(기존 이미지, `loading="lazy"`)을 크롭 마크 프레임과 "Fig. 1" 캡션(프로젝트 제목)으로, 스펙 시트(Kind, Tech stack, Workflow, Built with AI, Source), 이웃 프로젝트 카드.

### 5.6 About (`layouts/AuthorLayout.tsx`, `components/about/MarsGlobe.tsx`)

- 밴드: 이름 `SeongHwa Lee.`(KO: `이성화.`)이 지평선에 서고, 오른쪽에 접안경(어두운 원판 + 방위 눈금 N/E/S/W) 안의 화성 지구본. 모바일은 지구본이 이름 위.
- 지구본 "Mars, right now": WebGL1 프래그먼트 셰이더(구 레이 교차), 실제 지명 근사 지형(시르티스 메이저, 헬라스, 마리너 계곡, 타르시스, 극관 등 레퍼런스 표), Mars24로 계산한 실제 태양 직하점으로 조명(§7.3). 제제로 핀(현지 시각, 뒷면이면 숨김), 드래그 관성 회전, 방향키, "Face the Sun"/"Face Jezero" 버튼, 텔레메트리 캡션(UTC 시각, 태양 직하점, 제제로 LMST, 계절). 렌더러는 `lib/mars/globe-renderer.ts`로 분리해 지연 로드. 폴백: SVG 화성 일러스트(먼저 그려짐). 모션 줄이기: 정지 프레임 1장.
- 본문: 종이 위 읽기 칼럼(Newsreader 20px, ~68ch). EN은 `data/authors/default.mdx`, KO는 `AboutBioKo`. 지구본은 본문 옆이나 뒤에 오지 않습니다.
- 경력: 간결한 행(막대 없음). 연락 줄과 바닥글은 전역 푸터.

### 5.7 404 (`app/not-found.tsx`)

밴드: "ERROR 404 · NO SIGNAL AT THIS ADDRESS", 제목 `SIGNAL LOST.`, 지평선의 착륙선 실루엣과 깜빡이는 비컨. 본문: "There is no page at this address. It may have moved, or it was never written." + 실시간 문구 "Even a reply from Mars takes 13 min 17 s right now." + ← Back home / Browse posts.

### 5.8 climate, praisecat

praisecat은 지금 `AuthorLayout`을 빌려 쓰고 있어서 About 리디자인(지구본)을 그대로 물려받게 됩니다. praisecat은 `AuthorLayout`에서 떼어 slim 밴드 + 단순 본문 칼럼으로 바꿉니다.

내용 디자인은 그대로 두고 `HorizonBand variant="slim"`(제목 없는 짧은 하늘 띠)을 맨 위에 둬서 헤더 아래 바탕을 맞춥니다. 본문은 `SectionContainer`로 감쌉니다. 새 서체·토큰은 전역으로 적용됩니다.

## 6. 데이터 변경

- `data/projectsData.ts`: `summary`(EN 한 줄), `summaryKo`(KO 한 줄, 경어체), `orb`(오브 키) 추가. 10개 전부. 홈·목록은 `summary`, 상세는 `description`. 문구는 레퍼런스 `shared/PREVIEW_BRIEF.md`의 Projects 목록(EN)과 아래 KO를 씁니다.

| slug | summaryKo |
|---|---|
| hanji | SwiftUI와 TextKit 2로 만든, 마크다운 파일 폴더용 네이티브 macOS 에디터입니다. |
| more-munch | 주변 식당과 방문 기록을 바탕으로 매일 새로운 점심을 골라 주는 서비스입니다. |
| cheercat | 매일 스스로를 칭찬하는 습관을 만드는 일기 앱입니다. |
| fish-tank-simulator | 집중 세션을 마칠 때마다 수조가 자라는 픽셀아트 뽀모도로 타이머입니다. |
| earth-invaders | 지구를 침공하는 외계인을 막는 Phaser 3 아케이드 슈팅 게임입니다. |
| shoulder-check | 어깨 건강을 위해 가방 무게를 계산하고 저장해 두는 웹 앱입니다. |
| first-defense | 유닛 조합을 중심으로 설계한 Godot 4.6 기반 2.5D 로그라이트 타워 디펜스 프로토타입입니다. |
| gukbap-tools | 로그인과 설치 없이 바로 쓰는 무료 웹 도구 90여 개 모음입니다. |
| side-project-tracker | 모든 사이드 프로젝트의 단계와 방치 여부를 한 창에서 보여 주는 macOS 앱입니다. |
| sontab | 로컬에만 저장하고 추적하지 않는 가벼운 OneTab 스타일 크롬 탭 매니저입니다. |

- `data/careerData.ts`: `startYear: number`, `endYear: number | null`(null = 재직 중) 추가. UJET 2024/null, TomorrowUse 2021/2023, Miso 2020/2021. 월 정보는 없으므로 막대와 문구는 연 단위만 씁니다.
- `lib/ui-strings.ts`: 새 UI 문구 전부 EN/KO 쌍으로 추가(§9).

## 7. 클라이언트 렌더링과 성능

### 7.1 원칙

- 모든 글자는 SSR HTML이고 첫 페인트에 보입니다. LCP는 항상 글자입니다.
- 무거운 렌더러(홈 지평선, About 지구본)는 첫 페인트 뒤 동적 import합니다. 내부 페이지는 WebGL을 쓰지 않습니다.
- 루프는 화면 밖(IntersectionObserver)·탭 숨김에서 멈춥니다. DPR 상한, 적응형 스케일, `webglcontextlost` 처리, WebGL 없음/실패 시 SVG·CSS 폴백(콘솔 에러 없음).
- `prefers-reduced-motion: reduce` → 정지 프레임 1장, 자동 모션 없음. `navigator.connection.saveData`이면 히어로 WebGL을 띄우지 않고 SVG 폴백을 씁니다.
- 테마 감지: `document.documentElement.classList.contains('dark')` + `class` 속성 MutationObserver.
- 모듈 최상위에서 `window`/`document`에 접근하지 않습니다(정적 export 빌드).

### 7.2 예산

| 항목 | 기준 |
|---|---|
| 홈 초기 JS 증가 | 10 KB gz 이하(렌더러는 지연 청크, 12 KB gz 이하) |
| 홈 이미지 | 0장(현재 라이브 홈은 이미지 7장 746 KB) |
| 내부 페이지 | WebGL 0, 페이지별 추가 JS 5 KB gz 이하 |
| 폰트 | Space Grotesk 제거, Archivo 추가 후 총량 측정·보고 |

### 7.3 화성 계산 (`lib/mars/clock.ts`)

레퍼런스 `shared/mars-clock.js`를 TypeScript로 옮기고 About용으로 확장합니다.

- 반환: `msd, mtc, Ls, my, season, lmstJezero, au, lightSec`, 그리고 `nuMinusM`, `eot`, `subsolar: { latDeg, lonEastDeg }`.
- EOT = 2.861°·sin 2Ls − 0.071°·sin 4Ls + 0.002°·sin 6Ls − (ν − M), 태양 직하점 서경 Λs = 15°·MTC + EOT + 180° (mod 360), 위도 δs = asin(0.42565·sin Ls) + 0.25°·sin Ls.
- 제제로 좌표는 홈 HUD와 같게 18.44°N 77.45°E.
- 검증값(테스트): 2000-01-06T00:00Z, TT−UTC 64.184 s에서 Ls 277.18759°, MSD 44795.99976, EOT −5.18774°(±0.0002). MY 39 시작 2026-09-30T08:21Z(MSD 54299.0962). 2027-02-19 지구–화성 0.678 AU, 2026-01-09 2.404 AU.
- 시각 표시 값은 모두 클라이언트 마운트 후 계산합니다(하이드레이션 불일치 방지).

## 8. 접근성

- 실제 `<a>`/`<button>`, 보이는 `:focus-visible`, 장식 캔버스 `aria-hidden`.
- 포인터로만 보이는 정보는 다른 곳에도 있습니다(오브 조명은 장식, 경력 막대는 텍스트 기간 병기, 스크러버는 키보드 slider).
- 본문 대비 4.5:1 이상. 헤더 액센트 글자(현재 메뉴·hover·CV)는 하늘 꼭대기 위에 있으므로 `--rh-head-accent`를 쓰고, 현재 메뉴와 hover는 밑줄로도 표시합니다(색만으로 구분하지 않음). 그 밖의 하늘 위 작은 액센트 글자는 `--rh-accent-text`를 쓰되 실제 배경에서 대비를 잽니다(평평한 토큰 값이 아니라 렌더된 픽셀 기준). 다크 모드 slim 밴드는 하늘이 짧아 해 광륜이 헤더 뒤에 오므로 광륜을 끕니다(`html.dark .rh-band--slim { --rh-sun-glow: transparent }`).
- 390px에서 가로 스크롤 없음, 거터 16px 이상.

## 9. i18n

- 모든 새 UI 문구는 `lib/ui-strings.ts`에 EN/KO 쌍으로 둡니다: HUD 라벨, 밴드 텔레메트리 라벨, 태그 레일, 게이지 aria, 페이지네이션, 404 문구, About 지구본 캡션·버튼, 경력 스크러버 안내·읽기 문구, 프로젝트 목록 소개와 힌트, 연락 줄 실시간 문구.
- KO 문구는 경어체입니다. 밴드 제목 KO: 글, 프로젝트, 태그, 이성화, 신호 끊김. 한글은 Archivo에 없습니다. 42dot Sans는 400 굵기만 로드되므로 디스플레이 스택에 넣지 않고(가짜 굵게 방지), 한글 제목은 플랫폼 기본 한글 산세리프의 실제 굵은 웨이트(macOS는 Apple SD Gothic Neo)로 폴백되며 이를 허용합니다.
- 프로젝트·경력 한 줄 설명은 `summaryKo`, `descriptionKo`, `roleKo`를 씁니다.

## 10. 테스트와 검증

- 단위 테스트(node --test): `lib/mars/clock.test.ts`(§7.3 검증값), `lib/tenure.test.ts`(막대 위치·활성 연도), `lib/posts`의 자동 번호 판별, `data/projectsData.test.ts`(10개 모두 `summary`·`summaryKo`·`orb` 존재, summary 100자 이하). `package.json`의 `test` 글롭에 `lib/**/*.test.ts`, `data/**/*.test.ts`를 추가합니다.
- `yarn lint`, `yarn test`, `yarn build` 통과.
- 시각 검증: `out/`를 정적 서빙(dev 서버는 쓰지 않음)하고 Playwright 독립 스크립트로 홈·About·/posts·글 상세(일반, mermaid, viz, 한국어, note)·/tags·태그 페이지·/projects·프로젝트 상세·404·/climate를 라이트/다크 × 1440/390 × EN/KO로 캡처, 콘솔 에러 0, 가로 넘침 0.
- KB 회귀: 작업 전후 `/kb`, `/kb/<slug>`, `/kb/graph` 스크린샷이 같아야 합니다.
- 성능: 홈의 리소스 전송량(JS·폰트·이미지)을 작업 전후로 재서 보고합니다.

## 11. 리스크와 결정 기록

| 리스크 | 대응 |
|---|---|
| 루트 레이아웃 변경으로 KB 깨짐 | KB 전후 스크린샷 비교, `body.kb-active` 셀렉터 보정 |
| 모바일 저사양 GPU에서 히어로 부담 | 적응형 스케일, saveData·모션 줄이기 폴백, 화면 밖 정지 |
| 시계 값 하이드레이션 불일치 | 마운트 후 계산, SSR은 자리표시 |
| 자동 섹션 번호 중복 | TOC 기반 판별로 기존 번호 글은 끔 |
| 경력 막대 정밀도 | 연 단위만 표시(월 데이터 없음), 문구도 연도만 |
| Archivo 가변 폰트 용량 | 88 KB 측정(80 KB 초과) → 정적 인스턴스 2개(각 약 14.5 KB) 셀프 호스팅으로 전환 |
| mermaid·viz 컴포넌트가 새 프로즈 스타일과 충돌 | 해당 글 스크린샷 확인, 프로즈 규칙은 기존 셀렉터를 보강하는 방식 |

## 12. 작업 순서

1. 기반: 토큰·서체·`css/red-horizon.css`·헤더·푸터·루트 레이아웃(+KB 회귀 확인)
2. 순수 로직: `lib/mars/clock.ts`, `lib/tenure.ts`, 번호 판별 + 테스트
3. 데이터와 문구: projectsData, careerData, ui-strings(EN/KO)
4. `HorizonBand` + 404 + climate/praisecat slim 밴드
5. 홈 히어로(MarsHorizon, 렌더러, HUD)
6. 홈 섹션(프로젝트 오브 조명, 최근 글, 경력 막대, 정착 효과)
7. 글 목록·태그
8. 글 상세
9. 프로젝트 목록·상세
10. About(지구본)
11. KO 전체 점검, 시각·성능 검증, 최종 리뷰
