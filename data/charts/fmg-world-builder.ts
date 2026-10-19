// data/charts/fmg-world-builder.ts
// FmgWorldBuilder의 문구. 알고리즘 자체는 components/viz/FmgWorldBuilder.tsx에 있다.
// 참고: Azgaar/Fantasy-Map-Generator의 src/generators/*.ts (단순화한 재구현)

export type Lang = 'en' | 'ko'

export type StageId = 'points' | 'voronoi' | 'heightmap' | 'coast' | 'rivers' | 'states'

export const STAGE_ORDER: StageId[] = [
  'points',
  'voronoi',
  'heightmap',
  'coast',
  'rivers',
  'states',
]

export const DEFAULT_SEED = '2026'

interface StageText {
  label: string
  /** 캔버스 aria-label용 한 줄 설명 */
  alt: string
  body: string
  source: string
}

interface Strings {
  title: string
  caption: string
  group: string
  seed: string
  newSeed: string
  play: string
  pause: string
  replay: string
  scrub: string
  stageAnnounce: (n: number, label: string) => string
  stats: (cells: number, landPct: number, rivers: number, states: number, ms: number) => string
  readout: (done: number, total: number, cost: number) => string
  stages: Record<StageId, StageText>
}

export const t: Record<Lang, Strings> = {
  ko: {
    title: '미니 FMG: 같은 알고리즘으로 작은 세계 만들기',
    caption:
      'Azgaar의 Fantasy Map Generator 파이프라인을 단순화해 다시 구현한 것입니다. 셀은 약 1,400개로, 실제 FMG의 기본값 1만 개보다 훨씬 적습니다. 같은 시드는 언제나 같은 세계를 만듭니다.',
    group: '생성 단계',
    seed: '시드',
    newSeed: '새 시드',
    play: '재생',
    pause: '일시정지',
    replay: '다시 재생',
    scrub: '영토 확장 진행도',
    stageAnnounce: (n, label) => `${n}단계: ${label}`,
    stats: (cells, landPct, rivers, states, ms) =>
      `셀 ${cells}개 · 육지 ${landPct}% · 강 ${rivers}줄기 · 국가 ${states}개 · 생성 ${ms}ms`,
    readout: (done, total, cost) => `확정된 셀 ${done} / ${total} · 다익스트라 비용 ≤ ${cost}`,
    stages: {
      points: {
        label: '점 뿌리기',
        alt: '정사각형 격자 칸마다 하나씩, 칸 안에서 조금씩 어긋난 점들',
        body: 'FMG는 먼저 캔버스를 정사각형 격자로 나누고, 각 칸 중심에서 칸 폭의 90퍼센트 범위 안으로 점을 무작위로 흔듭니다. 격자의 규칙성은 깨뜨리되 점끼리 너무 가까워지지는 않게 하는 방법입니다. 주황색 짧은 선이 칸 중심에서 실제 점까지 밀린 거리입니다.',
        source: 'src/generators/grid-generator.ts',
      },
      voronoi: {
        label: '보로노이 셀',
        alt: '점마다 가장 가까운 영역으로 나뉜 보로노이 셀의 경계선',
        body: '점들로 보로노이 다이어그램을 만들면 각 점은 자기와 가장 가까운 영역을 차지하는 셀이 됩니다. FMG는 Delaunay 삼각분할에서 정확한 다각형을 얻지만, 이 데모는 저해상도 래스터에서 가장 가까운 점을 찾는 방식으로 같은 경계와 이웃 관계를 만듭니다. 이 이웃 정보가 이후 모든 단계에서 쓰는 그래프가 됩니다.',
        source: 'src/generators/voronoi.ts',
      },
      heightmap: {
        label: '높이 지도',
        alt: '셀마다 0에서 100 사이 높이를 색으로 나타낸 지도',
        body: '높이는 0에서 100 사이이고 20 미만이면 바다입니다. 템플릿은 addHill, addRange, smooth, addPit, mask 같은 명령을 차례로 실행합니다. 언덕은 시작 셀에서 이웃으로 너비 우선 탐색을 하며 높이를 거듭제곱으로 깎아 퍼뜨리고, 산맥은 두 지점 사이를 이어 걷는 능선에서 양옆으로 퍼집니다.',
        source: 'src/generators/heightmap-generator.ts',
      },
      coast: {
        label: '해안선',
        alt: '육지와 바다를 가르고 해안에서의 거리에 따라 바다를 세 단계로 칠한 지도',
        body: '높이 20을 기준으로 육지와 바다를 가르고, 이어진 셀끼리 묶어 대륙과 섬 같은 지형 단위를 찾습니다. 육지와 맞닿은 물 셀에는 거리 -1, 그다음에는 -2처럼 해안에서의 거리를 매겨 얕은 바다 띠를 그립니다. 육지 쪽에서는 물과 맞닿은 셀이 해안 셀이 됩니다.',
        source: 'src/generators/features-generator.ts',
      },
      rivers: {
        label: '강',
        alt: '높이 지도 위에 높은 곳에서 바다로 흐르는 강줄기가 그려진 지도',
        body: '셀마다 강수량을 정하고, 움푹 팬 곳은 먼저 메워서 물이 반드시 바다로 빠져나가게 만듭니다. 그다음 높은 셀부터 가장 낮은 이웃으로 물의 양을 흘려보내고, 양이 문턱을 넘는 경로가 강이 됩니다. 지류가 합쳐질수록 물의 양이 늘어 선이 굵어집니다.',
        source: 'src/generators/river-generator.ts',
      },
      states: {
        label: '국가 확장',
        alt: '수도에서 시작해 비용이 낮은 셀부터 차례로 영토가 퍼지는 지도',
        body: '수도를 서로 떨어뜨려 놓고 모든 수도에서 동시에 다익스트라 탐색을 시작합니다. 산과 강은 이동 비용이 커서 확장을 늦추고, 확장성이 높은 국가일수록 같은 비용으로 더 멀리 퍼집니다. 비용이 낮은 셀부터 주인이 정해지므로 영토는 자연스러운 경계에서 만납니다. 막대를 끌어 확장 순서를 되감아 볼 수 있습니다.',
        source: 'src/generators/states-generator.ts',
      },
    },
  },
  en: {
    title: 'Mini FMG: building a tiny world with the same algorithms',
    caption:
      "A simplified re-implementation of the Azgaar's Fantasy Map Generator pipeline. It uses about 1,400 cells, far fewer than the 10,000 of real FMG's default. The same seed always gives the same world.",
    group: 'Generation stages',
    seed: 'Seed',
    newSeed: 'New seed',
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    scrub: 'State expansion progress',
    stageAnnounce: (n, label) => `Stage ${n}: ${label}`,
    stats: (cells, landPct, rivers, states, ms) =>
      `${cells} cells · ${landPct}% land · ${rivers} rivers · ${states} states · generated in ${ms} ms`,
    readout: (done, total, cost) => `assigned cells ${done} / ${total} · Dijkstra cost ≤ ${cost}`,
    stages: {
      points: {
        label: 'Points',
        alt: 'One point per square grid cell, each nudged a little inside its square',
        body: 'FMG first splits the canvas into a square grid, then shifts one point per square randomly, within 90 percent of the square width around its centre. That breaks the regularity of the grid without letting points crowd each other. The short orange line shows how far each point moved from its square centre.',
        source: 'src/generators/grid-generator.ts',
      },
      voronoi: {
        label: 'Voronoi',
        alt: 'Voronoi cell borders, each cell being the area closest to its point',
        body: 'A Voronoi diagram turns every point into a cell: the region closer to it than to any other point. FMG gets exact polygons from a Delaunay triangulation, while this demo finds the nearest point on a low-resolution raster to produce the same borders and neighbour lists. That neighbour graph is what every later stage walks.',
        source: 'src/generators/voronoi.ts',
      },
      heightmap: {
        label: 'Heightmap',
        alt: 'A map with each cell coloured by its height from 0 to 100',
        body: 'Heights run from 0 to 100, and anything below 20 is sea. A template runs commands such as addHill, addRange, smooth, addPit and mask in order. A hill spreads by breadth-first search from its start cell, shrinking the height by a power each step, and a range walks a ridge between two points and spreads sideways from it.',
        source: 'src/generators/heightmap-generator.ts',
      },
      coast: {
        label: 'Coastline',
        alt: 'Land and sea separated, with the sea painted in three bands by distance from the coast',
        body: 'Height 20 splits land from water, and connected cells are grouped into features such as continents and islands. Water cells touching land get distance -1, the next ring -2, and so on, which gives the shallow-water bands. On the land side, any cell with a water neighbour is a coast cell.',
        source: 'src/generators/features-generator.ts',
      },
      rivers: {
        label: 'Rivers',
        alt: 'A heightmap with rivers flowing from high ground to the sea',
        body: 'Each cell gets some precipitation, and pits are filled first so water can always reach the sea. Then, from the highest cell down, the water amount (flux) is passed to the lowest neighbour, and paths whose flux passes a threshold become rivers. Where tributaries merge the flux grows, so the line gets thicker.',
        source: 'src/generators/river-generator.ts',
      },
      states: {
        label: 'States',
        alt: 'States spreading from their capitals, cheapest cells first',
        body: 'Capitals are placed far apart, and a Dijkstra search starts from all of them at once. Mountains and rivers cost more to cross, which slows expansion, and a more expansionist state reaches farther for the same cost. Cells are claimed in order of cost, so territories meet at natural borders. Drag the bar to rewind the order of expansion.',
        source: 'src/generators/states-generator.ts',
      },
    },
  },
}
