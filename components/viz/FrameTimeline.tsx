'use client'

import { useState } from 'react'
import {
  measured,
  scenarioLabel,
  sideLabel,
  sourceName,
  timelineText as T,
  type Lang,
  type ScenarioKey,
} from '@/data/charts/pungsu-stutter'

const W = 720
const PANEL_H = 120
const GAP = 34
const LEFT = 40
const RIGHT = 10
const TOP = 18
const Y_MAX = 120 // ms; taller spikes are clipped and marked
const GUIDES = [16.7, 33.3, 50, 100]

/**
 * 프레임 시간 타임라인. 위는 수정 전, 아래는 수정 후이고 같은 축을 쓴다.
 * 데이터는 하네스가 남긴 매 프레임 시간을 0.08초 구간 최댓값으로 줄인 것이다.
 */
export default function FrameTimeline({ lang = 'ko' }: { lang?: Lang }) {
  const keys = Object.keys(measured.scenarios) as ScenarioKey[]
  const [key, setKey] = useState<ScenarioKey>('run320')
  const sc = measured.scenarios[key]
  const plotW = W - LEFT - RIGHT
  const H = TOP + PANEL_H * 2 + GAP + 26

  const panel = (side: 'before' | 'after', top: number) => {
    const d = sc[side]
    const n = d.peaks.length
    const x = (i: number) => LEFT + (i / n) * plotW
    const y = (ms: number) => top + PANEL_H - (Math.min(ms, Y_MAX) / Y_MAX) * PANEL_H
    const xt = (t: number) => LEFT + (t / sc.seconds) * plotW
    return (
      <g key={side}>
        <text x={LEFT} y={top - 6} className="fill-ink text-[12px] font-bold">
          {sideLabel[side][lang]}
          <tspan className="fill-muted font-normal">
            {'  '}p99 {d.stats.p99}ms · max {d.stats.max}ms · &gt;50ms {d.stats.over50}
          </tspan>
        </text>
        {GUIDES.map((g) => (
          <g key={g}>
            <line
              x1={LEFT}
              x2={W - RIGHT}
              y1={y(g)}
              y2={y(g)}
              stroke="var(--line)"
              strokeDasharray={g === 16.7 ? undefined : '2 3'}
            />
            <text x={LEFT - 4} y={y(g) + 3} textAnchor="end" className="fill-muted text-[9px]">
              {g === 16.7 ? '16.7' : g}
            </text>
          </g>
        ))}
        {d.crossings.map((t) => (
          <line
            key={t}
            x1={xt(t)}
            x2={xt(t)}
            y1={top}
            y2={top + PANEL_H}
            stroke="var(--muted)"
            strokeOpacity={0.6}
            strokeDasharray="3 3"
          />
        ))}
        {d.peaks.map((ms, i) => (
          <line
            key={i}
            x1={x(i) + 0.5}
            x2={x(i) + 0.5}
            y1={top + PANEL_H}
            y2={y(ms)}
            stroke={ms > 33.3 ? 'var(--accent)' : 'var(--ink)'}
            strokeOpacity={ms > 33.3 ? 1 : 0.45}
            strokeWidth={1.1}
          />
        ))}
        {d.peaks.map((ms, i) =>
          ms > Y_MAX ? (
            <path
              key={`c${i}`}
              d={`M${x(i) - 3},${top + 4} L${x(i) + 0.5},${top - 1} L${x(i) + 4},${top + 4}`}
              fill="var(--accent)"
            />
          ) : null
        )}
        <line
          x1={LEFT}
          x2={W - RIGHT}
          y1={top + PANEL_H}
          y2={top + PANEL_H}
          stroke="var(--muted)"
        />
      </g>
    )
  }

  const bottom = TOP + PANEL_H * 2 + GAP
  const ticks = Array.from({ length: Math.floor(sc.seconds / 5) + 1 }, (_, i) => i * 5)
  return (
    <figure className="my-8">
      <div className="border-line bg-surface rounded-2xl border p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2" role="tablist">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === key}
              onClick={() => setKey(k)}
              className={`rounded-full border px-3 py-1 text-xs ${
                k === key
                  ? 'border-accent bg-accent text-white'
                  : 'border-line text-muted hover:text-ink'
              }`}
            >
              {scenarioLabel[k][lang]}
            </button>
          ))}
        </div>
        {/* 좁은 화면에서는 글자가 읽히도록 최소 폭을 두고 가로로 스크롤한다 */}
        <div className="-mx-1 overflow-x-auto px-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full min-w-[580px]"
            role="img"
            aria-label={T.title[lang]}
          >
            {panel('before', TOP + 10)}
            {panel('after', TOP + 10 + PANEL_H + GAP)}
            {ticks.map((t) => (
              <text
                key={t}
                x={LEFT + (t / sc.seconds) * plotW}
                y={bottom + 22}
                textAnchor="middle"
                className="fill-muted text-[10px]"
              >
                {t}
                {t === ticks[ticks.length - 1] ? ` ${T.axis[lang]}` : ''}
              </text>
            ))}
            <text x={4} y={TOP + 10 + PANEL_H / 2} className="fill-muted text-[9px]">
              ms
            </text>
          </svg>
        </div>
        <div className="text-muted mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-2">
            <i className="bg-accent inline-block h-3 w-1" /> &gt; 33.3ms
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="bg-ink/45 inline-block h-3 w-1" /> ≤ 33.3ms
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="border-muted inline-block h-3 border-l border-dashed" />{' '}
            {T.crossing[lang]}
          </span>
          <span className="inline-flex items-center gap-2">
            <i className="text-accent">▲</i> {Y_MAX}ms {T.clipped[lang]}
          </span>
        </div>
      </div>
      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{T.title[lang]}.</span> {T.caption[lang]}{' '}
        <span className="text-muted">{sourceName[lang]}</span>
      </figcaption>
      <div className="sr-only">
        <table>
          <thead>
            <tr>
              <th>{scenarioLabel[key][lang]}</th>
              <th>p50</th>
              <th>p95</th>
              <th>p99</th>
              <th>max</th>
            </tr>
          </thead>
          <tbody>
            {(['before', 'after'] as const).map((s) => (
              <tr key={s}>
                <td>{sideLabel[s][lang]}</td>
                <td>{sc[s].stats.p50}</td>
                <td>{sc[s].stats.p95}</td>
                <td>{sc[s].stats.p99}</td>
                <td>{sc[s].stats.max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
