// data/charts/voronoi-lab.ts
// VoronoiLab의 문구. 기하 계산은 components/viz/VoronoiLab.tsx에 있다.

export type Lang = 'en' | 'ko'

export type DistId = 'uniform' | 'jitter' | 'poisson'
export type ViewId = 'points' | 'voronoi' | 'delaunay' | 'urquhart' | 'fill'
export type PictureId = 'geometry' | 'worleyF1' | 'worleyF2F1'

export const DIST_ORDER: DistId[] = ['uniform', 'jitter', 'poisson']
export const VIEW_ORDER: ViewId[] = ['points', 'voronoi', 'delaunay', 'urquhart', 'fill']
export const PICTURE_ORDER: PictureId[] = ['geometry', 'worleyF1', 'worleyF2F1']

export const DEFAULT_SEED = '2026'
export const DEFAULT_N = 260

interface Strings {
  title: string
  caption: string
  distGroup: string
  viewGroup: string
  pictureGroup: string
  dists: Record<DistId, { label: string; body: string }>
  views: Record<ViewId, string>
  pictures: Record<PictureId, string>
  urquhartNote: string
  fillNote: string
  worleyNote: string
  lloydNote: string
  seed: string
  newSeed: string
  count: string
  relax: string
  reset: string
  auto: string
  stop: string
  readout: (n: number, cv: string, nb: string, gap: string, iter: number) => string
  hover: (k: number) => string
  hoverHint: string
  alt: (dist: string, views: string, picture: string, n: number) => string
  announce: (dist: string, n: number, iter: number) => string
}

export const t: Record<Lang, Strings> = {
  ko: {
    title: 'Voronoi 실험실: 점 분포, 쌍대 그래프, Lloyd 완화',
    caption:
      '모든 계산은 브라우저에서 Bowyer–Watson 삼각분할로 이뤄집니다. 같은 시드와 같은 설정은 언제나 같은 그림을 만듭니다.',
    distGroup: '점 분포',
    viewGroup: '보기',
    pictureGroup: '그림',
    dists: {
      uniform: {
        label: '균등 난수',
        body: '점을 아무 규칙 없이 뿌리면 뭉치는 곳과 비는 곳이 함께 생깁니다. 그래서 셀 크기가 크게 들쭉날쭉하고, 면적 CV가 가장 높게 나옵니다.',
      },
      jitter: {
        label: '지터 격자',
        body: 'Fantasy Map Generator가 쓰는 방식입니다. 정사각형 격자의 각 칸 중앙에서 조금씩 흔들어 놓은 점이라 O(n)으로 만들 수 있고, 셀 크기가 고르며, 칸 번호만으로 근처 셀을 O(1)에 찾을 수 있습니다. 대신 격자 느낌이 약하게 남습니다.',
      },
      poisson: {
        label: 'Poisson disk',
        body: 'Bridson(2007)의 알고리즘으로, 어떤 두 점도 최소 거리 r보다 가까워지지 않게 뿌립니다. 결과는 블루 노이즈처럼 고르게 퍼진 점이고, Red Blob Games의 mapgen4 같은 절차적 지도 생성기에서 쓰입니다.',
      },
    },
    views: {
      points: '점',
      voronoi: 'Voronoi 경계',
      delaunay: 'Delaunay',
      urquhart: 'Urquhart',
      fill: '면적 색칠',
    },
    pictures: {
      geometry: '기하',
      worleyF1: 'Worley F1',
      worleyF2F1: 'Worley F2−F1',
    },
    urquhartNote:
      'Urquhart 그래프는 Delaunay 삼각형마다 가장 긴 변을 하나씩 지운 것입니다. Fantasy Map Generator가 마을 사이의 도로를 놓을 때 쓰는 그래프이기도 합니다.',
    fillNote: '면적 색칠은 셀 면적을 평균과 비교한 값입니다. 밝을수록 작고 진할수록 큽니다.',
    worleyNote:
      '같은 점에서 Steven Worley의 셀 텍스처(1996)를 그렸습니다. F1은 가장 가까운 점까지의 거리이고, F2−F1은 두 번째로 가까운 점과의 거리 차라서 Voronoi 경계가 어두운 능선으로 드러납니다.',
    lloydNote:
      'Lloyd 완화는 매 단계마다 모든 점을 자기 셀의 무게중심으로 옮깁니다. 반복할수록 점이 중심 Voronoi 분할(CVT)에 가까워지지만, 너무 많이 돌리면 셀이 벌집처럼 규칙적으로 보입니다.',
    seed: '시드',
    newSeed: '새 시드',
    count: '점 수',
    relax: '완화 ×1',
    reset: '초기화',
    auto: '자동 ×10',
    stop: '멈춤',
    readout: (n, cv, nb, gap, iter) =>
      `${n}개 점 · 면적 CV ${cv} · 평균 이웃 ${nb} · 최소 간격 ${gap}px · Lloyd ×${iter}`,
    hover: (k) => `선택한 셀의 이웃: ${k}개`,
    hoverHint: '그림 위에 올리거나 탭하면 셀과 외접원이 보입니다.',
    alt: (dist, views, picture, n) =>
      `${dist} 분포의 점 ${n}개. 그림: ${picture}. 켜 둔 보기: ${views}.`,
    announce: (dist, n, iter) => `${dist}, 점 ${n}개, Lloyd ${iter}회`,
  },
  en: {
    title: 'Voronoi lab: point distributions, the dual graph and Lloyd relaxation',
    caption:
      'Everything is computed in your browser with Bowyer–Watson triangulation. The same seed and settings always give the same picture.',
    distGroup: 'Point distribution',
    viewGroup: 'Views',
    pictureGroup: 'Picture',
    dists: {
      uniform: {
        label: 'Uniform random',
        body: 'Scatter points with no rule and you get clumps and gaps side by side. Cell sizes vary a lot, and the area CV comes out highest.',
      },
      jitter: {
        label: 'Jittered grid',
        body: "This is what Fantasy Map Generator does: take a square grid and nudge each point a little around its square's centre. It is O(n) to build, cell sizes stay even, and the grid index alone finds nearby cells in O(1). The price is a faint grid feel.",
      },
      poisson: {
        label: 'Poisson disk',
        body: "Bridson's 2007 algorithm keeps any two points at least a distance r apart. The result is an evenly spread, blue-noise look, used in procedural map generators such as Red Blob Games' mapgen4.",
      },
    },
    views: {
      points: 'Points',
      voronoi: 'Voronoi edges',
      delaunay: 'Delaunay',
      urquhart: 'Urquhart',
      fill: 'Area fill',
    },
    pictures: {
      geometry: 'Geometry',
      worleyF1: 'Worley F1',
      worleyF2F1: 'Worley F2−F1',
    },
    urquhartNote:
      'The Urquhart graph is the Delaunay triangulation with the longest edge of every triangle removed. It is the graph Fantasy Map Generator uses for roads between burgs.',
    fillNote:
      'Area fill compares each cell with the mean area. Lighter cells are smaller, darker cells are larger.',
    worleyNote:
      "The same points drawn as Steven Worley's cellular texture basis (1996). F1 is the distance to the nearest point; F2−F1 is the gap between the two nearest, so it draws the Voronoi edges as dark ridges.",
    lloydNote:
      'Each Lloyd step moves every point to the centroid of its own cell. Repeating it converges toward a centroidal Voronoi tessellation, but too many steps make the cells look like a honeycomb.',
    seed: 'seed',
    newSeed: 'new seed',
    count: 'Points',
    relax: 'Relax ×1',
    reset: 'Reset',
    auto: 'Auto ×10',
    stop: 'Stop',
    readout: (n, cv, nb, gap, iter) =>
      `${n} points · area CV ${cv} · mean neighbours ${nb} · min gap ${gap} px · Lloyd ×${iter}`,
    hover: (k) => `Neighbours of the selected cell: ${k}`,
    hoverHint: 'Hover or tap the picture to see a cell and its circumcircles.',
    alt: (dist, views, picture, n) =>
      `${n} points, ${dist} distribution. Picture: ${picture}. Views on: ${views}.`,
    announce: (dist, n, iter) => `${dist}, ${n} points, Lloyd ${iter} steps`,
  },
}
