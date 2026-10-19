// data/charts/fmg-pipeline.ts
// FmgPipeline의 문구와 데이터.
//
// 출처: Azgaar/Fantasy-Map-Generator b4a0dcb (v1.154.2), src/generators/generation-pipeline.ts
// 시간: 같은 커밋을 로컬 vite dev 서버로 띄우고 시드 2026, 1600×900, 10,000 포인트로 3회 생성한 중앙값.
//       파이프라인 러너가 남기는 performance.measure를 읽었습니다(Apple M5 Pro, Playwright 1.60 headless Chromium).

export type Lang = 'en' | 'ko'

export type GroupId = 'graph' | 'land' | 'climate' | 'society' | 'economy' | 'overlay'

export const GROUP_COLORS: Record<GroupId, string> = {
  graph: '#7a8794',
  land: '#3f8f6b',
  climate: '#d08a2c',
  society: '#b5536b',
  economy: '#6b5bb5',
  overlay: '#4f86b0',
}

export const GROUP_ORDER: GroupId[] = ['graph', 'land', 'climate', 'society', 'economy', 'overlay']

export interface Step {
  id: string
  ms: number
}

export interface Phase {
  id: string
  group: GroupId
  steps: Step[]
  /** 이 단계가 쓰는 전역 상태(선택) */
  writes: string
  image?: string
}

export const PHASES: Phase[] = [
  {
    id: 'grid',
    group: 'graph',
    steps: [{ id: 'grid', ms: 15.1 }],
    writes: 'grid.points, grid.cells.{v,c,b}',
    image: '/static/images/fmg/cells-zoom.webp',
  },
  {
    id: 'heightmap',
    group: 'land',
    steps: [{ id: 'heightmap', ms: 8.4 }],
    writes: 'grid.cells.h',
    image: '/static/images/fmg/heightmap.webp',
  },
  {
    id: 'hydrology',
    group: 'land',
    steps: [
      { id: 'markupGrid', ms: 2.8 },
      { id: 'depressionLakes', ms: 1 },
      { id: 'nearSeaLakes', ms: 1.2 },
    ],
    writes: 'grid.cells.{f,t}, grid.features',
  },
  {
    id: 'climate',
    group: 'climate',
    steps: [
      { id: 'mapSize', ms: 0 },
      { id: 'temperatures', ms: 0.3 },
      { id: 'precipitation', ms: 1.2 },
    ],
    writes: 'options.map.geography, grid.cells.{temp,prec}',
    image: '/static/images/fmg/temperature.webp',
  },
  {
    id: 'repack',
    group: 'graph',
    steps: [
      { id: 'clearPack', ms: 0 },
      { id: 'clearGraphOverride', ms: 0 },
      { id: 'regraph', ms: 5.9 },
      { id: 'markupPack', ms: 2.8 },
      { id: 'defaultRuler', ms: 0.1 },
    ],
    writes: 'pack.cells.*, pack.features',
    image: '/static/images/fmg/cells-zoom.webp',
  },
  {
    id: 'rivers',
    group: 'land',
    steps: [
      { id: 'rivers', ms: 11.6 },
      { id: 'biomes', ms: 0.9 },
      { id: 'featureGroups', ms: 0.1 },
      { id: 'ice', ms: 0.8 },
    ],
    writes: 'pack.rivers, cells.{r,fl,conf,biome}, pack.ice',
    image: '/static/images/fmg/biomes.webp',
  },
  {
    id: 'ranking',
    group: 'society',
    steps: [
      { id: 'goods', ms: 6.8 },
      { id: 'rankCells', ms: 1.2 },
    ],
    writes: 'pack.goods, cells.{good,s,pop}',
  },
  {
    id: 'cultures',
    group: 'society',
    steps: [
      { id: 'cultures', ms: 2.5 },
      { id: 'culturesExpand', ms: 3.1 },
    ],
    writes: 'pack.cultures, cells.culture',
    image: '/static/images/fmg/cultures.webp',
  },
  {
    id: 'politics',
    group: 'society',
    steps: [
      { id: 'burgs', ms: 2.4 },
      { id: 'states', ms: 7.2 },
      { id: 'routes', ms: 31.6 },
      { id: 'religions', ms: 1.5 },
    ],
    writes: 'pack.{burgs,states,routes,religions}',
    image: '/static/images/fmg/states.webp',
  },
  {
    id: 'specify',
    group: 'society',
    steps: [
      { id: 'burgsSpecify', ms: 3.5 },
      { id: 'stateStatistics', ms: 0.2 },
      { id: 'stateForms', ms: 0.1 },
    ],
    writes: 'burg.population/type, state.form',
    image: '/static/images/fmg/detail-zoom.webp',
  },
  {
    id: 'provinces',
    group: 'society',
    steps: [
      { id: 'provinces', ms: 5.9 },
      { id: 'provincePoles', ms: 2 },
    ],
    writes: 'pack.provinces, cells.province',
    image: '/static/images/fmg/provinces.webp',
  },
  {
    id: 'naming',
    group: 'society',
    steps: [
      { id: 'riversSpecify', ms: 0.4 },
      { id: 'featureNames', ms: 0 },
    ],
    writes: 'river.name, feature.name',
  },
  {
    id: 'economy',
    group: 'economy',
    steps: [
      { id: 'markets', ms: 1.8 },
      { id: 'production', ms: 65.5 },
      { id: 'taxes', ms: 0.2 },
    ],
    writes: 'pack.{markets,deals}, cells.market, treasury',
  },
  {
    id: 'overlays',
    group: 'overlay',
    steps: [
      { id: 'military', ms: 9.3 },
      { id: 'markers', ms: 8.5 },
      { id: 'zones', ms: 1.7 },
      { id: 'addedLabels', ms: 0 },
      { id: 'journeys', ms: 4.1 },
    ],
    writes: 'regiments, pack.{markers,zones}, journeys',
  },
]

type PhaseText = { name: string; desc: string }

interface Copy {
  title: string
  caption: string
  group: string
  total: (steps: number, ms: string) => string
  writes: string
  steps: string
  noImage: string
  imageAlt: (name: string) => string
  groups: Record<GroupId, string>
  phases: Record<string, PhaseText>
}

export const t: Record<Lang, Copy> = {
  ko: {
    title: 'FMG 생성 파이프라인',
    caption:
      '막대 하나가 단계 하나이고, 폭은 시드 2026·10,000포인트 지도에서 잰 실행 시간입니다(3회 중앙값). 막대나 단계 이름을 누르면 그 단계가 무엇을 쓰는지와 결과 화면이 보입니다.',
    group: '파이프라인 단계',
    total: (steps, ms) => `${steps}단계 · 합계 ${ms}ms`,
    writes: '쓰는 상태',
    steps: '단계',
    noImage: '이 단계는 따로 보이는 레이어가 없습니다.',
    imageAlt: (name) => `시드 2026 지도에서 '${name}' 단계 결과를 보여 주는 FMG 화면`,
    groups: {
      graph: '그래프',
      land: '지형과 물',
      climate: '기후',
      society: '사람',
      economy: '경제',
      overlay: '부가 요소',
    },
    phases: {
      grid: {
        name: '격자',
        desc: '정사각형 격자 위의 점을 칸 안에서 무작위로 흔들고, Delaunator로 Voronoi 셀을 만듭니다. 이후 모든 단계가 이 셀 위에서 돌아갑니다.',
      },
      heightmap: {
        name: '지형',
        desc: 'Hill, Range, Trough, Mask 같은 명령을 적은 템플릿을 한 줄씩 실행해 셀마다 0~100 높이를 쌓습니다. 20 미만이 바다입니다.',
      },
      hydrology: {
        name: '바다와 호수 표시',
        desc: '육지와 물을 flood fill로 나눠 섬, 바다, 호수를 정하고 해안에서의 거리(1, 2, -1, -2 …)를 매깁니다. 깊은 웅덩이에는 호수를 만듭니다.',
      },
      climate: {
        name: '기후',
        desc: '위도와 고도로 기온을 정하고, 바람이 지도 가장자리에서 들어와 셀을 지나며 습기를 내려놓게 해서 강수량을 정합니다.',
      },
      repack: {
        name: '다시 짜기(pack)',
        desc: '깊은 바다 점을 버리고 해안 셀은 쪼개서 두 번째 Voronoi 그래프를 만듭니다. 이 단계 뒤로는 pack 셀 번호를 씁니다.',
      },
      rivers: {
        name: '강과 바이옴',
        desc: '웅덩이를 메운 뒤 높은 셀부터 물을 아래로 흘려 강을 만들고, 강수량과 기온 표에서 바이옴을 고릅니다.',
      },
      ranking: {
        name: '자원과 살기 좋은 정도',
        desc: '자원(goods)을 셀에 뿌리고, 바이옴·강·해안·고도·자원으로 셀마다 점수를 매겨 시골 인구를 정합니다.',
      },
      cultures: {
        name: '문화',
        desc: '점수가 높은 셀에 문화 중심을 놓고, 우선순위 큐로 비용이 싼 셀부터 넓혀 갑니다. 해양 문화는 바다를 싸게, 유목 문화는 숲을 비싸게 지납니다.',
      },
      politics: {
        name: '도시, 국가, 길, 종교',
        desc: '수도와 마을을 간격을 두고 놓고, 수도마다 국가를 세워 다시 Dijkstra로 넓힙니다. 길은 도시 사이 Urquhart 그래프의 간선을 따라 냅니다.',
      },
      specify: {
        name: '세부 정하기',
        desc: '길이 깔린 뒤에 도시 인구와 성벽·사원 같은 시설, 국가 형태(왕국, 공화국, 신정 …)를 정합니다.',
      },
      provinces: {
        name: '주(province)',
        desc: '국가마다 큰 도시들을 중심으로 국경 안에서만 영역을 나눕니다. 남은 땅은 식민지나 변경 지역이 됩니다.',
      },
      naming: { name: '이름 붙이기', desc: '강, 섬, 바다, 호수에 이름을 붙입니다.' },
      economy: {
        name: '경제',
        desc: '시장을 놓고, 도시마다 레시피로 물건을 만들어 사고팔게 한 뒤 세금을 걷습니다. 1만 포인트 지도에서는 production 한 단계가 전체 시간의 3분의 1 가까이를 씁니다.',
      },
      overlays: {
        name: '군대, 표식, 사건, 여정',
        desc: '국가별 군대, 화산·던전 같은 표식, 반란·역병 같은 구역, 도시를 잇는 이야기 여정을 얹습니다.',
      },
    },
  },
  en: {
    title: 'The FMG generation pipeline',
    caption:
      'Each bar is one step, sized by its run time on the seed 2026 map at 10,000 points (median of three runs). Click a bar or a phase name to see what that phase writes and what it looks like.',
    group: 'Pipeline phases',
    total: (steps, ms) => `${steps} steps · ${ms} ms in total`,
    writes: 'Writes',
    steps: 'Steps',
    noImage: 'This phase has no layer of its own to show.',
    imageAlt: (name) => `FMG screen showing the result of the '${name}' phase on the seed 2026 map`,
    groups: {
      graph: 'Graph',
      land: 'Land and water',
      climate: 'Climate',
      society: 'People',
      economy: 'Economy',
      overlay: 'Extras',
    },
    phases: {
      grid: {
        name: 'Grid',
        desc: 'Points on a square grid are jittered inside their squares, and Delaunator turns them into Voronoi cells. Every later step runs on these cells.',
      },
      heightmap: {
        name: 'Terrain',
        desc: 'A template of commands such as Hill, Range, Trough and Mask runs line by line and piles up a 0 to 100 height per cell. Anything below 20 is sea.',
      },
      hydrology: {
        name: 'Seas and lakes',
        desc: 'A flood fill splits land from water into islands, oceans and lakes and numbers each cell by its distance from the coast (1, 2, -1, -2 …). Deep pits become lakes.',
      },
      climate: {
        name: 'Climate',
        desc: 'Temperature comes from latitude and altitude. Winds enter from the map edges and drop moisture as they cross the cells, which gives precipitation.',
      },
      repack: {
        name: 'Repack',
        desc: 'Deep ocean points are dropped and coastal cells are split to build a second Voronoi graph. From here on, cell ids refer to pack.',
      },
      rivers: {
        name: 'Rivers and biomes',
        desc: 'Depressions are filled, then water flows downhill from the highest cell to form rivers, and a precipitation by temperature table picks the biome.',
      },
      ranking: {
        name: 'Goods and suitability',
        desc: 'Goods are scattered over cells, then each cell is scored from biome, river, coast, elevation and goods, which sets its rural population.',
      },
      cultures: {
        name: 'Cultures',
        desc: 'Culture centres go on high-scoring cells and spread through a priority queue, cheapest cell first. Naval cultures cross the sea cheaply, nomads pay extra for forest.',
      },
      politics: {
        name: 'Burgs, states, routes, religions',
        desc: 'Capitals and towns are placed with spacing, each capital founds a state that spreads with Dijkstra again, and roads follow the edges of an Urquhart graph between burgs.',
      },
      specify: {
        name: 'Details',
        desc: 'Only after the roads exist are burg populations, walls and temples, and state forms (kingdom, republic, theocracy …) decided.',
      },
      provinces: {
        name: 'Provinces',
        desc: 'Each state is split around its largest burgs without crossing its borders. Leftover land becomes colonies or frontier territories.',
      },
      naming: { name: 'Naming', desc: 'Rivers, islands, oceans and lakes get their names.' },
      economy: {
        name: 'Economy',
        desc: 'Markets are placed, every burg crafts goods from recipes and trades them, and states collect taxes. On a 10,000-point map the production step alone takes close to a third of the run.',
      },
      overlays: {
        name: 'Military, markers, zones, journeys',
        desc: 'Armies per state, markers such as volcanoes and dungeons, zones such as rebellions and plagues, and a story journey between burgs are added on top.',
      },
    },
  },
}
