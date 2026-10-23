// data/charts/pungsu-stutter.ts
// Words and the few derived numbers for the Pungsu Keeper stutter post. The measured series
// live in pungsu-stutter-measured.ts (generated from the harness dumps).

import { measured } from './pungsu-stutter-measured'

export { measured }
export type Lang = 'en' | 'ko'
export type ScenarioKey = keyof typeof measured.scenarios

export const sourceName: Record<Lang, string> = {
  ko: '풍수지기 측정 하네스 (Godot 4.6.1, 창 모드, 수직 동기화 끔, 시드 777)',
  en: 'Pungsu Keeper measuring harness (Godot 4.6.1, windowed, vsync off, seed 777)',
}

export const scenarioLabel: Record<ScenarioKey, Record<Lang, string>> = {
  walk: { ko: '걷기 24초', en: 'Walking, 24 s' },
  run320: { ko: '320px/s 직진 40초', en: '320 px/s straight, 40 s' },
  run450: { ko: '450px/s 직진 40초', en: '450 px/s straight, 40 s' },
}

export const sideLabel: Record<'before' | 'after', Record<Lang, string>> = {
  before: { ko: '수정 전', en: 'Before' },
  after: { ko: '수정 후', en: 'After' },
}

export const timelineText = {
  title: { ko: '프레임마다 걸린 시간', en: 'Time taken by every frame' },
  caption: {
    ko: '0.08초 구간마다 가장 오래 걸린 프레임을 세로선 하나로 그렸습니다. 점선은 청크 경계를 넘어 새 청크 일곱 개가 대기열에 들어간 순간입니다. 수정 전에는 그때마다 100ms를 넘는 프레임이 줄지어 나오고, 수정 후에는 같은 순간에도 30ms 아래에 머뭅니다.',
    en: 'Each vertical line is the slowest frame in a 0.08 s slice. Dashed lines mark the moments the hero crossed a chunk border and seven new chunks were queued. Before the fix, each crossing brings a run of frames over 100 ms; after it, the same moments stay under 30 ms.',
  },
  crossing: { ko: '청크 경계', en: 'chunk border' },
  axis: { ko: '초', en: 's' },
  clipped: { ko: '위로 잘림', en: 'clipped' },
}

export const ladderText = {
  title: { ko: '느린 프레임은 꼬리에 있습니다', en: 'Slow frames live in the tail' },
  caption: {
    ko: '막대 하나가 한 측정의 프레임 시간 분포입니다. 진한 칸부터 p50, p95, p99까지이고, 막대가 끝나는 곳이 가장 느린 프레임입니다. p50도 줄었지만 크게 줄어든 것은 p99와 최댓값으로, 다섯 배 넘게 짧아졌습니다.',
    en: 'Each bar is the frame-time distribution of one run: the darkest part runs to p50, then p95 and p99, and the bar ends at the slowest frame. p50 drops too, but the big change is in p99 and the maximum, which fall more than fivefold.',
  },
  legend: {
    p50: { ko: '~p50', en: '~p50' },
    p95: { ko: 'p50~p95', en: 'p50–p95' },
    p99: { ko: 'p95~p99', en: 'p95–p99' },
    max: { ko: 'p99~최대', en: 'p99–max' },
  },
}

export const occluderText = {
  title: { ko: '가리는 물체를 찾는 범위', en: 'Where the fader looks for occluders' },
  caption: {
    ko: '왼쪽은 불러 둔 7×7 청크 전체에 놓인 나무·바위·풀의 밀도(256px 칸)입니다. 수정 전에는 이 1만 9천 개를 물리 틱마다 모두 확인했습니다. 오른쪽은 주인공 주변 1,280px을 확대한 그림입니다. 수정 후에는 128px 칸으로 나눠 두고 주인공이 선 칸과 그 둘레 3×3칸만 봅니다.',
    en: 'Left: the density of trees, rocks and grass across the 7×7 loaded chunks, in 256 px cells. Before the fix, all 19,000 of them were checked every physics tick. Right: 1,280 px around the hero. After the fix they sit in 128 px buckets and only the hero’s bucket and the eight around it are checked.',
  },
  before: { ko: '수정 전: 매 틱 전부', en: 'Before: all of them, every tick' },
  after: { ko: '수정 후: 주변 3×3칸만', en: 'After: the 3×3 buckets around the hero' },
  zoom: { ko: '오른쪽 확대 범위', en: 'zoomed on the right' },
  hero: { ko: '주인공', en: 'hero' },
  kinds: {
    t: { ko: '나무', en: 'tree' },
    r: { ko: '바위', en: 'rock' },
    p: { ko: '풀·덤불', en: 'grass, bush' },
  },
  checked: { ko: '확인하는 수', en: 'checked' },
}

/**
 * Per-frame costs for one chunk, from the harness's chunkcost and stripcost modes
 * (averages over several chunks). The schedule below follows the real _process rules:
 * a 4 ms script budget, and a step that adds props ends the frame.
 */
export const stripCosts = {
  baseFrame: 6.5, // an ordinary frame while walking, ms
  before: { terrain: 19.0, props: 21.8, monsters: 0.8, engine: 23.7 },
  terrainStep: { script: 1.4, engine: 1.2 },
  propsStep: { script: 1.5, engine: 4.1 },
  monstersStep: { script: 0.8, engine: 1.1 },
}

export const stripText = {
  title: { ko: '청크 하나를 짓는 순서', en: 'How one chunk gets built' },
  caption: {
    ko: '실제 청크 (6, 0)의 지형과 소품입니다. 수정 전에는 이 전부를 한 프레임에 지었고, 수정 후에는 지형을 4줄씩, 소품을 4열씩 나눠 여러 프레임에 짓습니다. 아래 막대는 측정한 평균 비용으로 계산한 프레임별 시간입니다. 엔진 몫은 실제로는 다음 프레임에 붙지만 한 막대에 함께 그렸습니다.',
    en: 'The ground and props of the real chunk (6, 0). Before the fix all of it was built in one frame; after it, the ground goes in four rows and the props in four columns at a time, over many frames. The bars below are frame times computed from the measured average costs. The engine’s share actually lands on the next frame, but is drawn in the same bar.',
  },
  play: { ko: '재생', en: 'Play' },
  pause: { ko: '정지', en: 'Pause' },
  slider: { ko: '프레임', en: 'Frame' },
  frame: { ko: '프레임', en: 'frame' },
  modeBefore: { ko: '수정 전: 한 프레임에 통째로', en: 'Before: all in one frame' },
  modeAfter: { ko: '수정 후: 조각으로 나눠서', en: 'After: a strip at a time' },
  readout: {
    terrain: { ko: '지형 {n}줄', en: '{n} rows of ground' },
    props: { ko: '소품 {n}열', en: '{n} columns of props' },
    monsters: { ko: '몬스터', en: 'monsters' },
    whole: { ko: '지형·소품·몬스터 전부', en: 'ground, props and monsters at once' },
    engine: {
      ko: '엔진: 앞 프레임에서 만든 노드 등록·그리기',
      en: 'engine: registering and drawing what the last frame made',
    },
  },
  legend: {
    base: { ko: '평소 프레임', en: 'ordinary frame' },
    script: { ko: '스크립트(짓기)', en: 'script (building)' },
    engine: { ko: '엔진 몫', en: 'engine share' },
  },
  budget: { ko: '16.7ms (60fps)', en: '16.7 ms (60 fps)' },
  longest: { ko: '가장 긴 프레임', en: 'Longest frame' },
  props: {
    t: { ko: '나무', en: 'tree' },
    r: { ko: '바위', en: 'rock' },
    p: { ko: '풀·덤불', en: 'grass, bush' },
  },
  count: { ko: '짓는 데 든 프레임', en: 'Frames to build' },
  colors: {
    g: { ko: '풀밭', en: 'grass' },
    w: { ko: '물', en: 'water' },
    f: { ko: '숲·덤불', en: 'forest, thicket' },
  },
}

export interface ScheduledFrame {
  script: number
  engine: number
  /** rows of ground and columns of props done after this frame */
  rows: number
  cols: number
  monsters: boolean
  label: 'whole' | 'engine' | 'terrain' | 'props' | 'monsters'
}

/** The frames that build one chunk, before and after the fix. */
export function schedule(after: boolean): ScheduledFrame[] {
  const c = stripCosts
  if (!after) {
    return [
      {
        script: c.before.terrain + c.before.props + c.before.monsters,
        engine: 0,
        rows: 64,
        cols: 64,
        monsters: true,
        label: 'whole',
      },
      { script: 0, engine: c.before.engine, rows: 64, cols: 64, monsters: true, label: 'engine' },
    ]
  }
  const frames: ScheduledFrame[] = []
  const BUDGET = 4
  let rows = 0
  let cols = 0
  let monsters = false
  while (!monsters) {
    let script = 0
    let engine = 0
    let label: ScheduledFrame['label'] = 'terrain'
    while (script < BUDGET) {
      if (rows < 64) {
        rows += 4
        script += c.terrainStep.script
        engine += c.terrainStep.engine
        label = 'terrain'
        continue
      }
      if (cols < 64) {
        cols += 4
        script += c.propsStep.script
        engine += c.propsStep.engine
        label = 'props'
        break // a step that adds props ends the frame
      }
      monsters = true
      script += c.monstersStep.script
      engine += c.monstersStep.engine
      label = 'monsters'
      break
    }
    frames.push({ script, engine, rows, cols, monsters, label })
  }
  return frames
}
