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
  /** 언어별 이름. 없으면 name을 쓴다. */
  label?: Record<Lang, string>
  /** 이름 아래 작게 적는 보조 값 (예: 요청당 CPU). */
  note?: string
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
  /** 측정 출처 링크. 없으면 출처 이름만 적는다. */
  sourceUrl?: string
  /** 측정 출처 이름. 없으면 sourceName(study-rails-compare)을 쓴다. */
  source?: Record<Lang, string>
  firstCol: Record<Lang, string>
  /** 축 단위. 기본 ms */
  unit?: Record<Lang, string>
  /** 합계 소수 자리. 기본 3 */
  digits?: number
}

const SOURCE = {
  ko: 'study-rails-compare, 3회 중앙값',
  en: 'study-rails-compare, median of 3 runs',
}
export const sourceName = SOURCE

export const charts: Record<string, Chart> = {
  // 「Active Record는 요청마다 무엇을 만드는가?」 5장 (docs/orm-anatomy.md, preload 변형)
  'preload-records': {
    segments: [
      { key: 'posts', fill: 'bg-ink/55', label: { ko: '게시글', en: 'Posts' } },
      { key: 'users', fill: 'bg-ink/25', label: { ko: '작성자', en: 'Authors' } },
      {
        key: 'joins',
        fill: 'bg-accent',
        label: { ko: '조인 행 (post_tags)', en: 'Join rows (post_tags)' },
      },
      { key: 'tags', fill: 'bg-accent/35', label: { ko: '태그', en: 'Tags' } },
    ],
    bars: [
      {
        name: 'posts',
        label: { ko: '게시글만', en: 'Posts only' },
        note: '0.065 ms',
        values: { posts: 20, users: 0, joins: 0, tags: 0 },
        total: 20,
      },
      {
        name: 'user',
        label: { ko: '+ user', en: '+ user' },
        note: '0.189 ms',
        values: { posts: 20, users: 20, joins: 0, tags: 0 },
        total: 40,
      },
      {
        name: 'tags',
        label: { ko: '+ tags', en: '+ tags' },
        note: '0.492 ms',
        values: { posts: 20, users: 0, joins: 66, tags: 31 },
        total: 117,
      },
      {
        name: 'user-tags',
        label: { ko: '+ user, tags', en: '+ user, tags' },
        note: '0.608 ms',
        values: { posts: 20, users: 20, joins: 66, tags: 31 },
        total: 137,
      },
    ],
    axisMax: 140,
    ticks: [0, 35, 70, 105, 140],
    unit: { ko: '개', en: '' },
    digits: 0,
    title: {
      ko: '게시글 20개를 보여 주려고 만든 레코드 수.',
      en: 'Records built to show 20 posts.',
    },
    caption: {
      ko: '막대 길이는 레코드 수, 이름 아래 값은 요청당 CPU입니다. 태그를 불러오면 조인 행 66개가 모두 레코드가 되고, CPU도 레코드 수를 따라 늘어납니다.',
      en: 'Bar length is the number of records; the value under each name is CPU per request. Loading tags turns all 66 join rows into records, and CPU rises with the record count.',
    },
    sourceUrl: 'https://github.com/MartianLee/study-rails-compare/blob/main/docs/orm-anatomy.md',
    firstCol: { ko: '불러온 대상', en: 'Preloaded' },
  },
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

// 「HyperFrames 아키텍처 분석」 8장. 6초 1080p 30fps(180프레임) 컴포지션, Apple M5 Pro, 3회 중앙값.
// 칸은 CLI가 출력한 단계별 시간이고, 합계는 CLI의 "rendered in" 값이다(반올림 때문에 칸 합과 0.1초 어긋날 수 있다).
const HF_SOURCE = {
  ko: '직접 측정, Apple M5 Pro, 3회 중앙값',
  en: 'own measurement, Apple M5 Pro, median of 3 runs',
}
const HF_SEGMENTS = [
  {
    key: 'prep',
    fill: 'bg-ink/30',
    label: { ko: '컴파일·브라우저 준비', en: 'Compile and browser setup' },
  },
  {
    key: 'capture',
    fill: 'bg-accent',
    label: { ko: '프레임 캡처', en: 'Frame capture' },
  },
  { key: 'encode', fill: 'bg-ink/60', label: { ko: '인코딩', en: 'Encoding' } },
]

charts['hyperframes-workers'] = {
  segments: HF_SEGMENTS,
  bars: [
    {
      name: '1',
      label: { ko: 'worker 1개', en: '1 worker' },
      values: { prep: 0.5, capture: 8.1, encode: 0 },
      total: 8.7,
    },
    {
      name: '2',
      label: { ko: 'worker 2개', en: '2 workers' },
      values: { prep: 0.5, capture: 4.3, encode: 0.4 },
      total: 5.2,
    },
    {
      name: '4',
      label: { ko: 'worker 4개', en: '4 workers' },
      values: { prep: 0.5, capture: 2.7, encode: 0.4 },
      total: 3.6,
    },
    {
      name: 'auto',
      label: { ko: 'auto (5개)', en: 'auto (5)' },
      values: { prep: 1.2, capture: 2.3, encode: 0.4 },
      total: 4.0,
    },
    {
      name: '8',
      label: { ko: 'worker 8개', en: '8 workers' },
      values: { prep: 0.5, capture: 2.3, encode: 0.4 },
      total: 3.3,
    },
  ],
  axisMax: 10,
  ticks: [0, 2.5, 5, 7.5, 10],
  unit: { ko: '초', en: 's' },
  digits: 1,
  title: {
    ko: '6초 영상 하나를 렌더링하는 데 걸린 시간.',
    en: 'Time to render one 6-second video.',
  },
  caption: {
    ko: 'worker 1개일 때는 캡처와 동시에 인코딩하므로 인코딩 칸이 따로 없습니다. 4개를 넘기면 캡처 시간이 거의 줄지 않습니다.',
    en: 'With one worker, encoding runs during capture, so it has no separate segment. Past four workers, capture time barely drops.',
  },
  source: HF_SOURCE,
  firstCol: { ko: 'worker 수', en: 'Workers' },
}

charts['hyperframes-capture-mode'] = {
  segments: HF_SEGMENTS,
  bars: [
    {
      name: 'drawelement',
      label: { ko: 'drawElement', en: 'drawElement' },
      values: { prep: 0.5, capture: 4.2, encode: 0 },
      total: 4.7,
    },
    {
      name: 'screenshot',
      label: { ko: 'screenshot', en: 'screenshot' },
      values: { prep: 0.5, capture: 8.3, encode: 0 },
      total: 8.9,
    },
  ],
  axisMax: 10,
  ticks: [0, 2.5, 5, 7.5, 10],
  unit: { ko: '초', en: 's' },
  digits: 1,
  title: {
    ko: '캡처 방식만 바꿨을 때의 렌더링 시간 (worker 1개).',
    en: 'Render time with only the capture method changed (one worker).',
  },
  caption: {
    ko: 'CSS 애니메이션을 GSAP 회전으로 바꾼 같은 컴포지션입니다. drawElement는 캡처 시간이 screenshot의 절반 정도입니다.',
    en: 'The same composition with the CSS animation replaced by a GSAP rotation. drawElement capture takes about half the time of screenshot.',
  },
  source: HF_SOURCE,
  firstCol: { ko: '캡처 방식', en: 'Capture method' },
}
