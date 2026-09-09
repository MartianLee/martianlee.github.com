# 탄소 기초 2편 구현 계획 (2026-09-10)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. 단계는 체크박스(`- [ ]`)로 추적합니다.

**Goal:** `/climate` 시리즈 2편 "일상 속 탄소는 어디에 숨어 있나"를 3D 시각화 5개와 함께 KO/EN 쌍으로 발행한다.

**Architecture:** 1편에서 만든 viz 기반(`useThreeScene`, `VizFrame`, `three-utils`)을 그대로 재사용하고, 새 장면 5개와 데이터 모듈 하나만 추가한다. 숫자·출처·라벨은 `data/charts/carbon-basics-2.ts` 한 곳에 있고 장면은 `lang`만 받는다.

**Tech Stack:** Next.js 16 App Router(static export), React 19, TypeScript strict, Tailwind v4, three.js 0.185, Contentlayer2 MDX.

## Global Constraints

- 패키지 매니저는 **yarn berry**. `npm install` 금지. 새 의존성 추가 금지(three는 이미 있다).
- 장면 컴포넌트는 `'use client'`, three는 **`useThreeScene` 안에서만** 지연 로드된다. 컴포넌트 파일 상단에서 three를 값으로 import하지 않는다(`import type * as ThreeNS from 'three'`만 허용).
- `build: SceneBuilder`는 **모듈 레벨 상수**로 선언한다. 컴포넌트 안에서 만들면 매 렌더마다 장면이 재생성된다.
- 모든 geometry/material/texture는 `dispose()`에서 해제한다.
- reduced-motion 대응: 애니메이션이 "끝난 상태"가 의미 있는 장면은 `settle()`을 구현한다.
- 숫자·문자열 하드코딩 금지. 전부 `data/charts/carbon-basics-2.ts`에서 가져온다.
- 라벨과 본문에 **em-dash(—) 절대 금지**. 한국어는 경어체.
- 장면 배경은 `VizFrame`이 그린다. 컴포넌트에서 배경색을 다시 칠하지 않는다.
- 색은 1편 팔레트를 따른다: amber `#e6a760`, moss `#a8bd74`, rust `#cf7a3d`, paper `#f4efe4`, grid line `#5b3a1c` / `#3a2413`.
- `yarn lint`와 `npx tsc --noEmit`이 통과해야 한다.

---

### Task 1: 데이터 모듈 (완료)

`data/charts/carbon-basics-2.ts`. 검증된 수치와 출처, KO/EN 라벨. 이미 작성되어 있으므로 **읽기만** 하고 수정하지 않는다. 값을 바꿔야 할 이유를 찾으면 구현을 멈추고 보고한다.

---

### Task 2: CarbonDay (V1)

**Files:** Create `components/viz/CarbonDay.tsx`

**Consumes:** `dayItems`, `dayTotalKg`, `KOREA_PER_CAPITA_DAILY_KG`, `CO2_M3_PER_KG`, `t`, `Lang` from `@/data/charts/carbon-basics-2`; `useThreeScene`, `SceneBuilder` from `./useThreeScene`; `VizFrame` from `./VizFrame`.

**Produces:** `export default function CarbonDay({ lang }: { lang: Lang })`

**장면:** 하루를 왼쪽에서 오른쪽으로 흐르는 트랙으로 두고, 항목마다 CO₂ 부피 큐브를 세운다.

- 트랙: `GridHelper(200, 40, '#5b3a1c', '#3a2413')`를 바닥에 깔고 x축을 시간축으로 쓴다. x = `(hour - 6) * 3.2` (6시를 원점으로).
- 큐브 한 변 = `Math.cbrt(kg * CO2_M3_PER_KG)`. 1편 TonneCubes와 같은 부피 환산이라 두 글의 크기 감각이 이어진다.
- 큐브는 amber 반투명 `MeshBasicMaterial({ color: '#e6a760', transparent: true, opacity: 0.22 })` + `EdgesGeometry` 흰 선(`#f4efe4`, opacity 0.55). 재질은 전부 공유해서 한 번만 만든다.
- **누적 애니메이션:** 시각 순서대로 하나씩 솟아오른다. 항목 i는 `t0 = i * 1400ms`에 시작해 900ms 동안 `scale.y`가 0에서 1로(ease-out: `1 - (1-p)^3`), 동시에 opacity가 0에서 1로. 마지막 항목이 끝나고 2초 뒤 처음부터 반복한다.
- 카메라: `PerspectiveCamera(38, 1.6, 0.1, 400)`. 큐브가 커지는 점심 쪽으로 천천히 이동하도록 `position.set(cx + 14, 9, 26)`, `lookAt(cx, 2, 0)`에서 `cx`는 현재 진행 중인 항목의 x를 향해 `lerp`(계수 0.02)로 따라간다.
- `settle()`: 모든 큐브를 최종 상태(scale 1, opacity 1)로 두고 카메라를 전체가 보이는 위치(`cx = 트랙 중앙`)로 고정한다.

**오버레이:** 1편 `TonneCubes`의 라벨 방식을 그대로 쓴다. 모듈 레벨 `const labelRefs: (HTMLDivElement | null)[] = []`에 ref를 담고, `render`마다 `Vector3.project(camera)`로 화면 좌표를 계산해 `el.style.transform`을 갱신한다. 라벨은 두 줄: 항목명(`L.day[id]`)과 `${kg.toFixed(2)} ${L.kg}`. 아직 등장하지 않은 항목의 라벨은 `opacity: 0`.

우상단에 누적 합계를 고정 표시한다: `L.dayTotal` 아래 큰 숫자로 현재까지 쌓인 kg(진행 중인 큐브의 부분 값까지 더한다), 그 아래 작은 글씨로 `${L.dayCompare} ${KOREA_PER_CAPITA_DAILY_KG} ${L.kg}`. `pointer-events-none`, 모노 폰트, 색은 `#f4efe4`, `textShadow: '0 1px 2px rgba(0,0,0,.6)'`.

**VizFrame props:** `title={L.dayTitle}`, `caption={L.dayCaption}`, `sourceLabel={L.source}`, `sourceName`은 `dayItems`의 출처 이름을 중복 없이 `' · '`로 이은 문자열, `aspect="16 / 9"`, `fallback={{ columns: [항목, L.kg], rows: dayItems.map(...), note: L.fallbackNote }}`.

- [ ] **Step 1: 컴포넌트 작성** (위 스펙 그대로)
- [ ] **Step 2: 타입·린트** `npx tsc --noEmit` 그리고 `yarn eslint components/viz/CarbonDay.tsx --fix`. 둘 다 에러 0이어야 한다.
- [ ] **Step 3: 커밋** `git add components/viz/CarbonDay.tsx && git commit -m "feat(viz): CarbonDay 장면 추가"`

---

### Task 3: FoodMasses (V2)

**Files:** Create `components/viz/FoodMasses.tsx`

**Consumes:** `foods`, `CO2_M3_PER_KG`, `t`, `Lang`; `useThreeScene`, `VizFrame`.

**Produces:** `export default function FoodMasses({ lang }: { lang: Lang })`

**장면:** 식품 1kg의 배출을 부피 큐브로 한 줄에 세우고 카메라가 채소에서 소고기 쪽으로 패닝한다.

- 정렬은 `foods.items` 순서(소고기 99.48 → 채소 0.53)를 **뒤집어서** 작은 것부터 배치한다. 카메라가 작은 것에서 큰 것으로 이동하며 스케일이 무너지는 순간을 보여 주는 것이 이 장면의 요지다.
- 큐브 한 변 = `Math.cbrt(kgPerKg * CO2_M3_PER_KG)`, 간격 `GAP = 2.4`. 배치는 1편 `TonneCubes`의 `place()`와 같은 방식(누적 x, 각 큐브 중심 = 직전 끝 + 자기 반 폭).
- 재질: 큐브는 amber 반투명, 모서리는 흰 선. 소고기 큐브만 rust(`#cf7a3d`) 모서리로 강조한다.
- 바닥에 `GridHelper`.
- 카메라: 왕복 패닝. `p = (Math.sin(ts * 0.00007 - Math.PI / 2) + 1) / 2`로 0→1→0, `cx = -2 + p * (totalWidth + 4)`, 거리 `dist = 18 + p * biggest * 2.2`, `camera.position.set(cx + dist * 0.3, 3 + p * biggest * 0.8, dist)`, `lookAt(cx, 1 + p * biggest * 0.28, 0)`. 큰 큐브 안으로 카메라가 들어가지 않게 하는 것이 목적이다.
- `settle()`: `p = 1`로 두어 전체가 보이는 끝 프레임을 그린다.

**오버레이:** 라벨은 CarbonDay와 같은 project 방식. 두 줄(`L.food[id]`, `${kgPerKg} ${L.kg}`). 작은 큐브 네 개는 라벨이 겹치므로 1편 `TonneCubes`처럼 **2m 간격 사다리 오프셋**을 준다(`anchors.length < 4 ? anchors.length * 2.0 : 0`).

**VizFrame props:** `title={L.foodTitle}`, `caption={L.foodCaption}`, `sourceName={foods.source.name}`, `sourceUrl={foods.source.url}`, `aspect="16 / 9"`, fallback rows는 `foods.items`.

- [ ] **Step 1: 컴포넌트 작성**
- [ ] **Step 2: 타입·린트** (Task 2와 같은 명령)
- [ ] **Step 3: 커밋** `feat(viz): FoodMasses 장면 추가`

---

### Task 4: TravelLanes (V3)

**Files:** Create `components/viz/TravelLanes.tsx`

**Consumes:** `travel`, `t`, `Lang`; `useThreeScene`, `VizFrame`; `makePoints`, `disposePoints`, `discSprite` from `./three-utils`.

**Produces:** `export default function TravelLanes({ lang }: { lang: Lang })`

**장면:** 수단마다 레인 하나. 각 레인 위를 이동체가 달리고, 뒤로 남는 배출 입자 꼬리의 길이가 `gPerPkm`에 비례한다.

- 레인은 z축으로 `LANE_GAP = 2.2` 간격, 7개. 레인 바닥에 `#3a2413` 얇은 선(`PlaneGeometry(60, 0.04)`).
- 이동체: 작은 흰 큐브(`BoxGeometry(0.5, 0.35, 0.35)`, `#f4efe4`). x가 `-28`에서 `28`까지 **모든 레인이 같은 속도**로 이동한다(같은 1km를 간다는 뜻이다). 주기 12초, 끝에 닿으면 처음으로.
- 꼬리: 레인마다 `makePoints`로 입자를 만든다. 입자 수 = `Math.round(gPerPkm / 2)`(항공 123개, 철도 18개). 입자는 이동체 뒤쪽 `tailLen = gPerPkm / 246 * 22` 범위에 x 방향으로 흩뿌리고 y는 0~1.2, z는 레인 중심 ±0.35. 색은 amber, size 0.5, opacity 0.55. 매 프레임 이동체를 따라 x를 갱신한다(입자 위치 배열을 재계산하고 `attributes.position.needsUpdate = true`).
- `car4`(자체 계산) 레인은 이동체를 moss(`#a8bd74`)로 칠해 나머지와 구분한다.
- 카메라 고정: `position.set(-6, 7.5, 16)`, `lookAt(0, 0.5, 0)`.
- `settle()`: 이동체를 x = 8에 두고 꼬리를 한 번 계산한 상태로 고정한다.

**오버레이:** 레인 라벨은 화면 좌측에 고정 배치한다(project 대신 레인 z를 화면 y로 투영). 두 줄(`L.travel[id]`, `${gPerPkm} g`). 라벨이 7줄이므로 `text-[10.5px]`.

**VizFrame props:** `title={L.travelTitle}`, `caption={L.travelCaption}`, `sourceName={travel.source.name}`, `sourceUrl={travel.source.url}`, `aspect="16 / 9"`, fallback rows는 `travel.items`(`L.gPerKm` 단위).

- [ ] **Step 1: 컴포넌트 작성**
- [ ] **Step 2: 타입·린트**
- [ ] **Step 3: 커밋** `feat(viz): TravelLanes 장면 추가`

---

### Task 5: EmbodiedGoods (V4)

**Files:** Create `components/viz/EmbodiedGoods.tsx`

**Consumes:** `goods`, `CO2_M3_PER_KG`, `t`, `Lang`; `useThreeScene`, `VizFrame`; `makePoints`, `disposePoints` from `./three-utils`.

**Produces:** `export default function EmbodiedGoods({ lang }: { lang: Lang })`

**장면:** 물건은 실제 크기 비율로 바닥에 놓고, 그 위에 배출을 입자 구름으로 띄운다. **물건의 크기와 구름의 크기가 전혀 비례하지 않는 것**이 이 장면의 전부다.

- 물건 실물 크기(m, 대략치로 충분하다): laptop `0.34 x 0.02 x 0.24`, phone `0.075 x 0.008 x 0.15`, jeans `0.4 x 0.03 x 0.5`, shoes `0.29 x 0.11 x 0.11`, tshirt `0.45 x 0.01 x 0.6`. 전부 흰색(`#f4efe4`) 박스로 단순화한다. x 간격 `2.6`.
- 구름: 물건마다 두 덩어리. 제조·수송은 amber, 사용은 moss. 각 덩어리의 반지름 = `Math.cbrt(부분 kg * CO2_M3_PER_KG) / 2`, 입자 수 = `Math.round(부분 kg * 6)`. `makePoints`로 만들고 물건 위 `y = 0.6 + r`에 배치한다. `usePct === 0`인 운동화는 moss 덩어리를 만들지 않는다.
- 구름은 천천히 회전(`rotation.y += dt * 0.00012`)하고 `sin`으로 아주 약하게 오르내린다(진폭 0.05).
- 카메라: 왼쪽 노트북에서 오른쪽 티셔츠까지 왕복 패닝(FoodMasses와 같은 `sin` 방식, 주기는 더 느리게 `ts * 0.00005`). 거리 고정 `dist = 7.5`, 높이 `3.2`.
- `settle()`: 패닝 중앙 프레임으로 고정.

**오버레이:** 물건마다 라벨 세 줄: 이름(`L.goods[id]`), `${totalKg} ${L.kg}`, 그리고 `${L.make} ${makePct}% · ${L.use} ${usePct}%`. 세 번째 줄은 `opacity-70`. 우상단에 범례를 고정한다(amber 점 + `L.make`, moss 점 + `L.use`).

**VizFrame props:** `title={L.goodsTitle}`, `caption={L.goodsCaption}`, `sourceLabel={L.source}`, `sourceName`은 `goods`의 출처 이름을 `' · '`로 이은 문자열, `aspect="16 / 9"`, fallback rows는 `goods`(값은 `${totalKg} ${L.kg}`).

- [ ] **Step 1: 컴포넌트 작성**
- [ ] **Step 2: 타입·린트**
- [ ] **Step 3: 커밋** `feat(viz): EmbodiedGoods 장면 추가`

---

### Task 6: GridTiles (V5)

**Files:** Create `components/viz/GridTiles.tsx`

**Consumes:** `grid`, `HOUSEHOLD_KWH_PER_YEAR`, `t`, `Lang`; `useThreeScene`, `VizFrame`.

**Produces:** `export default function GridTiles({ lang }: { lang: Lang })`

**장면:** 바닥에 깔린 kWh 타일 격자는 그대로 두고, 나라만 바뀌면 그 위의 배출 기둥만 오르내린다.

- 타일: `36 x 25 = 900`개 격자(1타일 = 4 kWh, 합계 3,600 kWh). `InstancedMesh`로 `PlaneGeometry(0.9, 0.9)`를 바닥에 눕혀 배치한다. 색은 `#3a2413`, 격자 사이 간격 0.1.
- 기둥: 격자 중앙 위에 반투명 amber 박스 하나. 밑면은 격자 전체를 덮고(`33 x 23`), 높이 = `(gPerKwh / 442.94) * 14`. 나라가 바뀌면 높이가 **900ms 동안 ease-in-out으로** 변한다.
- 나라 순환: 4초마다 다음 나라로. `korea → usa → uk → france → korea`.
- 카메라 고정: `position.set(16, 11, 22)`, `lookAt(0, 4, 0)`. 아주 느린 궤도(`ts * 0.00003`)로 좌우 3도만 흔들린다.
- `settle()`: 첫 나라(korea)의 최종 높이로 고정한다.

**오버레이:** 중앙 상단에 현재 나라 이름(`L.gridCountry[id]`, 24px), 그 아래 `${gPerKwh} g/kWh`, 그 아래 큰 숫자로 연간 배출 `Math.round(gPerKwh * HOUSEHOLD_KWH_PER_YEAR / 1000)` kg. 나라가 바뀔 때 숫자도 같이 보간한다. 하단에 `L.gridUsage` 고정.

**VizFrame props:** `title={L.gridTitle}`, `caption={L.gridCaption}`, `sourceName={grid.source.name}`, `sourceUrl={grid.source.url}`, `aspect="16 / 9"`, fallback rows는 4개국(값은 `${Math.round(...)} ${L.kg}`).

- [ ] **Step 1: 컴포넌트 작성**
- [ ] **Step 2: 타입·린트**
- [ ] **Step 3: 커밋** `feat(viz): GridTiles 장면 추가`

---

### Task 7: 등록과 허브 연동

**Files:** Modify `components/MDXComponents.tsx`, `data/climateData.ts`

- [ ] **Step 1:** `MDXComponents.tsx`에 5개 장면을 1편 장면들과 같은 방식으로 등록한다.
- [ ] **Step 2:** `data/climateData.ts`의 `series.items` 2번 항목(en/ko 양쪽)에 `slug: '2026-09-12-carbon-basics-daily-life'`를 추가한다.
- [ ] **Step 3:** `yarn lint`, `npx tsc --noEmit`.
- [ ] **Step 4: 커밋** `feat(climate): 2편 장면 등록 및 시리즈 연결`

---

### Task 8: 포스트 작성과 검증

**Files:** Create `data/posts/2026-09-12-carbon-basics-daily-life.mdx`, `data/posts/2026-09-12-carbon-basics-daily-life.en.mdx`

본문 구성과 문장은 승인된 초안(아티팩트)과 `docs/superpowers/specs/2026-09-09-carbon-basics-2-design.md`를 따른다.

- [ ] **Step 1:** 한국어 본문 작성(경어체, em-dash 금지). 프론트매터는 스펙의 "파일·메타" 그대로.
- [ ] **Step 2:** **`humanize-korean` 스킬을 한 번 적용**한다(사용자 지시). 결과에서 수치·출처·주장이 바뀌지 않았는지 확인한다.
- [ ] **Step 3:** humanize를 거친 한국어 확정본을 기준으로 영어판을 작성한다. 기계번역투 금지.
- [ ] **Step 4:** "출처와 수치 검증" 절에 하루 시나리오의 계산식과 가정, 한국 전력 계수가 두 개인 이유, 제외한 항목(택배, 자전거)을 모두 적는다.
- [ ] **Step 5:** `yarn build`. contentlayer가 KB에 자동 등록하므로 `app/kb-data.json`은 손대지 않는다.
- [ ] **Step 6:** 라이브 확인. `yarn dev` 후 KO/EN 양쪽에서 캔버스 5개 렌더, 콘솔 에러 0, 375px 폭에서 가로 스크롤 없음.
- [ ] **Step 7: 커밋** `post: 탄소 기초 2편 추가 (KO+EN)`
