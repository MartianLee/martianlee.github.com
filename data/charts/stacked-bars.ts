// data/charts/stacked-bars.ts
// 글 본문 표와 같은 값만 담는다. 출처는 study-rails-compare의 3회 측정 중앙값(요청당 CPU ms).

export type Lang = 'en' | 'ko'

export interface Segment {
  key: string
  /** Tailwind 배경 클래스. 강조할 층을 가장 진하게 둔다. */
  fill: string
  label: Record<Lang, string>
}

export interface Bar {
  name: string
  values: Record<string, number>
  /** 본문 표의 합계. 층 합과 반올림 차이가 날 수 있어 표의 값을 그대로 둔다. */
  total: number
}

export interface Chart {
  segments: Segment[]
  bars: Bar[]
  axisMax: number
  ticks: number[]
  title: Record<Lang, string>
  caption: Record<Lang, string>
  sourceUrl: string
  firstCol: Record<Lang, string>
}

const SOURCE = {
  ko: 'study-rails-compare, 3회 중앙값',
  en: 'study-rails-compare, median of 3 runs',
}
export const sourceName = SOURCE

export const charts: Record<string, Chart> = {
  // 「Active Record는 요청마다 무엇을 만드는가?」 3장 (docs/orm-anatomy.md)
  'orm-layers': {
    segments: [
      {
        key: 'driver',
        fill: 'bg-ink/55',
        label: { ko: '드라이버 (① 기준)', en: 'Driver (baseline ①)' },
      },
      {
        key: 'query',
        fill: 'bg-accent/45',
        label: { ko: '쿼리 계층 (①→②)', en: 'Query layer (①→②)' },
      },
      {
        key: 'models',
        fill: 'bg-accent',
        label: { ko: '모델 생성 (②→③)', en: 'Building models (②→③)' },
      },
      {
        key: 'reads',
        fill: 'bg-accent/25',
        label: { ko: '속성 읽기 (③→④)', en: 'Reading attributes (③→④)' },
      },
    ],
    bars: [
      {
        name: 'Active Record',
        values: { driver: 0.106, query: 0.183, models: 0.311, reads: 0.124 },
        total: 0.725,
      },
      {
        name: 'Sequelize',
        values: { driver: 0.235, query: 0.172, models: 0.022, reads: 0.098 },
        total: 0.528,
      },
      {
        name: 'GORM',
        values: { driver: 0.116, query: 0.012, models: 0.058, reads: 0.041 },
        total: 0.227,
      },
    ],
    axisMax: 0.8,
    ticks: [0, 0.2, 0.4, 0.6, 0.8],
    title: { ko: '요청당 CPU를 층별로 나눈 것.', en: 'CPU per request, split by layer.' },
    caption: {
      ko: '막대 하나가 ORM 경로 하나의 CPU 시간 전체입니다. 가장 진한 칸이 모델 생성 비용입니다.',
      en: 'Each bar is the whole CPU time of one ORM path. The darkest segment is building models.',
    },
    sourceUrl: 'https://github.com/MartianLee/study-rails-compare/blob/main/docs/orm-anatomy.md',
    firstCol: { ko: 'ORM', en: 'ORM' },
  },
  // 「Rails 요청 하나의 CPU는 어디에 쓰일까요?」 (docs/layers.md)
  'request-layers': {
    segments: [
      {
        key: 'http',
        fill: 'bg-ink/30',
        label: { ko: 'HTTP 서버와 JSON', en: 'HTTP server and JSON' },
      },
      {
        key: 'framework',
        fill: 'bg-ink/60',
        label: { ko: '라우팅·미들웨어', en: 'Routing and middleware' },
      },
      { key: 'database', fill: 'bg-accent/40', label: { ko: 'DB 쿼리', en: 'Database queries' } },
      { key: 'orm', fill: 'bg-accent', label: { ko: 'ORM', en: 'ORM' } },
    ],
    bars: [
      {
        name: 'Rails',
        values: { http: 0.056, framework: 0.086, database: 0.21, orm: 0.804 },
        total: 1.155,
      },
      {
        name: 'Express',
        values: { http: 0.019, framework: 0.011, database: 0.215, orm: 0.227 },
        total: 0.472,
      },
      {
        name: 'Gin',
        values: { http: 0.017, framework: 0.002, database: 0.133, orm: 0.13 },
        total: 0.283,
      },
    ],
    axisMax: 1.2,
    ticks: [0, 0.3, 0.6, 0.9, 1.2],
    title: { ko: '요청 하나의 CPU를 층별로 나눈 것.', en: 'One request’s CPU, split by layer.' },
    caption: {
      ko: '목록 API 요청 하나의 CPU 시간 전체입니다. 가장 진한 칸이 ORM입니다.',
      en: 'The whole CPU time of one list request. The darkest segment is the ORM.',
    },
    sourceUrl: 'https://github.com/MartianLee/study-rails-compare/blob/main/docs/layers.md',
    firstCol: { ko: '프레임워크', en: 'Framework' },
  },
}
