# KB Graph View 설계

- 날짜: 2026-09-06
- 상태: 승인 대기
- 미리보기: https://claude.ai/code/artifact/82306cba-64d9-4752-8c4f-b2457f8e042f (실제 데이터로 만든 목업)
- 진행 방식: 설계·플랜·리뷰는 Fable, 태스크별 구현은 sonnet 서브에이전트

## 1. 배경과 목표

`/kb`는 100개 노트(ko/en 쌍)를 가진 지식 베이스입니다. 생성기가 본문의 위키링크와 `/kb/`, `/posts/` 링크를 긁어 정방향·역방향 링크를 이미 만들고 있지만, 전체 구조를 보는 화면이 없습니다.

이 기능의 주 사용자는 **작성자 본인**입니다. 목표는 세 가지입니다.

1. 노트 전체의 연결 구조를 한 화면에서 본다.
2. 고립 노트와 허브를 바로 찾는다.
3. 어떤 노트에 어떤 링크를 이어붙일지 결정한다.

v1에서 **하지 않는 것**: 노드 드래그, 노트별 로컬 그래프, 3D, 모바일 핀치줌, 방문자용 쇼케이스 다듬기.

## 2. 현재 데이터가 말해주는 것

| 항목                                           | 값  |
| ---------------------------------------------- | --- |
| 고유 노트                                      | 100 |
| 명시 링크 엣지                                 | 171 |
| 링크로 연결된 노트                             | 52  |
| 고립 노트 (링크 0)                             | 48  |
| 태그 노드(3개 이상 노트) 추가 후에도 완전 고립 | 19  |

- 연결된 노트는 AI Infrastructure(33개 중 30개)와 LLM Research(19개 전부)에 몰려 있습니다. LLM Research의 허브는 MOC 글입니다.
- 고립 48개는 전부 AI 이전 글입니다. Dev Life, Web Frontend, Backend, Algorithms, DevOps & Cloud는 연결이 0개입니다.
- 그래서 링크만으로 그래프를 그리면 절반이 떠다닙니다. 태그 노드를 약한 구조로 넣고, 그래도 남는 고립 노트는 숨기지 않고 패널에 드러냅니다. 그것이 작성자 도구의 핵심 정보이기 때문입니다.

### 2.1 선행 수정: ko/en 중복

`generate-kb-data.mjs`는 `allDocuments`를 언어 구분 없이 처리합니다. 같은 slug가 postIndex에 두 번 들어가서 KB가 200 notes로 표시되고, 토픽 카운트가 두 배이며, `/kb` 콘솔에 React key 중복 에러가 100개 찍힙니다. 그래프에서는 노드가 전부 두 개씩 보이게 되므로 이 수정이 첫 태스크입니다.

## 3. 데이터 계층 — `scripts/generate-kb-data.mjs`

### 3.1 구조

- `buildKBData(allDocuments)`: 순수 함수. 입력을 받아 `KBData` 객체를 반환합니다. 파일을 쓰지 않습니다.
- `generateKBData(allDocuments)`: `buildKBData`를 호출해 `app/kb-data.json`에 씁니다. contentlayer `onSuccess`에서 지금처럼 호출합니다.
- 상수는 export 합니다: `TAG_NODE_MIN_NOTES = 3`, `TAG_BLOCKLIST = ['post', 'develop']`, `SHORT_TITLE_MAX = 32`.

### 3.2 로케일 중복 제거

- slug당 정본(canonical) 하나를 고릅니다. **영어판이 있으면 영어판, 없으면 한국어판.** `createTagCount`, `createSearchIndex`가 쓰는 규칙과 같습니다.
- 링크 스캔은 **두 언어 본문 모두**에서 하고 slug 단위로 합집합을 냅니다. 한쪽 본문에만 링크가 있어도 엣지가 생깁니다.
- 결과: `postIndex`는 slug당 1개, `topics[].slugs`와 `count`도 중복 없이.

### 3.3 shortTitle

그래프 라벨용 짧은 제목입니다. 우선순위는 다음과 같습니다.

1. 정본 문서의 frontmatter `shortTitle`이 있으면 그대로. 정본에 없고 다른 언어판에 있으면 그것을 씁니다. (32자 초과 시 3번 규칙으로 자름.)
2. 없으면 제목에서 파생합니다.
   - 구분자에서 나눕니다: `: `, `： `, `—`, `–`, `-`, `/`, 그리고 `?` 뒤의 공백.
   - 앞부분(head)을 씁니다. 단, head가 **다른 정본 노트의 head와 겹치거나** 6자 미만이면 뒷부분(tail)을 씁니다.
     - 예: "Transformer Basics: Q, K, V Intuition"은 head "Transformer Basics"가 3개 노트에서 겹치므로 "Q, K, V Intuition".
     - 예: "TIL: Ruby on Rails …"는 head가 짧아서 tail.
   - 구분자가 없으면 제목 전체.
3. 32자를 넘으면 31자 안에서 마지막 공백 위치(전체의 60% 이후일 때만)에서 자르고 `…`을 붙입니다.

`title`은 그대로 유지합니다. 툴팁과 패널에는 항상 전체 제목을 보여줍니다.

### 3.4 graph 섹션

```ts
graph: {
  tagNodes: {
    id: string
    label: string
    count: number
  }
  ;[] // id = 'tag:' + label
  tagLinks: {
    source: string
    target: string
  }
  ;[] // source = note slug, target = tag id
}
```

- 태그는 소문자로 정규화합니다. 정본 노트 기준으로 `TAG_NODE_MIN_NOTES` 이상에 붙은 태그만 노드가 됩니다. `TAG_BLOCKLIST`는 제외합니다.
- 명시 링크 엣지는 새로 넣지 않습니다. 클라이언트가 `forwardLinks`를 펼쳐서 씁니다(중복 방지).

### 3.5 타입 — `components/kb/types.ts`

```ts
export interface KBPostEntry {
  slug: string
  title: string
  shortTitle: string
  date: string
  topic: string
  stage: string
  tags: string[]
  summary: string
}
export interface KBTagNode {
  id: string
  label: string
  count: number
}
export interface KBTagLink {
  source: string
  target: string
}
export interface KBGraphData {
  tagNodes: KBTagNode[]
  tagLinks: KBTagLink[]
}
export interface KBData {
  topics: KBTopic[]
  backlinks: Record<string, KBBacklink[]>
  forwardLinks: Record<string, string[]>
  postIndex: KBPostEntry[]
  graph: KBGraphData
  generatedAt: string
}
```

### 3.6 테스트 — `scripts/generate-kb-data.test.mjs` (`node --test`)

픽스처는 contentlayer 문서 모양의 작은 객체 배열입니다(`type`, `draft`, `slug`, `language`, `title`, `shortTitle`, `tags`, `topic`, `stage`, `date`, `summary`, `body.raw`). 케이스:

- ko/en 쌍이 slug당 1개로 합쳐지고 영어판이 정본이다. 영어판이 없으면 한국어판이다.
- 한국어 본문에만 있는 링크도 forwardLinks/backlinks에 들어간다. 자기 자신 링크와 중복은 제외된다.
- draft는 제외된다.
- shortTitle: frontmatter 우선, head 규칙, 중복 head → tail, 짧은 head → tail, 구분자 없음, 32자 클리핑.
- tagNodes: 임계값 미만 태그 제외, 블록리스트 제외, 소문자 정규화, count가 정본 기준이다.
- tagLinks가 tagNodes에 있는 태그만 가리킨다.

## 4. 그래프 모델 — `components/kb/graph/graphModel.ts`

순수 TypeScript 모듈입니다. React를 import하지 않고, 경로 별칭(`@/`) 대신 상대 경로만 씁니다. Node 24의 타입 스트리핑으로 `node --test`에서 바로 실행되도록 enum·namespace 등 지워지지 않는 문법은 쓰지 않습니다.

```ts
export interface GraphNode {
  id: string
  kind: 'note' | 'tag'
  label: string
  topic?: string
  stage?: string
  date?: string
  inDegree: number
  outDegree: number
  degree: number // 명시 링크 기준. tag 노드는 count를 degree에
  radius: number
}
export interface GraphLink {
  source: string
  target: string
  kind: 'link' | 'tag'
}
export interface GraphFilters {
  topics: Set<string>
  stage: 'all' | 'seedling' | 'budding' | 'evergreen'
  tags: boolean
}

export function buildGraph(
  data: KBData,
  filters: GraphFilters
): { nodes: GraphNode[]; links: GraphLink[] }
export function neighbourIds(links: GraphLink[], id: string): Set<string>
export function orphanIds(data: KBData): string[] // inDegree + outDegree === 0
export function isolatedIds(data: KBData): string[] // orphan이면서 tag 노드 멤버도 아님
export function hubIds(data: KBData, n = 8): string[] // backlinks 수 내림차순, 동률이면 degree
export function relatedUnlinked(
  data: KBData,
  slug: string,
  opts = { minShared: 2, limit: 5 }
): { slug: string; title: string; sharedTags: string[] }[] // 양방향 링크 없음, 공유 태그 수 내림차순, 날짜 내림차순
export function labelTier(
  node: GraphNode,
  k: number,
  forced: boolean,
  hubs: Set<string>
): 0 | 1 | 2 | 3 | null
export function placeLabels(
  candidates: {
    id: string
    tier: number
    priority: number
    x: number
    y: number
    radius: number
    text: string
  }[],
  k: number
): Set<string>
export function nodeRadius(node: { kind: 'note' | 'tag'; degree: number }): number
```

- `nodeRadius`: note는 `min(14, 3.5 + 1.5·√degree)`, tag는 `min(7, 2.5 + 0.3·count)`.
- `labelTier`: forced(호버·선택 이웃, 검색 일치) → 0. 허브 8개와 count ≥ 5인 태그 → 1. `k ≥ 2.2` → 3(전부). `k ≥ 1.3`이고 note degree ≥ 2 또는 tag count ≥ 3 → 2. 아니면 null(표시 안 함).
- `placeLabels`: tier 오름차순, priority(degree) 내림차순으로 정렬해 탐욕적으로 배치합니다. 라벨 박스는 노드 오른쪽(`x + radius + 3`)에서 시작하고 폭은 `글자수 × 6.3 / k`, 높이는 `13 / k`입니다. 이미 놓인 박스와 겹치면 건너뜁니다.
- 테스트(`graphModel.test.ts`): degree 계산, 필터(토픽·단계·태그 토글) 적용, orphan/isolated, hubs 정렬, relatedUnlinked(링크 있으면 제외, minShared, limit, 정렬), labelTier 경계값, placeLabels 충돌 시 낮은 우선순위 제외.

## 5. 화면 — `/kb/graph`

### 5.1 라우트와 셸

- `app/kb/graph/page.tsx`는 클라이언트 컴포넌트 `KBGraphView`를 렌더링만 합니다. `KBGraphView`는 기존 `KBSidebar`처럼 `app/kb-data.json`을 직접 import합니다(props로 넘기면 RSC 페이로드에 같은 JSON이 한 번 더 실리므로).
- `KBGraphView`가 `KBShell`을 렌더링합니다. `sidebar`는 기존 `KBSidebar`, `main`은 컨트롤 줄 + SVG, `context`는 `KBGraphPanel`, breadcrumb은 "Graph", 상태바는 `● KB · 100 notes · 9 topics · 52 linked · 48 orphans · Esc to deselect · / to filter · Cmd+K to search`.
- `KBShell` 툴바에 "Graph" 링크를 Explorer 버튼 옆에 추가합니다. `usePathname()`으로 `/kb/graph`일 때 액센트로 강조합니다. `/kb` 레이아웃이 이미 noindex라 그래프 페이지도 검색엔진에서 제외됩니다.

### 5.2 배치 계산

- `d3-force`를 클라이언트에서 `useEffect` 안에 실행합니다. 애니메이션 없이 `simulation.stop()` 후 `tick(300)`으로 정적 배치를 만듭니다. 작성자 도구라 위치가 매번 같은 편이 낫습니다.
- 결정적 배치: 초기 위치는 토픽 앵커 + 시드 PRNG 지터, `simulation.randomSource()`에도 같은 PRNG를 넣습니다.
- 힘: `forceManyBody` 반발, `forceLink` 거리 72(link)/110(tag)·강도 0.05/0.015, `forceCollide(radius + 4)`, `forceX/forceY`로 토픽 앵커 끌기(고립 노트 0.03, 연결 노트 0.005), `forceCenter`. 정확한 수치는 구현 중 조정하되 목업의 모양(두 큰 클러스터 + 토픽별로 모인 고립 노트)을 기준으로 삼습니다.
- 토픽 앵커는 타원(반지름 250×180) 위에 다음 순서로 놓습니다. 관련 토픽이 이웃하도록: ai-infrastructure, llm-research, backend-architecture, backend, devops-cloud, algorithms, software-engineering, uncategorized, dev-life, web-frontend.
- 필터가 바뀌면 다시 계산하되, 남아 있는 노드는 이전 위치에서 시작합니다(안정성).

### 5.3 렌더링

- SVG 하나. `<g>` 세 개(edges, nodes, labels)를 뷰포트 `<g transform>` 안에 둡니다.
- 노드: note는 토픽 색 채움, tag는 `--kb-surface` 채움에 `--kb-graph-edge` 테두리(속 빈 원). 히트 영역은 `max(radius + 6, 10)`.
- 엣지: link는 실선 불투명도 0.55, tag는 점선(`2 3`) 불투명도 0.22. 방향 화살표는 그리지 않습니다(패널에서 방향을 보여줌).
- 상태 클래스: `dim`(불투명도 0.12), `sel`(강한 테두리 + 반투명 링), `hover`, `match`(액센트 테두리). 선택·호버 강조는 **색이 아니라 테두리와 흐림**으로 표현해 토픽 색과 충돌하지 않게 합니다.
- 색 토큰은 `css/tailwind.css`의 `.kb-theme`(다크)와 `:where(.light, .light *) .kb-theme`(라이트) 블록에 추가합니다.

| 토큰              | 토픽                                       | 다크      | 라이트    |
| ----------------- | ------------------------------------------ | --------- | --------- |
| `--kb-topic-1`    | ai-infrastructure                          | `#3987e5` | `#2a78d6` |
| `--kb-topic-2`    | llm-research                               | `#d95926` | `#eb6834` |
| `--kb-topic-3`    | dev-life                                   | `#199e70` | `#1baf7a` |
| `--kb-topic-4`    | web-frontend                               | `#c98500` | `#eda100` |
| `--kb-topic-5`    | backend                                    | `#d55181` | `#e87ba4` |
| `--kb-topic-6`    | algorithms                                 | `#008300` | `#008300` |
| `--kb-topic-7`    | backend-architecture                       | `#9085e9` | `#4a3aa7` |
| `--kb-topic-8`    | devops-cloud                               | `#e66767` | `#e34948` |
| `--kb-topic-0`    | software-engineering, uncategorized, 그 외 | `#6b7186` | `#8a8a8a` |
| `--kb-graph-edge` | 엣지·태그 테두리                           | `#7c8296` | `#5a5751` |

이 8색은 KB 다크(`#0a0e1a`)·라이트(`#f8f7f4`) 배경에서 색각 이상 분리도와 대비를 검증기로 확인해 통과한 팔레트입니다. 라이트 배경에서 대비 3:1 미만인 색이 4개 있어서, 툴팁·칩·패널 목록이 색을 보조합니다. 매핑은 `components/kb/graph/topicColors.ts`의 `TOPIC_SLOT` 상수 하나에서 관리합니다. 새 토픽이 생기면 슬롯 0(회색)으로 갑니다.

### 5.4 상호작용

- 호버: 노드와 이웃만 남기고 나머지 `dim`. 툴팁에 전체 제목, 토픽, 단계, 날짜, `↓in ↑out`, 고립이면 `orphan`.
- 클릭: 선택 → 패널이 노트 모드. 같은 노드 재클릭 또는 배경 클릭·Esc → 해제.
- 휠: 커서 기준 줌, 배율 `[0.25, 4]`. 드래그: 팬. 우하단에 `+`, `−`, fit 버튼.
- 패널·사이드바에서 노트를 클릭하면 배율 2로 그 노드를 화면 중앙에 놓고 선택합니다.

### 5.5 라벨

- 텍스트는 `shortTitle`, 태그는 `#name`.
- 화면 기준 크기 고정: SVG 루트에 CSS 변수 `--kb-graph-k`를 두고 `font-size: calc(10px / var(--kb-graph-k))`, 외곽선 `stroke-width: calc(3px / var(--kb-graph-k))`. 줌하면 노드 간격만 벌어지고 글자는 커지지 않습니다.
- 표시 여부는 `labelTier` + `placeLabels`로 결정하고, 줌 배율이 바뀌거나 호버·선택·검색이 바뀔 때 다시 계산합니다.

### 5.6 컨트롤 줄

- 검색: `/`로 포커스(`⌘K`는 기존 KB 검색 팔레트가 씁니다). `title`, `shortTitle`, slug, 태그에 부분 일치. 일치 노드에 액센트 테두리, 나머지 `dim`. Esc로 비움.
- 토픽 칩: 다중 선택. 색 점 + 라벨 + 수. 아무것도 안 고르면 전체. 범례 역할을 겸합니다.
- 단계: `All · 🌱 Seedling · 🌿 Budding`(evergreen이 생기면 자동 추가).
- Tags 스위치: 태그 노드와 태그 엣지 표시/숨김. 끄면 재배치.
- 우측 끝 범례: 실선 link, 점선 shared tag, 속 빈 원 tag node.
- 목업의 Short/Slug/Full 토글은 비교용이었으므로 제품에는 넣지 않습니다.

### 5.7 컨텍스트 패널 — `KBGraphPanel`

**Overview 모드**(기본)

- 통계 4칸: notes, explicit links, linked notes, orphans(액센트 색, "n fully isolated" 부제).
- Hubs: 역링크 상위 8개. 행마다 역링크 수에 비례한 막대와 `↓n`.
- Orphans: 토픽별 묶음, 날짜 내림차순. 완전 고립은 `isolated` 뱃지. 행 클릭 → 포커스.
- 필터가 걸려 있으면 통계와 고립 목록은 필터 범위 기준이고 제목에 `· filtered`를 붙입니다.

**Note 모드**(노트 선택 시)

- `← Overview`, 제목(serif), 메타(토픽 점·라벨, 단계, 날짜, `↓in ↑out`), 요약 3줄, `Open note ↗`(`/kb/<slug>`).
- Backlinks (n), Links to (n), **Related, not linked (n)**: 공유 태그 2개 이상이고 양방향 링크가 없는 노트 상위 5개. 행에 공유 태그 최대 2개 표시. 없으면 안내 문구.
- Tags.

**Tag 모드**(태그 노드 선택 시): `#name`, 노트 수, 그중 고립 수, 멤버 목록(고립은 뱃지).

패널 행에 호버하면 그래프에서 해당 노드를 강조합니다.

### 5.8 상태 공유

`KBGraphView`(클라이언트)가 상태를 소유합니다: 필터, 검색어, hover, selected, view(k, x, y). React context `KBGraphContext`로 컨트롤·SVG·패널에 내려줍니다. 사이드바(`KBSidebar`)는 그래프 페이지에서만 `onSelect` 콜백을 받아 노트 클릭 시 페이지 이동 대신 포커스를 호출합니다(prop이 없으면 기존처럼 링크).

### 5.9 모바일과 빈 상태

- `KBShell`의 기존 오버레이 동작을 그대로 씁니다. 터치 드래그 팬은 동작하고 핀치줌은 v1 범위 밖입니다.
- 필터 결과가 0개면 SVG 위에 "No notes match the current filters." 안내를 띄웁니다.

## 6. 노트 페이지 보강 — `KBContextPanel`

- "Links To" 다음, "Properties" 앞에 **Related, not linked (n)** 섹션을 추가합니다. `relatedUnlinked(data, slug)` 결과를 행으로 보여주고, 각 행에 공유 태그 최대 2개를 표시합니다. 없으면 "No unlinked note shares 2+ tags."
- 목적: 글을 열었을 때 "이 글에 링크 걸 만한 글"이 바로 보이게.
- 사이드바·목록·상태바의 노트 수와 토픽 수는 중복 제거로 자동으로 맞아집니다.

## 7. 콘텐츠 규칙 변경

- `contentlayer.config.ts` Blog fields에 `shortTitle: { type: 'string' }`(선택) 추가.
- `CLAUDE.md`의 선택 필드 목록에 `shortTitle` 추가: 그래프 라벨용, 32자 이내, 정본(영어판 우선)에 적으면 됨.
- 기존 글에는 일괄로 넣지 않습니다. 자동 규칙이 어색한 글만 나중에 개별 추가합니다.

## 8. 의존성과 설정

- 추가: `d3-force`(^3), `@types/d3-force`. `d3-zoom`, `d3-selection`은 쓰지 않고 팬·줌은 포인터 이벤트로 직접 구현합니다.
- `package.json`에 `"test": "node --test 'scripts/**/*.test.mjs' 'components/kb/graph/**/*.test.ts'"` 추가.
- three.js는 이미 deps에 있지만 쓰지 않습니다.

## 9. 파일 목록

```
scripts/generate-kb-data.mjs            수정: buildKBData 분리, 중복 제거, shortTitle, graph
scripts/generate-kb-data.test.mjs       신규
components/kb/types.ts                  수정: shortTitle, graph 타입
components/kb/graph/graphModel.ts       신규: 순수 모델
components/kb/graph/graphModel.test.ts  신규
components/kb/graph/topicColors.ts      신규: TOPIC_SLOT, 토픽 라벨
components/kb/graph/KBGraphView.tsx     신규: 상태 소유, KBShell 조립
components/kb/graph/KBGraphControls.tsx 신규
components/kb/graph/KBGraphSvg.tsx      신규: 배치 + SVG + 상호작용
components/kb/graph/KBGraphPanel.tsx    신규
components/kb/KBShell.tsx               수정: Graph 링크
components/kb/KBSidebar.tsx             수정: onSelect prop
components/kb/KBContextPanel.tsx        수정: Related, not linked
app/kb/graph/page.tsx                   신규
css/tailwind.css                        수정: --kb-topic-*, --kb-graph-edge
contentlayer.config.ts                  수정: shortTitle 필드
CLAUDE.md                               수정: shortTitle 안내
package.json                            수정: d3-force, test 스크립트
```

## 10. 검증

- `yarn test` 통과(생성기·모델 단위 테스트).
- `yarn lint`, `yarn build` 통과.
- `/kb` 콘솔에 React key 에러 0개, 상태바 100 notes.
- Playwright 스크린샷: `/kb/graph` 다크·라이트(데스크톱 1400px), 모바일 390px, 노트 하나 선택한 상태, `/kb/<slug>` 노트 페이지의 Related 섹션.
- 목업과 비교해 두 클러스터와 토픽별 고립 노트 묶음이 보이는지 확인.

## 11. 확정된 가정

- 정본은 영어판 우선(기존 태그 카운트·검색 인덱스 규칙과 동일). 그래서 그래프 라벨은 영어입니다.
- 태그 노드 기준은 3개 이상, `post`·`develop` 제외.
- 기본 라벨은 shortTitle(파생 + frontmatter 오버라이드).
