# Carbon Basics 1 (3D 시각화 포스트) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "Carbon, from scratch" 1편(탄소란 무엇이고, 왜 중요한가)을 KO/EN 포스트로 발행하되, 설명의 주역은 글이 아니라 **three.js 3D 장면 4개**(온실가스 구성·CO₂ 농도 타임라인·탄소 예산 탱크·1t 부피 큐브)가 맡게 한다. `/climate` 허브의 시리즈 1번 카드를 이 글로 연결한다.

**Architecture:** 3D 장면은 각각 `'use client'` 컴포넌트이며, 공통 훅 `useThreeScene`(three 동적 import, 가시성 기반 RAF, reduced-motion 1프레임, resize, dispose)과 공통 틀 `VizFrame`(캔버스 + HTML 오버레이 + 캡션 + 접근성 폴백 표) 위에 얹는다. 숫자·출처·KO/EN 라벨은 `data/charts/carbon-basics-1.ts` 한 곳에 두고, MDX에서는 `<GasMixCloud lang="ko" />`처럼 `lang`만 넘긴다. 허브의 `Globe3D`가 쓰던 지구 장면은 `components/viz/earthScene.ts`로 추출해 타임라인 장면과 공유한다.

**Tech Stack:** Next.js App Router(static export), Contentlayer2 MDX, Tailwind v4(사이트 토큰 `--ink/--muted/--line/--accent`), three `^0.185.1`(이미 설치), Playwright MCP(시각 검증).

## Global Constraints

- 포스트는 KO `data/posts/2026-09-05-carbon-basics-what-is-carbon.mdx` + EN `...en.mdx` **쌍으로 반드시 함께** 생성. 한국어 본문은 경어체(~입니다/~합니다).
- 콘텐츠(포스트 본문·라벨·캡션·데이터 라벨)에 **em-dash(—) 절대 금지**. 콜론/쉼표/마침표만.
- frontmatter: `slug`, `title`, `date: 2026-09-05 18:00:00 +0900`, `tags`, `summary`, `topic: climate`, `stage: budding`, `author: MartianLee`, `categories: posts`.
- `app/kb-data.json`은 손으로 수정하지 않는다(contentlayer 빌드가 생성).
- three는 항상 `useEffect` 안에서 `await import('three')` (SSR/빌드에 관여 금지). `THREE.ColorManagement.enabled = false` + `renderer.outputColorSpace = LinearSRGBColorSpace`(허브 룩과 동일).
- 차트/장면 코드를 쓰기 전에 **`dataviz` 스킬을 로드**한다(색·눈금·접근성 규칙).
- 수치는 웹에서 검증한 값만 쓴다. 확인 안 되면 항목을 뺀다(추정치로 채우지 않음).
- 장면 배경은 허브와 같은 어두운 대기 그라데이션 `radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)`, 입자 색은 CO₂ `#e6a760`, CH₄ `#a8bd74`, N₂O `#cf7a3d`, F-gas `#f4efe4`, 글로우/윤곽 `#c8642f`.
- dev 서버 포트 3456 고정. 커밋 전 `yarn lint` 통과(husky). 배포는 main 머지 시 자동이므로 **main에 직접 커밋하지 않고** `feat/carbon-basics-1` 브랜치에 커밋한다.

---

## File Structure

| 파일                                                                | 책임                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `data/charts/carbon-basics-1.ts`                                    | 검증된 수치·출처·KO/EN 라벨. 4개 장면과 폴백 표의 유일한 데이터 소스                                         |
| `components/viz/useThreeScene.ts`                                   | three 동적 import, 렌더러 생성, IntersectionObserver 기반 RAF, reduced-motion, resize, dispose를 담당하는 훅 |
| `components/viz/three-utils.ts`                                     | 스프라이트 텍스처, 피보나치 구, 랜덤 분포, Points 생성 등 순수 헬퍼                                          |
| `components/viz/earthScene.ts`                                      | 입자 지구 + CO₂ 헤이즈 장면 빌더(허브 Globe3D와 타임라인 장면이 공유)                                        |
| `components/viz/VizFrame.tsx`                                       | 캔버스 컨테이너 + 오버레이 슬롯 + 캡션/출처 + 접근성 폴백 표                                                 |
| `components/viz/GasMixCloud.tsx`                                    | V1 온실가스 구성 입자 구름                                                                                   |
| `components/viz/AtmosphereTimeline.tsx`                             | V2 연도별 CO₂ 농도 타임라인(지구 헤이즈 밀도)                                                                |
| `components/viz/BudgetTank.tsx`                                     | V3 탄소 예산 탱크                                                                                            |
| `components/viz/TonneCubes.tsx`                                     | V4 활동별 CO₂e 부피 큐브                                                                                     |
| `components/climate/Globe3D.tsx`                                    | (수정) earthScene + useThreeScene 사용으로 축소                                                              |
| `components/MDXComponents.tsx`                                      | (수정) 4개 장면 등록                                                                                         |
| `scripts/generate-kb-data.mjs`                                      | (수정) `TOPIC_LABELS.climate`                                                                                |
| `data/climateData.ts`, `components/climate/LearningSeries.tsx`      | (수정) 시리즈 항목 링크                                                                                      |
| `data/posts/2026-09-05-carbon-basics-what-is-carbon.mdx`, `.en.mdx` | 포스트                                                                                                       |

---

### Task 1: 수치 검증과 데이터 모듈

**Files:**

- Create: `data/charts/carbon-basics-1.ts`

**Interfaces:**

- Produces: `export type Lang = 'en' | 'ko'`, `export const gasMix`, `export const co2Annual`, `export const carbonBudget`, `export const tonneItems`, `export const CO2_M3_PER_KG`, `export const t: Record<Lang, Labels>` (정확한 형태는 Step 3 코드).

- [ ] **Step 1: 웹 도구 로드 후 수치 확인**

Run: `ToolSearch("select:WebFetch,WebSearch")` 후 아래를 각각 확인하고 값·연도·URL을 메모한다.

| 항목                                                                | 확인처                                                                                                                                                    |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mauna Loa 연평균 CO₂(1959~2025)                                     | `https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv` (WebFetch, CSV의 `year,mean` 열)                                                       |
| 2025년 화석 CO₂ 배출량, 1.5°C 잔여 탄소 예산, 1850년 이후 누적 배출 | Global Carbon Budget 2025 (`https://globalcarbonbudget.org/` 요약 또는 ESSD 논문 초록, WebSearch "Global Carbon Budget 2025 remaining carbon budget 1.5") |
| 가스별 온실가스 비중(CO₂e)                                          | Our World in Data "greenhouse gas emissions by gas" (WebSearch)                                                                                           |
| 세계·한국 1인당 연간 CO₂                                            | Our World in Data per capita CO₂ (최신 연도)                                                                                                              |
| 나무 1그루 연간 CO₂ 흡수                                            | 국립산림과학원 자료(WebSearch "국립산림과학원 소나무 1그루 연간 이산화탄소 흡수량")                                                                       |
| 휘발유 승용차 km당 배출                                             | 환경부/교통안전공단 평균 또는 EPA 8.9 kg/gal 기준 계산식 명기                                                                                             |
| 가정 한 달 전기 배출                                                | 한국 가구 월평균 사용량 × 국내 전력 배출계수(환경부 온실가스종합정보센터 최신 공표값)                                                                     |
| 서울↔제주 항공 편도 1인                                            | ICAO Carbon Emissions Calculator(GMP-CJU)                                                                                                                 |
| 소고기 1 kg CO₂e                                                    | Poore & Nemecek (2018), Science; OWID 재인용                                                                                                              |
| 스마트폰 1대 생산                                                   | 제조사 환경 보고서(예: Apple Product Environmental Report) 대표값                                                                                         |
| CO₂ 밀도                                                            | 1.87 kg/m³ (15°C, 1 atm) → 0.535 m³/kg                                                                                                                    |

- [ ] **Step 2: 확인 불가 항목 제거 결정**

출처를 못 찾은 항목은 `tonneItems`에서 뺀다. 최소 구성: 나무(음수), 휘발유차 100 km, 서울↔제주 편도, 가정 한 달 전기, 1 t 기준, 세계 1인 연간, 한국 1인 연간.

- [ ] **Step 3: 데이터 모듈 작성** (아래 숫자는 검증 후 실제 값으로 교체하고 `source`/`year`를 채운다)

```ts
// data/charts/carbon-basics-1.ts
// 검증된 수치만 담는다. 각 항목에 출처와 기준 연도를 남긴다. 라벨에 em-dash 금지.

export type Lang = 'en' | 'ko'

export interface Source {
  name: string
  url: string
  year: number
}

/** V1: 전 세계 온실가스 구성(CO₂e 기준, %) */
export interface GasShare {
  id: 'co2' | 'ch4' | 'n2o' | 'fgas'
  share: number
  color: string
}
export const gasMix: { shares: GasShare[]; source: Source } = {
  shares: [
    { id: 'co2', share: 74.4, color: '#e6a760' },
    { id: 'ch4', share: 17.3, color: '#a8bd74' },
    { id: 'n2o', share: 6.2, color: '#cf7a3d' },
    { id: 'fgas', share: 2.1, color: '#f4efe4' },
  ],
  source: {
    name: 'Our World in Data (Climate Watch)',
    url: 'https://ourworldindata.org/greenhouse-gas-emissions',
    year: 2021,
  },
}

/** V2: Mauna Loa 연평균 CO₂ 농도(ppm). 검증한 CSV의 값으로 채운다. */
export const co2Annual: { preindustrial: number; series: [number, number][]; source: Source } = {
  preindustrial: 280,
  series: [
    [1959, 315.98],
    // ... 1960~2024 매년 ...
    [2025, 427.0],
  ],
  source: {
    name: 'NOAA GML, Mauna Loa annual mean',
    url: 'https://gml.noaa.gov/ccgg/trends/data.html',
    year: 2025,
  },
}

/** V3: 1.5°C 탄소 예산(GtCO₂). used + remaining = total */
export const carbonBudget: {
  usedGt: number
  remainingGt: number
  annualGt: number
  sinceYear: number
  asOfYear: number
  source: Source
} = {
  usedGt: 2650,
  remainingGt: 170,
  annualGt: 42,
  sinceYear: 1850,
  asOfYear: 2025,
  source: { name: 'Global Carbon Budget 2025', url: 'https://globalcarbonbudget.org/', year: 2025 },
}

/** CO₂ 1 kg이 차지하는 부피(m³), 15°C 1 atm 기준 밀도 1.87 kg/m³ */
export const CO2_M3_PER_KG = 0.535

/** V4: 활동별 kg CO₂e. 음수는 흡수. */
export interface TonneItem {
  id: string
  kg: number
  source: Source
}
export const tonneItems: TonneItem[] = [
  { id: 'tree', kg: -6.6, source: { name: '국립산림과학원', url: '', year: 2019 } },
  { id: 'car100km', kg: 17, source: { name: '', url: '', year: 2024 } },
  {
    id: 'flight',
    kg: 60,
    source: {
      name: 'ICAO Carbon Emissions Calculator',
      url: 'https://www.icao.int/environmental-protection/Carbonoffset',
      year: 2025,
    },
  },
  {
    id: 'beef',
    kg: 60,
    source: {
      name: 'Poore & Nemecek 2018',
      url: 'https://ourworldindata.org/food-choice-vs-eating-local',
      year: 2018,
    },
  },
  { id: 'electricity', kg: 130, source: { name: '', url: '', year: 2024 } },
  { id: 'tonne', kg: 1000, source: { name: 'reference', url: '', year: 2025 } },
  {
    id: 'worldPerCapita',
    kg: 4700,
    source: {
      name: 'Our World in Data',
      url: 'https://ourworldindata.org/co2-emissions',
      year: 2024,
    },
  },
  {
    id: 'koreaPerCapita',
    kg: 11600,
    source: {
      name: 'Our World in Data',
      url: 'https://ourworldindata.org/co2-emissions',
      year: 2024,
    },
  },
]

/** 장면·폴백 표에 쓰는 KO/EN 라벨 */
export interface Labels {
  gas: Record<GasShare['id'], string>
  gasTitle: string
  gasCaption: string
  timelineTitle: string
  timelineCaption: string
  ppm: string
  year: string
  preindustrial: string
  play: string
  pause: string
  budgetTitle: string
  budgetCaption: string
  used: string
  remaining: string
  yearsLeft: (n: number) => string
  tonneTitle: string
  tonneCaption: string
  tonne: Record<string, string>
  human: string
  car: string
  kg: string
  fallbackNote: string
  source: string
}

export const t: Record<Lang, Labels> = {
  en: {
    gas: { co2: 'CO₂', ch4: 'Methane (CH₄)', n2o: 'Nitrous oxide (N₂O)', fgas: 'F-gases' },
    gasTitle: 'What the world emits, by gas',
    gasCaption:
      'Every gas is converted to CO₂-equivalent (CO₂e): 1 kg of methane counts as about 28 kg of CO₂. That is how one number can hold four gases.',
    timelineTitle: 'CO₂ in the air, 1959 to today',
    timelineCaption:
      'Annual mean at Mauna Loa. The haze around the Earth thickens in proportion to the concentration; the dashed ring is the pre-industrial 280 ppm.',
    ppm: 'ppm',
    year: 'Year',
    preindustrial: 'pre-industrial 280 ppm',
    play: 'Play',
    pause: 'Pause',
    budgetTitle: 'The 1.5 °C carbon budget as a tank',
    budgetCaption:
      'Cumulative CO₂ since 1850 has used most of the budget that keeps warming to 1.5 °C. At the current rate the remainder lasts only a few years.',
    used: 'used',
    remaining: 'remaining',
    yearsLeft: (n) => `about ${n} years at the current rate`,
    tonneTitle: 'How big is a tonne of CO₂?',
    tonneCaption:
      'CO₂ is a gas, so a tonne fills about 535 m³: a cube 8.1 m on a side. Each cube is drawn to scale next to a person (1.7 m) and a car.',
    tonne: {
      tree: 'One tree absorbs in a year',
      car100km: 'Petrol car, 100 km',
      flight: 'Seoul to Jeju, one flight',
      beef: '1 kg of beef',
      electricity: 'A home, one month of electricity',
      tonne: 'One tonne',
      worldPerCapita: 'World average, one person, one year',
      koreaPerCapita: 'Korea average, one person, one year',
    },
    human: 'person, 1.7 m',
    car: 'car',
    kg: 'kg CO₂e',
    fallbackNote: 'The 3D scene is unavailable here; the same data is shown as a table.',
    source: 'Source',
  },
  ko: {
    gas: { co2: 'CO₂', ch4: '메탄(CH₄)', n2o: '아산화질소(N₂O)', fgas: 'F-가스' },
    gasTitle: '세계는 어떤 가스를 얼마나 내보내나',
    gasCaption:
      '모든 가스는 CO₂ 환산량(CO₂e)으로 바꿔 더합니다. 메탄 1 kg은 CO₂ 약 28 kg으로 칩니다. 그래서 숫자 하나에 네 가지 가스를 담을 수 있습니다.',
    timelineTitle: '대기 중 CO₂, 1959년부터 지금까지',
    timelineCaption:
      '마우나로아 관측소 연평균입니다. 지구를 감싼 헤이즈는 농도에 비례해 짙어지고, 점선 고리는 산업화 이전 280 ppm입니다.',
    ppm: 'ppm',
    year: '연도',
    preindustrial: '산업화 이전 280 ppm',
    play: '재생',
    pause: '일시정지',
    budgetTitle: '1.5°C 탄소 예산을 탱크로 보면',
    budgetCaption:
      '1850년 이후 누적 배출이 1.5°C를 지키는 예산의 대부분을 이미 썼습니다. 지금 속도라면 남은 양은 몇 년 안에 바닥납니다.',
    used: '사용',
    remaining: '잔여',
    yearsLeft: (n) => `지금 속도로 약 ${n}년치`,
    tonneTitle: 'CO₂ 1톤은 얼마나 클까',
    tonneCaption:
      'CO₂는 기체라서 1톤이 약 535 m³, 한 변 8.1 m 큐브를 채웁니다. 각 큐브는 사람(1.7 m)과 자동차 옆에 실제 비율로 그렸습니다.',
    tonne: {
      tree: '나무 한 그루가 1년간 흡수',
      car100km: '휘발유차 100 km',
      flight: '서울에서 제주, 항공 편도 1인',
      beef: '소고기 1 kg',
      electricity: '한 가정의 한 달 전기',
      tonne: '1톤',
      worldPerCapita: '세계 평균 1인 1년',
      koreaPerCapita: '한국 평균 1인 1년',
    },
    human: '사람 1.7 m',
    car: '자동차',
    kg: 'kg CO₂e',
    fallbackNote: '이 환경에서는 3D 장면을 보여줄 수 없어 같은 데이터를 표로 보여줍니다.',
    source: '출처',
  },
}
```

- [ ] **Step 4: 타입 검사**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -3`
Expected: 출력 없음(에러 0).

- [ ] **Step 5: 커밋**

```bash
git checkout -b feat/carbon-basics-1
git add data/charts/carbon-basics-1.ts
git commit -m "feat(carbon-basics): 1편 시각화 데이터 모듈 (검증 수치·출처·KO/EN 라벨)"
```

---

### Task 2: 공통 훅 `useThreeScene`과 헬퍼

**Files:**

- Create: `components/viz/useThreeScene.ts`
- Create: `components/viz/three-utils.ts`

**Interfaces:**

- Produces: `useThreeScene(canvasRef, build): VizStatus`, `type SceneBuilder`, `type SceneHandle`, `type Three`, `discSprite(THREE)`, `fibonacciSphere(n)`, `randomInShell(n, rMin, rMax)`, `makePoints(THREE, positions, opts)`.

- [ ] **Step 1: 헬퍼 작성**

```ts
// components/viz/three-utils.ts
import type * as ThreeNS from 'three'

export type Three = typeof ThreeNS

/** 부드러운 원형 입자 스프라이트 텍스처 */
export function discSprite(THREE: Three): ThreeNS.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  if (g) {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.35, 'rgba(255,255,255,.65)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.Texture(c)
  tex.needsUpdate = true
  return tex
}

/** 반지름 1 구 표면에 n개 점을 고르게 배치 */
export function fibonacciSphere(n: number): Float32Array {
  const out = new Float32Array(n * 3)
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = phi * i
    out[i * 3] = Math.cos(th) * r
    out[i * 3 + 1] = y
    out[i * 3 + 2] = Math.sin(th) * r
  }
  return out
}

/** 반지름 rMin~rMax 껍질 안에 n개 점을 무작위 배치(표면 쪽이 더 촘촘) */
export function randomInShell(n: number, rMin: number, rMax: number, bias = 1.6): Float32Array {
  const out = new Float32Array(n * 3)
  for (let j = 0; j < n; j++) {
    const u = Math.random()
    const v = Math.random()
    const tt = Math.acos(2 * u - 1)
    const pp = 2 * Math.PI * v
    const rad = rMin + Math.pow(Math.random(), bias) * (rMax - rMin)
    out[j * 3] = Math.sin(tt) * Math.cos(pp) * rad
    out[j * 3 + 1] = Math.cos(tt) * rad
    out[j * 3 + 2] = Math.sin(tt) * Math.sin(pp) * rad
  }
  return out
}

export interface PointsOpts {
  size: number
  color?: string
  vertexColors?: Float32Array
  opacity?: number
  additive?: boolean
  sprite: ThreeNS.Texture
}

/** BufferGeometry + PointsMaterial을 한 번에 만든다. dispose는 호출자가 geometry/material 둘 다. */
export function makePoints(
  THREE: Three,
  positions: Float32Array,
  opts: PointsOpts
): ThreeNS.Points {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  if (opts.vertexColors) geo.setAttribute('color', new THREE.BufferAttribute(opts.vertexColors, 3))
  const mat = new THREE.PointsMaterial({
    size: opts.size,
    map: opts.sprite,
    color: opts.color ? new THREE.Color(opts.color) : undefined,
    vertexColors: Boolean(opts.vertexColors),
    transparent: true,
    opacity: opts.opacity ?? 1,
    depthWrite: false,
    sizeAttenuation: true,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  return new THREE.Points(geo, mat)
}

/** Points 하나의 geometry/material을 모두 해제 */
export function disposePoints(p: ThreeNS.Points) {
  p.geometry.dispose()
  const m = p.material
  if (Array.isArray(m)) m.forEach((x) => x.dispose())
  else m.dispose()
}
```

- [ ] **Step 2: 훅 작성**

```ts
// components/viz/useThreeScene.ts
'use client'

import { useEffect, useState, type RefObject } from 'react'
import type * as ThreeNS from 'three'
import type { Three } from './three-utils'

export interface SceneHandle {
  /** 매 프레임 호출. ts = performance.now 기반 ms, dt = 직전 프레임과의 간격 ms */
  render: (ts: number, dt: number) => void
  /** 캔버스 CSS 크기 변경 시 호출(카메라 aspect 갱신용) */
  resize: (w: number, h: number) => void
  dispose: () => void
}

export type SceneBuilder = (
  THREE: Three,
  canvas: HTMLCanvasElement,
  renderer: ThreeNS.WebGLRenderer
) => SceneHandle

/** idle: SSR/로딩 전, live: 애니메이션 중, static: reduced-motion 1프레임, failed: three 로드/WebGL 실패 */
export type VizStatus = 'idle' | 'live' | 'static' | 'failed'

/**
 * three를 지연 로드해 장면을 구동한다.
 * - 캔버스가 화면에 보일 때만 RAF를 돈다(포스트 한 페이지에 장면 여러 개).
 * - prefers-reduced-motion이면 첫 프레임만 렌더한다.
 * - 언마운트 시 RAF 취소 + 장면/렌더러 dispose.
 * `build`는 모듈 레벨 함수여야 한다(의존성 배열에 들어가므로 매 렌더마다 새로 만들면 장면이 재생성된다).
 */
export function useThreeScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  build: SceneBuilder
): VizStatus {
  const [status, setStatus] = useState<VizStatus>('idle')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    let raf = 0
    let last = 0
    let visible = false
    let handle: SceneHandle | undefined
    let renderer: ThreeNS.WebGLRenderer | undefined
    let io: IntersectionObserver | undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      if (!renderer || !handle) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      handle.resize(w, h)
    }
    const frame = (ts: number) => {
      raf = 0
      if (disposed || !handle) return
      const dt = last ? Math.min(ts - last, 100) : 16
      last = ts
      handle.render(ts, dt)
      if (!reduce && visible) raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(frame)
    }

    const run = async () => {
      try {
        const THREE = await import('three')
        if (disposed) return
        THREE.ColorManagement.enabled = false
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        handle = build(THREE, canvas, renderer)
        resize()
        handle.render(0, 0)
        setStatus(reduce ? 'static' : 'live')
        // reduced-motion: 첫 프레임만. observer를 아예 두지 않아야 가시성 변화로 두 번째 프레임이 그려지지 않는다.
        if (!reduce) {
          io = new IntersectionObserver(
            (entries) => {
              visible = entries[0]?.isIntersecting ?? false
              if (visible) start()
            },
            { threshold: 0.05 }
          )
          io.observe(canvas)
        }
        window.addEventListener('resize', resize)
      } catch (err) {
        console.warn('[useThreeScene] 3D scene unavailable, showing fallback', err)
        setStatus('failed')
      }
    }
    run()

    return () => {
      disposed = true
      io?.disconnect()
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      try {
        handle?.dispose()
      } finally {
        renderer?.dispose()
      }
    }
  }, [canvasRef, build])

  return status
}
```

- [ ] **Step 3: 타입 검사**

Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -3`
Expected: 에러 0.

- [ ] **Step 4: 커밋**

```bash
git add components/viz/useThreeScene.ts components/viz/three-utils.ts
git commit -m "feat(viz): three 지연 로드 훅 useThreeScene + 입자 헬퍼"
```

---

### Task 3: `VizFrame` (캔버스 틀 + 오버레이 + 접근성 폴백 표)

**Files:**

- Create: `components/viz/VizFrame.tsx`

**Interfaces:**

- Consumes: `VizStatus` (Task 2)
- Produces: `VizFrame` 컴포넌트, `FallbackRow` 타입

- [ ] **Step 1: 컴포넌트 작성**

```tsx
// components/viz/VizFrame.tsx
'use client'

import type { ReactNode, RefObject } from 'react'
import type { VizStatus } from './useThreeScene'

export interface FallbackRow {
  label: string
  value: string
}

interface Props {
  title: string
  caption: string
  sourceLabel: string
  sourceName: string
  sourceUrl?: string
  status: VizStatus
  canvasRef: RefObject<HTMLCanvasElement | null>
  /** 캔버스 위에 얹는 HTML(범례, 숫자, 컨트롤). pointer-events는 자식이 직접 켠다. */
  overlay?: ReactNode
  /** 3D 불가 시 보여줄 표(라이브 상태에서는 sr-only) */
  fallback: { columns: [string, string]; rows: FallbackRow[]; note: string }
  /** 캔버스 가로:세로. 기본 16/10 */
  aspect?: string
}

const SCENE_BG = 'radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)'

export default function VizFrame({
  title,
  caption,
  sourceLabel,
  sourceName,
  sourceUrl,
  status,
  canvasRef,
  overlay,
  fallback,
  aspect = '16 / 10',
}: Props) {
  const showCanvas = status === 'live' || status === 'static'
  const failed = status === 'failed'
  return (
    <figure className="my-8">
      <div
        className="border-line relative w-full overflow-hidden rounded-2xl border"
        style={{ aspectRatio: aspect, background: SCENE_BG }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${showCanvas ? 'opacity-100' : 'opacity-0'}`}
        />
        {overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}
        {failed && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-[#e9ddc9]">
            {fallback.note}
          </div>
        )}
      </div>
      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{title}.</span> {caption}{' '}
        <span className="text-muted">
          {sourceLabel}:{' '}
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {sourceName}
            </a>
          ) : (
            sourceName
          )}
        </span>
      </figcaption>
      <table className={failed ? 'mt-4 w-full text-sm' : 'sr-only'}>
        <thead>
          <tr>
            <th className="text-left">{fallback.columns[0]}</th>
            <th className="text-right">{fallback.columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {fallback.rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className="text-right tabular-nums">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
```

- [ ] **Step 2: 타입 검사** — Run: `yarn tsc --noEmit -p tsconfig.json 2>&1 | tail -3` → 에러 0.

- [ ] **Step 3: 커밋**

```bash
git add components/viz/VizFrame.tsx
git commit -m "feat(viz): VizFrame 캔버스 틀 + 캡션 + 접근성 폴백 표"
```

---

### Task 4: 지구 장면 추출(`earthScene.ts`)과 허브 `Globe3D` 리팩터

**Files:**

- Create: `components/viz/earthScene.ts`
- Modify: `components/climate/Globe3D.tsx` (전체 교체)

**Interfaces:**

- Produces: `buildEarthScene(THREE, opts) => EarthScene` (`setHazeLevel(level)`, `render(ts)`, `resize`, `dispose`, `scene`, `camera`)

- [ ] **Step 1: 장면 빌더 작성** (현재 Globe3D의 장면 코드를 그대로 옮기되 헤이즈 밀도를 조절할 수 있게 한다)

```ts
// components/viz/earthScene.ts
import type * as ThreeNS from 'three'
import {
  discSprite,
  fibonacciSphere,
  makePoints,
  randomInShell,
  disposePoints,
  type Three,
} from './three-utils'

export interface EarthSceneOpts {
  /** 카메라 거리. 허브 4.0 */
  cameraZ?: number
  /** 헤이즈 입자 수. 허브 2600 */
  hazeCount?: number
}

export interface EarthScene {
  scene: ThreeNS.Scene
  camera: ThreeNS.PerspectiveCamera
  /** 0~1. 보이는 헤이즈 입자 비율과 불투명도를 함께 조절 */
  setHazeLevel: (level: number) => void
  render: (renderer: ThreeNS.WebGLRenderer, ts: number) => void
  resize: (w: number, h: number) => void
  dispose: () => void
}

export function buildEarthScene(THREE: Three, opts: EarthSceneOpts = {}): EarthScene {
  const cameraZ = opts.cameraZ ?? 4.0
  const hazeCount = opts.hazeCount ?? 2600
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, cameraZ)
  const sprite = discSprite(THREE)
  const root = new THREE.Group()
  scene.add(root)

  // 입자 지구: 의사 대륙 색 밴딩
  const GN = 4200
  const pos = fibonacciSphere(GN)
  const col = new Float32Array(GN * 3)
  const cLand = new THREE.Color('#a8bd74')
  const cSoil = new THREE.Color('#cf7a3d')
  const cDeep = new THREE.Color('#7a4d26')
  for (let i = 0; i < GN; i++) {
    const x = pos[i * 3]
    const y = pos[i * 3 + 1]
    const z = pos[i * 3 + 2]
    const n = Math.sin(x * 4.1) * Math.cos(z * 3.3 + y * 2.0) + Math.sin(y * 6.0)
    const c = n > 0.35 ? cLand : n > -0.2 ? cSoil : cDeep
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  const earth = makePoints(THREE, pos, { size: 0.028, sprite, vertexColors: col })
  root.add(earth)

  // CO₂ 헤이즈 껍질
  const haze = makePoints(THREE, randomInShell(hazeCount, 1.12, 2.27), {
    size: 0.065,
    sprite,
    color: '#e6a760',
    opacity: 0.5,
    additive: true,
  })
  root.add(haze)
  const hazeMat = haze.material as ThreeNS.PointsMaterial

  // 호박색 글로우 코어
  const glow = makePoints(THREE, new Float32Array([0, 0, 0]), {
    size: 2.1,
    sprite,
    color: '#c8642f',
    opacity: 0.16,
    additive: true,
  })
  scene.add(glow)

  root.rotation.z = 0.28
  let level = 1
  // 허브 원본 룩: opacity 0.5 ± 0.1 (level 1일 때 동일해야 한다)
  let baseOpacity = 0.5

  return {
    scene,
    camera,
    setHazeLevel(l) {
      level = Math.max(0, Math.min(1, l))
      haze.geometry.setDrawRange(0, Math.max(1, Math.round(hazeCount * (0.15 + 0.85 * level))))
      baseOpacity = 0.2 + 0.3 * level
    },
    render(renderer, ts) {
      root.rotation.y = ts * 0.00006
      haze.rotation.y = -ts * 0.00003
      haze.rotation.x = Math.sin(ts * 0.00004) * 0.08
      hazeMat.opacity = baseOpacity + Math.sin(ts * 0.0005) * 0.1
      renderer.render(scene, camera)
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposePoints(earth)
      disposePoints(haze)
      disposePoints(glow)
      sprite.dispose()
    },
  }
}
```

- [ ] **Step 2: Globe3D를 훅 + 빌더로 교체** (룩 동일, 정적 링 폴백·페이드 유지)

```tsx
// components/climate/Globe3D.tsx
'use client'

import { useRef } from 'react'
import { useThreeScene, type SceneBuilder } from '@/components/viz/useThreeScene'
import { buildEarthScene } from '@/components/viz/earthScene'

/**
 * Hero 3D panel: fibonacci particle Earth with an amber CO₂ haze shell.
 * three.js loads lazily inside useThreeScene; the static gradient + rings stay
 * as the fallback (reduced-motion renders one frame, failure keeps the panel).
 */
const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const earth = buildEarthScene(THREE)
  return {
    render: (ts) => earth.render(renderer, ts),
    resize: earth.resize,
    dispose: earth.dispose,
  }
}

export default function Globe3D({ caption }: { caption: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const live = status === 'live' || status === 'static'
  return (
    <div
      className="border-line relative aspect-square overflow-hidden rounded-2xl border shadow-[0_24px_60px_-28px_rgba(120,48,21,.55)] dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,.7)]"
      style={{
        background:
          'radial-gradient(circle at 38% 34%, #c98b54 0%, #a8431f 34%, #5b2a12 72%, #2c160a 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background:
            'radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)',
        }}
      />
      <div
        className={`absolute inset-[14%] rounded-full border border-dashed border-[rgba(244,239,228,.35)] transition-opacity duration-700 ${live ? 'opacity-0' : ''}`}
      />
      <div
        className={`absolute inset-[26%] rounded-full border border-dashed border-[rgba(244,239,228,.35)] transition-opacity duration-700 ${live ? 'opacity-0' : ''}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`}
      />
      <p
        className="absolute right-3.5 bottom-3 left-3.5 text-[11.5px] leading-snug text-[#f4efe4]"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,.45)' }}
      >
        {caption}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: 허브 회귀 확인** — dev 서버(`yarn dev`, :3456)에서 Playwright로 `http://localhost:3456/climate` 열고 3초 후 `document.querySelector('canvas')`의 `getComputedStyle(...).opacity === '1'` 확인, 스크린샷을 이전(`scratchpad/globe-tuned-v4.png`)과 비교. 지구 실루엣·헤이즈 밀도가 같아야 한다.

- [ ] **Step 4: 린트·타입** — Run: `yarn lint && yarn tsc --noEmit -p tsconfig.json` → 통과.

- [ ] **Step 5: 커밋**

```bash
git add components/viz/earthScene.ts components/climate/Globe3D.tsx
git commit -m "refactor(viz): 지구 장면을 earthScene으로 추출, Globe3D는 useThreeScene 사용"
```

---

### Task 5: V1 `GasMixCloud` (온실가스 구성 입자 구름)

**Files:**

- Create: `components/viz/GasMixCloud.tsx`

**Interfaces:**

- Consumes: `gasMix`, `t`, `Lang` (Task 1), `useThreeScene`, `VizFrame`, helpers (Task 2, 3)
- Produces: `<GasMixCloud lang="ko" />`

- [ ] **Step 1: dataviz 스킬 로드** — `Skill("dataviz")`를 호출하고 색·범례·접근성 지침을 확인한다(장면 색은 Global Constraints 팔레트 유지).

- [ ] **Step 2: 컴포넌트 작성** — 입자 1,800개를 가스별 비중만큼 **경도 구간(3D 파이 조각)**에 배치해 비율이 눈에 보이게 한다.

```tsx
// components/viz/GasMixCloud.tsx
'use client'

import { useRef } from 'react'
import { gasMix, t, type Lang } from '@/data/charts/carbon-basics-1'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { discSprite, makePoints, disposePoints } from './three-utils'
import VizFrame from './VizFrame'

const COUNT = 1800

const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 100)
  camera.position.set(0, 0.6, 4.2)
  camera.lookAt(0, 0, 0)
  const sprite = discSprite(THREE)
  const root = new THREE.Group()
  scene.add(root)

  // 가스별 경도 구간: share에 비례한 각도 폭. 조각 사이 2도 틈.
  const pos = new Float32Array(COUNT * 3)
  const col = new Float32Array(COUNT * 3)
  const total = gasMix.shares.reduce((s, g) => s + g.share, 0)
  const gap = (2 * Math.PI) / 180
  let start = 0
  let idx = 0
  for (const g of gasMix.shares) {
    const n = Math.round((g.share / total) * COUNT)
    const width = (g.share / total) * 2 * Math.PI - gap
    const c = new THREE.Color(g.color)
    for (let k = 0; k < n && idx < COUNT; k++, idx++) {
      const a = start + Math.random() * width
      const r = 0.55 + Math.sqrt(Math.random()) * 0.95
      const y = (Math.random() - 0.5) * 0.7 * (1 - (r - 0.55) / 1.4)
      pos[idx * 3] = Math.cos(a) * r
      pos[idx * 3 + 1] = y
      pos[idx * 3 + 2] = Math.sin(a) * r
      col[idx * 3] = c.r
      col[idx * 3 + 1] = c.g
      col[idx * 3 + 2] = c.b
    }
    start += width + gap
  }
  const cloud = makePoints(THREE, pos, {
    size: 0.075,
    sprite,
    vertexColors: col,
    opacity: 0.9,
    additive: true,
  })
  root.add(cloud)
  root.rotation.x = 0.35

  return {
    render(ts) {
      root.rotation.y = ts * 0.00012
      renderer.render(scene, camera)
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposePoints(cloud)
      sprite.dispose()
    },
  }
}

export default function GasMixCloud({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  return (
    <VizFrame
      title={L.gasTitle}
      caption={L.gasCaption}
      sourceLabel={L.source}
      sourceName={`${gasMix.source.name}, ${gasMix.source.year}`}
      sourceUrl={gasMix.source.url}
      status={status}
      canvasRef={canvasRef}
      overlay={
        <ul className="absolute bottom-4 left-4 m-0 flex list-none flex-col gap-1 p-0 font-mono text-[12px] text-[#f4efe4]">
          {gasMix.shares.map((g) => (
            <li key={g.id} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: g.color }}
              />
              <span>{L.gas[g.id]}</span>
              <span className="tabular-nums opacity-80">{g.share}%</span>
            </li>
          ))}
        </ul>
      }
      fallback={{
        columns: [L.year === 'Year' ? 'Gas' : '가스', '%'],
        rows: gasMix.shares.map((g) => ({ label: L.gas[g.id], value: `${g.share}%` })),
        note: L.fallbackNote,
      }}
    />
  )
}
```

- [ ] **Step 3: 임시 확인 페이지** — `app/climate/page.tsx`를 건드리지 말고, Playwright로 확인하기 위해 Task 9에서 포스트에 삽입한 뒤 본다(이 태스크에서는 타입·린트만).

Run: `yarn lint && yarn tsc --noEmit -p tsconfig.json` → 통과.

- [ ] **Step 4: 커밋**

```bash
git add components/viz/GasMixCloud.tsx
git commit -m "feat(viz): V1 온실가스 구성 입자 구름"
```

---

### Task 6: V2 `AtmosphereTimeline` (연도별 CO₂ 농도)

**Files:**

- Create: `components/viz/AtmosphereTimeline.tsx`

**Interfaces:**

- Consumes: `co2Annual`, `t` (Task 1), `buildEarthScene` (Task 4), `useThreeScene`, `VizFrame`
- Produces: `<AtmosphereTimeline lang="ko" />`

- [ ] **Step 1: 컴포넌트 작성** — 자동 재생(1959→2025, 약 14초, 끝에서 3초 정지 후 반복), 슬라이더 조작 시 일시정지. 헤이즈 밀도는 `(ppm - 280) / (ppm_max - 280)`.

```tsx
// components/viz/AtmosphereTimeline.tsx
'use client'

import { useMemo, useRef, useState } from 'react'
import { co2Annual, t, type Lang } from '@/data/charts/carbon-basics-1'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { buildEarthScene } from './earthScene'
import VizFrame from './VizFrame'

const series = co2Annual.series
const FIRST = series[0][0]
const LAST = series[series.length - 1][0]
const MAX_PPM = series[series.length - 1][1]
const CYCLE_MS = 14000
const HOLD_MS = 3000

/** 렌더 루프와 React 사이의 공유 상태(리렌더 없이 매 프레임 읽음) */
interface Shared {
  year: number
  playing: boolean
  t0: number
  onYear?: (y: number) => void
}
const shared: Shared = { year: FIRST, playing: true, t0: 0 }

function ppmOf(year: number): number {
  const row = series.find((r) => r[0] === year) ?? series[series.length - 1]
  return row[1]
}
function levelOf(year: number): number {
  return (ppmOf(year) - co2Annual.preindustrial) / (MAX_PPM - co2Annual.preindustrial)
}

const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const earth = buildEarthScene(THREE, { cameraZ: 4.4, hazeCount: 3200 })
  earth.setHazeLevel(levelOf(shared.year))
  let lastYear = shared.year
  return {
    render(ts) {
      if (shared.playing) {
        if (!shared.t0) shared.t0 = ts
        const el = (ts - shared.t0) % (CYCLE_MS + HOLD_MS)
        const p = Math.min(1, el / CYCLE_MS)
        shared.year = Math.round(FIRST + p * (LAST - FIRST))
      }
      if (shared.year !== lastYear) {
        lastYear = shared.year
        earth.setHazeLevel(levelOf(shared.year))
        shared.onYear?.(shared.year)
      }
      earth.render(renderer, ts)
    },
    resize: earth.resize,
    dispose: earth.dispose,
  }
}

export default function AtmosphereTimeline({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [year, setYear] = useState(FIRST)
  const [playing, setPlaying] = useState(true)
  shared.onYear = setYear
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  const ppm = useMemo(() => ppmOf(year), [year])

  const scrub = (y: number) => {
    shared.playing = false
    shared.year = y
    setPlaying(false)
    setYear(y)
  }
  const toggle = () => {
    const next = !playing
    shared.playing = next
    if (next) shared.t0 = 0
    setPlaying(next)
  }

  return (
    <VizFrame
      title={L.timelineTitle}
      caption={L.timelineCaption}
      sourceLabel={L.source}
      sourceName={`${co2Annual.source.name}, ${co2Annual.source.year}`}
      sourceUrl={co2Annual.source.url}
      status={status}
      canvasRef={canvasRef}
      aspect="1 / 1"
      overlay={
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 text-[#f4efe4]">
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-bold tabular-nums">{year}</span>
            <span className="text-xl tabular-nums">
              {ppm.toFixed(1)} <span className="text-sm opacity-80">{L.ppm}</span>
            </span>
          </div>
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="rounded-full border border-[rgba(244,239,228,.4)] px-3 py-1 font-mono text-[11px] tracking-wide uppercase"
            >
              {playing ? L.pause : L.play}
            </button>
            <input
              type="range"
              min={FIRST}
              max={LAST}
              value={year}
              onChange={(e) => scrub(Number(e.target.value))}
              aria-label={L.year}
              className="w-full accent-[#e6a760]"
            />
          </div>
          <div className="font-mono text-[10.5px] tracking-wide uppercase opacity-70">
            {L.preindustrial}
          </div>
        </div>
      }
      fallback={{
        columns: [L.year, L.ppm],
        rows: series
          .filter((r) => r[0] % 10 === 0 || r[0] === LAST)
          .map((r) => ({ label: String(r[0]), value: r[1].toFixed(1) })),
        note: L.fallbackNote,
      }}
    />
  )
}
```

- [ ] **Step 2: 린트·타입** — Run: `yarn lint && yarn tsc --noEmit -p tsconfig.json` → 통과. (`shared` 모듈 싱글턴은 페이지에 이 장면이 하나뿐이라는 전제. 2편에서 두 개를 쓰게 되면 `useRef`로 옮긴다.)

- [ ] **Step 3: 커밋**

```bash
git add components/viz/AtmosphereTimeline.tsx
git commit -m "feat(viz): V2 CO₂ 농도 타임라인(지구 헤이즈 밀도)"
```

---

### Task 7: V3 `BudgetTank` (탄소 예산 탱크)

**Files:**

- Create: `components/viz/BudgetTank.tsx`

**Interfaces:**

- Consumes: `carbonBudget`, `t` (Task 1), helpers, `VizFrame`
- Produces: `<BudgetTank lang="ko" />`

- [ ] **Step 1: 컴포넌트 작성** — 원통 윤곽선(EdgesGeometry) 안에 입자 3,000개. 화면에 들어오면 3초에 걸쳐 `used/total` 높이까지 차오르고(rust), 잔여 구간은 옅은 moss 입자가 떠 있다.

```tsx
// components/viz/BudgetTank.tsx
'use client'

import { useRef } from 'react'
import { carbonBudget, t, type Lang } from '@/data/charts/carbon-basics-1'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { discSprite, makePoints, disposePoints } from './three-utils'
import VizFrame from './VizFrame'

const USED = 3000
const FREE = 500
const R = 1.0
const H = 2.4
const FILL_MS = 3000

const total = carbonBudget.usedGt + carbonBudget.remainingGt
const usedRatio = carbonBudget.usedGt / total
const yearsLeft = Math.max(1, Math.round(carbonBudget.remainingGt / carbonBudget.annualGt))

function cylinderPoints(n: number, yMin: number, yMax: number): Float32Array {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * (R - 0.04)
    out[i * 3] = Math.cos(a) * r
    out[i * 3 + 1] = yMin + Math.random() * (yMax - yMin)
    out[i * 3 + 2] = Math.sin(a) * r
  }
  return out
}

const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1.6, 0.1, 100)
  camera.position.set(0, 1.1, 5.2)
  camera.lookAt(0, 0.1, 0)
  const sprite = discSprite(THREE)
  const root = new THREE.Group()
  scene.add(root)

  const tank = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.CylinderGeometry(R, R, H, 48, 1, true), 30),
    new THREE.LineBasicMaterial({ color: '#f4efe4', transparent: true, opacity: 0.35 })
  )
  root.add(tank)

  const fillTop = -H / 2 + H * usedRatio
  const usedPts = makePoints(THREE, cylinderPoints(USED, -H / 2, fillTop), {
    size: 0.05,
    sprite,
    color: '#cf7a3d',
    opacity: 0.85,
    additive: true,
  })
  const freePts = makePoints(THREE, cylinderPoints(FREE, fillTop, H / 2), {
    size: 0.045,
    sprite,
    color: '#a8bd74',
    opacity: 0.55,
    additive: true,
  })
  root.add(usedPts, freePts)
  usedPts.geometry.setDrawRange(0, 0)

  // 차오르는 순서: y 오름차순으로 정렬해 두면 drawRange만 늘려도 아래부터 찬다
  const arr = usedPts.geometry.getAttribute('position') as InstanceType<
    typeof THREE.BufferAttribute
  >
  const pts: number[][] = []
  for (let i = 0; i < USED; i++) pts.push([arr.getX(i), arr.getY(i), arr.getZ(i)])
  pts.sort((a, b) => a[1] - b[1])
  pts.forEach((p, i) => arr.setXYZ(i, p[0], p[1], p[2]))
  arr.needsUpdate = true

  let t0 = 0
  return {
    render(ts) {
      if (!t0) t0 = ts
      const p = Math.min(1, (ts - t0) / FILL_MS)
      const eased = 1 - Math.pow(1 - p, 3)
      usedPts.geometry.setDrawRange(0, Math.round(USED * eased))
      root.rotation.y = ts * 0.00015
      renderer.render(scene, camera)
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposePoints(usedPts)
      disposePoints(freePts)
      tank.geometry.dispose()
      ;(tank.material as InstanceType<typeof THREE.LineBasicMaterial>).dispose()
      sprite.dispose()
    },
  }
}

export default function BudgetTank({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  const pct = Math.round(usedRatio * 100)
  return (
    <VizFrame
      title={L.budgetTitle}
      caption={L.budgetCaption}
      sourceLabel={L.source}
      sourceName={`${carbonBudget.source.name}, ${carbonBudget.source.year}`}
      sourceUrl={carbonBudget.source.url}
      status={status}
      canvasRef={canvasRef}
      overlay={
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 font-mono text-[12px] text-[#f4efe4]">
          <div>
            <span className="text-2xl font-bold tabular-nums">{pct}%</span>{' '}
            <span className="opacity-80">{L.used}</span>
          </div>
          <div className="tabular-nums opacity-90">
            {carbonBudget.remainingGt} Gt {L.remaining}
          </div>
          <div className="opacity-75">{L.yearsLeft(yearsLeft)}</div>
        </div>
      }
      fallback={{
        columns: [L.year === 'Year' ? 'Budget' : '예산', 'Gt CO₂'],
        rows: [
          { label: L.used, value: String(carbonBudget.usedGt) },
          { label: L.remaining, value: String(carbonBudget.remainingGt) },
          { label: L.yearsLeft(yearsLeft), value: `${carbonBudget.annualGt} Gt/yr` },
        ],
        note: L.fallbackNote,
      }}
    />
  )
}
```

- [ ] **Step 2: 린트·타입** — Run: `yarn lint && yarn tsc --noEmit -p tsconfig.json` → 통과.

- [ ] **Step 3: 커밋**

```bash
git add components/viz/BudgetTank.tsx
git commit -m "feat(viz): V3 탄소 예산 탱크"
```

---

### Task 8: V4 `TonneCubes` (활동별 CO₂e 부피 큐브)

**Files:**

- Create: `components/viz/TonneCubes.tsx`

**Interfaces:**

- Consumes: `tonneItems`, `CO2_M3_PER_KG`, `t` (Task 1), helpers, `VizFrame`
- Produces: `<TonneCubes lang="ko" />`

- [ ] **Step 1: 컴포넌트 작성** — 큐브 한 변 = `cbrt(kg × 0.535)` m. 사람(1.7 m 캡슐)·자동차(4.5×1.5×1.8 박스)를 기준으로 큐브를 x축에 나란히 배치하고 카메라가 천천히 옆으로 이동한다. 라벨은 HTML 오버레이를 매 프레임 3D→2D 투영으로 위치시킨다. 음수(나무 흡수)는 moss 색 와이어 큐브로 그린다.

```tsx
// components/viz/TonneCubes.tsx
'use client'

import { useRef } from 'react'
import { CO2_M3_PER_KG, t, tonneItems, type Lang } from '@/data/charts/carbon-basics-1'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import VizFrame from './VizFrame'

const GAP = 3
const labelRefs: (HTMLDivElement | null)[] = []

interface Placed {
  id: string
  size: number
  x: number
  kg: number
}

function place(): Placed[] {
  const out: Placed[] = []
  let x = 0
  for (const item of tonneItems) {
    const size = Math.cbrt(Math.abs(item.kg) * CO2_M3_PER_KG)
    x += size / 2
    out.push({ id: item.id, size, x, kg: item.kg })
    x += size / 2 + GAP
  }
  return out
}
const placed = place()
const totalWidth = placed[placed.length - 1].x + placed[placed.length - 1].size / 2

const build: SceneBuilder = (THREE, canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1.6, 0.1, 400)
  const root = new THREE.Group()
  scene.add(root)

  const grid = new THREE.GridHelper(400, 80, '#5b3a1c', '#3a2413')
  grid.position.y = 0
  root.add(grid)

  const cubeMat = new THREE.MeshBasicMaterial({
    color: '#e6a760',
    transparent: true,
    opacity: 0.22,
  })
  const edgeMat = new THREE.LineBasicMaterial({
    color: '#f4efe4',
    transparent: true,
    opacity: 0.55,
  })
  const absorbMat = new THREE.LineBasicMaterial({
    color: '#a8bd74',
    transparent: true,
    opacity: 0.9,
  })
  const refMat = new THREE.MeshBasicMaterial({ color: '#f4efe4', transparent: true, opacity: 0.85 })
  const disposables: { dispose: () => void }[] = [cubeMat, edgeMat, absorbMat, refMat]
  const anchors: { obj: InstanceType<typeof THREE.Object3D>; y: number }[] = []

  for (const p of placed) {
    const geo = new THREE.BoxGeometry(p.size, p.size, p.size)
    disposables.push(geo)
    const edges = new THREE.EdgesGeometry(geo)
    disposables.push(edges)
    const group = new THREE.Group()
    group.position.set(p.x, p.size / 2, 0)
    if (p.kg >= 0) group.add(new THREE.Mesh(geo, cubeMat))
    group.add(new THREE.LineSegments(edges, p.kg >= 0 ? edgeMat : absorbMat))
    root.add(group)
    anchors.push({ obj: group, y: p.size / 2 + 0.6 })
  }

  // 기준 물체: 사람(1.7 m)과 자동차, 1 t 큐브 앞에
  const tonne = placed.find((p) => p.id === 'tonne') ?? placed[placed.length - 1]
  const human = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.26, 4, 8), refMat)
  human.position.set(tonne.x - tonne.size / 2 - 1.2, 0.85, 1.6)
  const car = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.5, 1.8), refMat)
  car.position.set(tonne.x - tonne.size / 2 - 4.6, 0.75, 1.6)
  disposables.push(human.geometry, car.geometry)
  root.add(human, car)
  anchors.push({ obj: human, y: 1.4 }, { obj: car, y: 1.2 })

  const v = new THREE.Vector3()
  const project = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    anchors.forEach((a, i) => {
      const el = labelRefs[i]
      if (!el) return
      v.set(a.obj.position.x, a.obj.position.y + a.y, a.obj.position.z).project(camera)
      const sx = (v.x * 0.5 + 0.5) * w
      const sy = (-v.y * 0.5 + 0.5) * h
      const visible = v.z < 1 && sx > -80 && sx < w + 80
      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`
      el.style.opacity = visible ? '1' : '0'
    })
  }

  return {
    render(ts) {
      // 카메라가 왼쪽 끝에서 오른쪽 끝까지 천천히 왕복
      const p = (Math.sin(ts * 0.00008 - Math.PI / 2) + 1) / 2
      const cx = -4 + p * (totalWidth + 8)
      const big = placed[placed.length - 1].size
      camera.position.set(cx + 6, 6 + p * big * 0.6, 22 + p * big * 1.4)
      camera.lookAt(cx, 2 + p * big * 0.25, 0)
      renderer.render(scene, camera)
      project()
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposables.forEach((d) => d.dispose())
      grid.geometry.dispose()
      ;(grid.material as InstanceType<typeof THREE.Material>).dispose()
    },
  }
}

export default function TonneCubes({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  const fmt = (kg: number) => `${kg < 0 ? '−' : ''}${Math.abs(kg).toLocaleString('en-US')} ${L.kg}`
  const labels = [
    ...placed.map((p) => ({ key: p.id, text: L.tonne[p.id], sub: fmt(p.kg) })),
    { key: 'human', text: L.human, sub: '' },
    { key: 'car', text: L.car, sub: '' },
  ]
  return (
    <VizFrame
      title={L.tonneTitle}
      caption={L.tonneCaption}
      sourceLabel={L.source}
      sourceName={tonneItems
        .map((i) => i.source.name)
        .filter((n, k, a) => n && a.indexOf(n) === k)
        .join(' · ')}
      status={status}
      canvasRef={canvasRef}
      aspect="16 / 9"
      overlay={
        <>
          {labels.map((l, i) => (
            <div
              key={l.key}
              ref={(el) => {
                labelRefs[i] = el
              }}
              className="absolute top-0 left-0 text-center font-mono text-[11px] leading-tight whitespace-nowrap text-[#f4efe4] opacity-0 transition-opacity"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
            >
              <div>{l.text}</div>
              {l.sub && <div className="tabular-nums opacity-80">{l.sub}</div>}
            </div>
          ))}
        </>
      }
      fallback={{
        columns: [L.year === 'Year' ? 'Activity' : '활동', L.kg],
        rows: placed.map((p) => ({ label: L.tonne[p.id], value: fmt(p.kg) })),
        note: L.fallbackNote,
      }}
    />
  )
}
```

- [ ] **Step 2: 린트·타입** — Run: `yarn lint && yarn tsc --noEmit -p tsconfig.json` → 통과.

- [ ] **Step 3: 커밋**

```bash
git add components/viz/TonneCubes.tsx
git commit -m "feat(viz): V4 활동별 CO₂e 부피 큐브"
```

---

### Task 9: MDX 등록, 포스트(KO/EN), KB 토픽, 허브 링크

**Files:**

- Modify: `components/MDXComponents.tsx`
- Modify: `scripts/generate-kb-data.mjs:132-141`
- Modify: `data/climateData.ts` (series.items에 `slug`), `components/climate/LearningSeries.tsx`
- Create: `data/posts/2026-09-05-carbon-basics-what-is-carbon.mdx`, `data/posts/2026-09-05-carbon-basics-what-is-carbon.en.mdx`

- [ ] **Step 1: MDX 컴포넌트 등록**

```tsx
// components/MDXComponents.tsx (전체)
import TOCInline from 'pliny/ui/TOCInline'
import Pre from '@/components/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import GasMixCloud from './viz/GasMixCloud'
import AtmosphereTimeline from './viz/AtmosphereTimeline'
import BudgetTank from './viz/BudgetTank'
import TonneCubes from './viz/TonneCubes'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
  GasMixCloud,
  AtmosphereTimeline,
  BudgetTank,
  TonneCubes,
}
```

- [ ] **Step 2: KB 토픽 라벨** — `scripts/generate-kb-data.mjs`의 `TOPIC_LABELS`에 `climate: 'Climate',` 한 줄 추가(`algorithms` 다음).

- [ ] **Step 3: 허브 시리즈 링크** — `data/climateData.ts`의 `ClimateStrings.series.items` 타입을 `{ num: string; title: string; desc: string; slug?: string }[]`로 바꾸고, EN/KO 양쪽 1번 항목에 `slug: '2026-09-05-carbon-basics-what-is-carbon'` 추가. `Labels`에 `read` 문자열은 두지 않고 컴포넌트에서 lang으로 분기한다.

```tsx
// components/climate/LearningSeries.tsx (전체)
'use client'

import Link from '@/components/Link'
import { climateCopy } from '@/data/climateData'
import { useLanguage } from '@/components/LanguageProvider'
import { mossText } from './styles'

export default function LearningSeries() {
  const { lang } = useLanguage()
  const t = climateCopy[lang].series
  const readLabel = lang === 'ko' ? '읽기 →' : 'Read →'
  const hrefFor = (slug: string) => (lang === 'ko' ? `/ko/posts/${slug}` : `/posts/${slug}`)
  return (
    <section className="pb-12">
      <div className="sec-head">
        <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">{t.heading}</h2>
        <span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
          {t.label}
        </span>
      </div>
      <p className="text-muted mb-6 max-w-[58ch] text-sm">{t.sub}</p>

      <div className="flex flex-col gap-2.5">
        {t.items.map((item) => {
          const inner = (
            <>
              <div className={`text-center font-serif text-xl ${mossText}`}>{item.num}</div>
              <div>
                <h4 className="text-[15px] font-semibold tracking-tight break-keep">
                  {item.title}
                </h4>
                <p className="text-ink/70 mt-0.5 text-[12.5px]">{item.desc}</p>
              </div>
              <span
                className={`col-start-2 text-[10.5px] font-bold tracking-[0.08em] whitespace-nowrap sm:col-start-auto ${item.slug ? 'text-accent' : 'text-muted'}`}
              >
                {item.slug ? readLabel : t.badge}
              </span>
            </>
          )
          const cls =
            'border-line grid grid-cols-[34px_1fr] items-center gap-4 rounded-xl border px-4 py-3 sm:grid-cols-[46px_1fr_auto]'
          return item.slug ? (
            <Link
              key={item.num}
              href={hrefFor(item.slug)}
              className={`${cls} hover:border-accent transition-colors`}
            >
              {inner}
            </Link>
          ) : (
            <div key={item.num} className={cls}>
              {inner}
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 한국어 포스트 작성** (본문은 캡션 수준. 숫자는 Task 1의 검증값과 일치시킨다.)

```mdx
---
slug: '2026-09-05-carbon-basics-what-is-carbon'
title: '탄소 기초 1: 탄소란 무엇이고, 왜 중요한가'
crawlertitle: '탄소 기초 1: 탄소란 무엇이고, 왜 중요한가'
summary: 'CO₂e가 무엇인지, 대기 중 CO₂가 얼마나 쌓였는지, 1.5°C 예산이 얼마나 남았는지, 그리고 1톤이 실제로 얼마나 큰지를 글 대신 3D 장면 네 개로 보여줍니다.'
date: 2026-09-05 18:00:00 +0900
categories: posts
tags: ['climate', 'carbon', 'co2e', 'carbon-basics']
topic: climate
stage: budding
author: MartianLee
---

_This article is mostly written by Claude Code_

> "Carbon, from scratch" 시리즈 1편입니다. 이 시리즈는 [Climate 페이지](/climate)에서 소개한 작업을 기본 원리부터 풀어 씁니다.

## 왜 필요한가요

탄소 데이터를 다루면 처음 만나는 벽은 단위입니다. t CO₂e, ppm, Gt 같은 단위를 읽지 못하면 어떤 숫자가 큰지 작은지조차 알 수 없습니다. 이 글은 그 단위들을 글로 설명하는 대신, 규모가 몸으로 느껴지는 장면 네 개로 보여줍니다.

## 탄소, CO₂, 온실가스, 그리고 CO₂e

탄소(C)는 원소이고, 이산화탄소(CO₂)는 탄소가 산소와 결합한 기체입니다. 지구를 덥히는 온실가스는 CO₂만이 아니라 메탄, 아산화질소, 불소계 가스까지 여럿입니다. 가스마다 온난화 효과가 다르므로, 이를 한 숫자로 합치려면 모든 가스를 CO₂ 기준으로 환산합니다. 그 단위가 CO₂e입니다.

<GasMixCloud lang="ko" />

## 규모: 농도와 쿼터

대기 중 CO₂는 농도(ppm)로 잽니다. 공기 분자 백만 개 중 CO₂가 몇 개인지를 뜻합니다. 산업화 이전에는 약 280 ppm이었고, 관측이 시작된 1959년 이후 매년 빠짐없이 올랐습니다.

<AtmosphereTimeline lang="ko" />

온난화를 1.5°C 안에서 멈추려면 앞으로 배출할 수 있는 총량이 정해져 있습니다. 이것이 탄소 예산이고, 개발자에게 익숙한 말로 하면 쿼터입니다. 아래 탱크가 그 쿼터입니다.

<BudgetTank lang="ko" />

## 1톤을 손에 잡히게

탄소 이야기에 나오는 숫자는 대부분 톤 단위입니다. CO₂는 기체라서 1톤이 생각보다 훨씬 큰 부피를 차지합니다. 사람과 자동차를 옆에 두고 보면 규모가 잡힙니다.

<TonneCubes lang="ko" />

## 왜 중요한가요

예산은 유한하고, 유한한 것은 재야 관리할 수 있습니다. 그래서 탄소 문제의 출발점은 측정이고, 측정은 단위를 정확히 읽는 데서 시작합니다. 다음 편에서는 우리 일상의 어디에서 탄소가 나오는지 살펴봅니다. 이 시리즈의 배경이 된 작업은 [Climate 페이지](/climate)에 정리해 두었습니다.

## 출처와 수치 검증

- 대기 중 CO₂ 연평균: NOAA Global Monitoring Laboratory, Mauna Loa (2025)
- 연간 배출량·잔여 탄소 예산: Global Carbon Budget 2025
- 가스별 비중: Our World in Data (Climate Watch)
- 1인당 배출: Our World in Data
- 나무 흡수량, 전력 배출계수 등 국내 수치: 각 장면 하단 출처 표기
- CO₂ 부피: 15°C, 1기압에서 밀도 1.87 kg/m³ 기준
```

- [ ] **Step 5: 영어 포스트 작성** (같은 구조, 자연스러운 번역)

```mdx
---
slug: '2026-09-05-carbon-basics-what-is-carbon'
title: 'Carbon Basics 1: What carbon is, and why it matters'
crawlertitle: 'Carbon Basics 1: What carbon is, and why it matters'
summary: 'What CO₂e means, how much CO₂ has built up in the air, how much of the 1.5 °C budget is left, and how big a tonne really is, shown in four 3D scenes instead of paragraphs.'
date: 2026-09-05 18:00:00 +0900
categories: posts
tags: ['climate', 'carbon', 'co2e', 'carbon-basics']
topic: climate
stage: budding
author: MartianLee
---

_This article is mostly written by Claude Code_

> Part 1 of "Carbon, from scratch". The series explains, from first principles, the work introduced on the [Climate page](/climate).

## Why this matters

The first wall you hit with carbon data is units. Until you can read t CO₂e, ppm and Gt, you cannot tell a big number from a small one. Rather than explain those units in prose, this post shows four scenes where the scale is something you can feel.

## Carbon, CO₂, greenhouse gases, and CO₂e

Carbon (C) is an element; carbon dioxide (CO₂) is the gas it forms with oxygen. CO₂ is not the only gas warming the planet: methane, nitrous oxide and fluorinated gases do too, each with a different warming effect. To add them into one number, every gas is converted to its CO₂ equivalent. That unit is CO₂e.

<GasMixCloud lang="en" />

## Scale: concentration and the quota

CO₂ in the air is measured as a concentration, in ppm: how many of every million air molecules are CO₂. Before industrialisation it was about 280 ppm, and it has risen every single year since measurements began in 1959.

<AtmosphereTimeline lang="en" />

To stop warming at 1.5 °C there is a fixed amount we can still emit. That is the carbon budget, or in developer terms, a quota. The tank below is that quota.

<BudgetTank lang="en" />

## Making a tonne tangible

Most carbon numbers come in tonnes. Because CO₂ is a gas, a tonne takes up far more space than you would guess. Put a person and a car next to it and the scale clicks.

<TonneCubes lang="en" />

## Why it matters

The budget is finite, and finite things can be managed only if they are measured. That is why the carbon problem starts with measurement, and measurement starts with reading the units correctly. Next in the series: where carbon actually comes from in everyday life. The work behind this series is summarised on the [Climate page](/climate).

## Sources and verification

- Atmospheric CO₂ annual means: NOAA Global Monitoring Laboratory, Mauna Loa (2025)
- Annual emissions and remaining carbon budget: Global Carbon Budget 2025
- Share by gas: Our World in Data (Climate Watch)
- Per-capita emissions: Our World in Data
- Korean figures (tree absorption, grid emission factor): cited under each scene
- CO₂ volume: density 1.87 kg/m³ at 15 °C and 1 atm
```

- [ ] **Step 6: 빌드·린트** — Run: `yarn lint && INIT_CWD=$PWD npx contentlayer2 build 2>&1 | tail -3` → `KB data generated: ... notes` 로그에 노트 수가 1 늘고 토픽에 `climate`가 생긴다. `git diff --stat app/kb-data.json`으로 변경 확인(커밋에 포함).

- [ ] **Step 7: 커밋**

```bash
git add components/MDXComponents.tsx scripts/generate-kb-data.mjs data/climateData.ts components/climate/LearningSeries.tsx data/posts/2026-09-05-carbon-basics-what-is-carbon.mdx data/posts/2026-09-05-carbon-basics-what-is-carbon.en.mdx app/kb-data.json
git commit -m "post: 탄소 기초 1 (KO+EN), 3D 장면 4개 삽입, 허브 시리즈 1번 링크"
```

---

### Task 10: 시각 검증과 한국어 정독, 최종 빌드

**Files:** 없음(검증만). 문제가 나오면 해당 컴포넌트 수정 후 재커밋.

- [ ] **Step 1: dev 서버** — `yarn dev`(백그라운드) 후 `curl --retry 40 --retry-delay 2 --retry-all-errors -sf -o /dev/null -w "%{http_code}" http://localhost:3456/ko/posts/2026-09-05-carbon-basics-what-is-carbon` → `200`.

- [ ] **Step 2: 장면 4개 로드 확인** — Playwright로 KO 포스트를 열고 5초 대기 후 `document.querySelectorAll('canvas').length === 4`이고 모든 canvas의 `getComputedStyle(c).opacity === '1'`인지 evaluate. 콘솔 에러 0.

- [ ] **Step 3: 스크린샷 4장** — 각 `figure`를 `scrollIntoView` 후 뷰포트 스크린샷(1280×900), 파일은 scratchpad에. 확인 항목: V1 범례가 입자 색과 맞음, V2 연도/ppm이 재생되며 슬라이더 조작 시 멈춤, V3 탱크가 차오르고 % 표시, V4 큐브 라벨이 큐브 위에 붙어 따라감·사람/자동차가 1t 큐브 옆에 보임.

- [ ] **Step 4: 다크/라이트·모바일** — `document.documentElement.classList.add('dark')`로 다크 확인(장면은 어두운 배경 고정, 캡션·표는 토큰 색), 390×844로 모바일 확인(캔버스가 가로 스크롤을 만들지 않음).

- [ ] **Step 5: EN 포스트** — `/posts/2026-09-05-carbon-basics-what-is-carbon` 동일 확인. 허브 `/climate`에서 시리즈 1번 카드가 링크(읽기 →)로 바뀌고 클릭 시 언어별 포스트로 이동.

- [ ] **Step 6: 한국어 정독** — 본문·캡션·라벨을 번역체/경어체/em-dash 관점으로 읽고 고친다. 컨텍스트 없는 서브에이전트 프레시 리뷰 1회.

- [ ] **Step 7: 최종 빌드** — `yarn build 2>&1 | tail -5` → `RSS feed generated...`로 끝나고 에러 없음. `ls out/ko/posts/2026-09-05-carbon-basics-what-is-carbon*` 존재.

- [ ] **Step 8: 커밋·보고** — 수정분 커밋 후 브랜치 상태 보고. 배포는 사용자가 "배포"라고 하면 `main` ff-merge + push.

---

## Self-Review

- **Spec coverage**: 구성 6파트(Task 9 포스트), 시각화 V1~V4(Task 5~8), 3D·폴백 표·reduced-motion(Task 2·3), 데이터 한 곳 + 출처 검증(Task 1), 허브 링크(Task 9 Step 3), KB 토픽(Task 9 Step 2), KO/EN 쌍·경어체·em-dash 금지(Global Constraints + Task 9), 검증(Task 10). 누락 없음.
- **Placeholder scan**: Task 1 데이터의 빈 `source.name/url`은 "검증 후 채운다"는 지시가 붙은 입력 항목이며 Step 2에서 확인 불가 항목은 삭제하도록 규정.
- **Type consistency**: `SceneBuilder(THREE, canvas, renderer) => SceneHandle{render(ts, dt), resize(w,h), dispose()}` 를 Task 4~8이 동일하게 사용. `buildEarthScene(...).render(renderer, ts)` 시그니처를 Globe3D·AtmosphereTimeline이 동일하게 호출. `t[lang]` 라벨 키(`gasTitle`, `timelineTitle`, `budgetTitle`, `tonneTitle`, `tonne[id]`, `yearsLeft(n)`)가 Task 1 정의와 일치.
