'use client'

import { useId } from 'react'
import {
  LINEAGE_EDGES,
  LINEAGE_NODES,
  MODE_ORDER,
  TYPE_COLORS,
  t,
  type Lang,
  type ModeId,
} from '@/data/charts/bridge-spectrum'

/**
 * 9/27~10/7 패스스루 저장소 계보 타임라인. 정적 SVG.
 * 좁은 화면에서는 SVG가 min-width 640px을 유지하고 컨테이너만 가로로 스크롤된다.
 */

const SCENE_INK = '#e9ddc9'
const SCENE_DIM = '#8f7f68'
const SANS = 'var(--font-family-sans)'
const MONO = 'var(--font-mono)'

const LANES: Record<ModeId, number> = { pixel: 70, mesh: 150, logic: 222, none: 292 }
const D0 = Date.UTC(2026, 8, 27)
const DAYS = 11
const AX0 = 92
const AX1 = 730
const DAY_MS = 864e5

const xOf = (iso: string) => AX0 + ((Date.parse(iso) - D0) / DAY_MS / DAYS) * (AX1 - AX0)

const fmtStars = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const POS = Object.fromEntries(
  LINEAGE_NODES.map((n) => [
    n.id,
    {
      x: xOf(n.at),
      y: LANES[n.t],
      r: n.s ? 4 + 3.2 * Math.log10(n.s + 1) : 4.5,
      n,
    },
  ])
)

// 날짜 라벨은 그날(UTC) 구간의 가운데에 둔다
const TICKS = Array.from({ length: DAYS }, (_, i) => {
  const d = new Date(D0 + i * DAY_MS)
  return {
    x: AX0 + ((i + 0.5) / DAYS) * (AX1 - AX0),
    label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
  }
})

export default function BridgeLineage({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang].lineage
  const titleId = `${useId().replace(/:/g, '')}-title`

  return (
    <figure className="my-8 grid gap-3">
      <div className="text-muted flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px]">
        {MODE_ORDER.map((id) => (
          <span key={id}>
            <i
              aria-hidden="true"
              className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-[-1px]"
              style={{ background: TYPE_COLORS[id] }}
            />
            {t[lang].spectrum.modes[id].label}
          </span>
        ))}
        <span>{l.legendEdges}</span>
      </div>

      <div
        className="border-line overflow-x-auto rounded-2xl border"
        style={{
          background:
            'radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)',
        }}
      >
        <svg
          viewBox="0 0 760 340"
          role="img"
          aria-labelledby={titleId}
          className="block h-auto w-full"
          style={{ minWidth: 640 }}
        >
          <title id={titleId}>{l.svgTitle}</title>
          <g>
            {MODE_ORDER.map((k) => (
              <g key={k}>
                <line
                  x1={AX0 - 10}
                  y1={LANES[k]}
                  x2={AX1 + 14}
                  y2={LANES[k]}
                  stroke="#4a3826"
                  strokeDasharray="2 5"
                />
                <text
                  x={14}
                  y={LANES[k] + 4}
                  fill={TYPE_COLORS[k]}
                  fontFamily={SANS}
                  fontSize={12.5}
                  fontWeight={700}
                >
                  {l.lanes[k]}
                </text>
              </g>
            ))}
            {TICKS.map((tk) => (
              <text
                key={tk.label}
                x={tk.x}
                y={330}
                textAnchor="middle"
                fill={SCENE_DIM}
                fontFamily={MONO}
                fontSize={10}
              >
                {tk.label}
              </text>
            ))}
          </g>

          <g>
            {LINEAGE_EDGES.map(([a, b, kind, bend]) => {
              const A = POS[a]
              const B = POS[b]
              const mx = (A.x + B.x) / 2
              const d = bend
                ? `M${A.x},${A.y} Q${mx},${A.y + bend} ${B.x},${B.y}`
                : `M${A.x},${A.y} C${mx},${A.y} ${mx},${B.y} ${B.x},${B.y}`
              return (
                <path
                  key={`${a}-${b}`}
                  d={d}
                  fill="none"
                  stroke={kind === 'code' ? '#e9ddc9' : '#a8957a'}
                  strokeWidth={kind === 'code' ? 1.6 : 1.2}
                  strokeDasharray={kind === 'code' ? undefined : '4 4'}
                  opacity={0.8}
                />
              )
            })}
          </g>

          <g>
            {Object.values(POS).map(({ x, y, r, n }) => {
              const big = n.s >= 100
              const dy = n.dy ?? -16
              const name = l.names[n.id] ?? n.name
              return (
                <g key={n.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={TYPE_COLORS[n.t]}
                    stroke="#1a1108"
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + (n.lx ?? 0)}
                    y={y + dy + (dy > 0 ? 4 : 0)}
                    textAnchor={n.anchor ?? 'middle'}
                    fill={big ? SCENE_INK : SCENE_DIM}
                    fontFamily={SANS}
                    fontSize={big ? 12 : 10.5}
                    fontWeight={big ? 700 : 500}
                  >
                    {big ? `${name} ★${fmtStars(n.s)}` : name}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <figcaption className="text-ink/75 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}</span> {l.caption}{' '}
        <span className="text-muted">{l.source}</span>
      </figcaption>
    </figure>
  )
}
