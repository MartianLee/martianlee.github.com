// data/charts/framework-magic-tax.ts
// 본문 5장 「마법세 — 결과」 표와 같은 값만 담는다. 여기서 새로 계산하는 수치는 없다.
//
// 출처: https://github.com/MartianLee/study-rails-compare
// 측정 조건: Docker Linux 컨테이너 + MySQL 8.4, 3회 독립 측정의 중앙값,
//           코어 1개 · 프로세스 1개 · 스레드 1개로 정규화.

export type Lang = 'en' | 'ko'

export type Runtime = 'ruby' | 'python' | 'node' | 'go'

export interface Pair {
  id: Runtime
  /** 축 라벨. 언어와 무관하게 같다. */
  runtime: string
  /** 프레임워크 + ORM 버전의 요청당 CPU (ms) */
  fullCpu: number
  /** 같은 서버 + 직접 SQL 버전의 요청당 CPU (ms) */
  bareCpu: number
  /**
   * 본문 표의 공표 배율. fullCpu / bareCpu 로 재계산하지 않는다.
   * 표시용 ms는 이미 반올림된 값이라 나눗셈 결과가 둘째 자리에서 어긋난다
   * (1.113 / 0.145 = 7.68 이지만 원본 측정값 기준은 7.67).
   */
  cpuRatio: number
}

/** 마법세가 큰 순서. 본문 표의 행 순서(rails, node, python, go)와는 다르다. */
export const pairs: Pair[] = [
  { id: 'ruby', runtime: 'Ruby', fullCpu: 1.113, bareCpu: 0.145, cpuRatio: 7.67 },
  { id: 'python', runtime: 'Python', fullCpu: 1.439, bareCpu: 0.234, cpuRatio: 6.14 },
  { id: 'node', runtime: 'Node', fullCpu: 0.567, bareCpu: 0.216, cpuRatio: 2.62 },
  { id: 'go', runtime: 'Go', fullCpu: 0.277, bareCpu: 0.11, cpuRatio: 2.51 },
]

/** 가로축 최대값(ms)과 눈금. 가장 큰 값이 1.439라 1.5에서 끊는다. */
export const AXIS_MAX = 1.5
export const AXIS_TICKS = [0, 0.5, 1.0, 1.5]

export interface Labels {
  title: string
  caption: string
  source: string
  sourceName: string
  legendBase: string
  legendTax: string
  unit: string
  full: Record<Runtime, string>
  bare: Record<Runtime, string>
  tableCols: [string, string, string, string]
}

export const t: Record<Lang, Labels> = {
  en: {
    title: 'Per-request CPU, split into the app and the tax.',
    caption:
      'The dark bar is what the same server costs with raw SQL. The orange bar is what the framework and the ORM add on top. Normalised to one core, one process, one thread.',
    source: 'Measurement',
    sourceName: 'study-rails-compare, median of 3 runs',
    legendBase: 'Raw SQL on the same server',
    legendTax: 'What the framework and ORM add',
    unit: 'ms',
    full: {
      ruby: 'Rails 8 + Active Record',
      python: 'Django + Django ORM',
      node: 'Express + Sequelize',
      go: 'Gin + GORM',
    },
    bare: {
      ruby: 'Rack + raw SQL',
      python: 'WSGI + raw SQL',
      node: 'node:http + raw SQL',
      go: 'net/http + database/sql',
    },
    tableCols: ['Runtime', 'Raw SQL (ms)', 'Full stack (ms)', 'Magic tax'],
  },
  ko: {
    title: '요청당 CPU를 본체와 마법세로 가른 것.',
    caption:
      '어두운 칸은 같은 서버를 직접 SQL로 돌렸을 때의 값이고, 주황 칸은 프레임워크와 ORM이 그 위에 더 쓴 몫입니다. 코어 1개 · 프로세스 1개 · 스레드 1개로 정규화한 값입니다.',
    source: '측정',
    sourceName: 'study-rails-compare, 3회 중앙값',
    legendBase: '본체 · 같은 서버 + 직접 SQL',
    legendTax: '마법세 · 프레임워크 + ORM이 더 쓴 몫',
    unit: 'ms',
    full: {
      ruby: 'Rails 8 + Active Record',
      python: 'Django + Django ORM',
      node: 'Express + Sequelize',
      go: 'Gin + GORM',
    },
    bare: {
      ruby: 'Rack + 직접 SQL',
      python: 'WSGI + 직접 SQL',
      node: 'node:http + 직접 SQL',
      go: 'net/http + database/sql',
    },
    tableCols: ['런타임', '본체 (ms)', '전체 (ms)', '마법세'],
  },
}
