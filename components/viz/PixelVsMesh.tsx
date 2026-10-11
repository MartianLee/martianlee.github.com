'use client'

import { useId, useState } from 'react'
import { PM_ORDER, TYPE_COLORS, t, type Lang, type PmId } from '@/data/charts/bridge-spectrum'

/**
 * 같은 guest 블록을 그림으로 받을 때, 그림 + 그림자 맵으로 받을 때, 메시로 받을 때.
 * 정적 SVG이고 버튼이 바뀔 때만 면 색과 그림자, 안개를 바꾼다.
 */

const SCENE_INK = '#e9ddc9'
const SCENE_DIM = '#8f7f68'
const SANS = 'var(--font-family-sans)'
const MONO = 'var(--font-mono)'

// guest 빛은 왼쪽 위(구워진 값), host 태양은 오른쪽
const PM: Record<
  PmId,
  {
    top: string
    left: string
    right: string
    shadow: number
    paste: number
    fog: number
    color: string
  }
> = {
  pixel: {
    top: '#7cb342',
    left: '#8d6e63',
    right: '#4e342e',
    shadow: 0,
    paste: 1,
    fog: 0,
    color: TYPE_COLORS.pixel,
  },
  shadow: {
    top: '#7cb342',
    left: '#8d6e63',
    right: '#4e342e',
    shadow: 1,
    paste: 1,
    fog: 0,
    color: TYPE_COLORS.logic,
  },
  mesh: {
    top: '#9ccc65',
    left: '#3e2a24',
    right: '#a1887f',
    shadow: 1,
    paste: 0,
    fog: 1,
    color: TYPE_COLORS.mesh,
  },
}

export default function PixelVsMesh({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang].pm
  const [k, setK] = useState<PmId>('pixel')
  const s = PM[k]
  const uid = useId().replace(/:/g, '')
  const duskId = `${uid}-dusk`
  const fogId = `${uid}-fog`
  const titleId = `${uid}-title`

  return (
    <figure className="my-8 grid gap-3">
      <div role="group" aria-label={l.group} className="flex flex-wrap gap-2">
        {PM_ORDER.map((id) => {
          const on = id === k
          const c = PM[id].color
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setK(id)}
              className="text-ink border-line bg-surface focus-visible:outline-accent inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
              style={
                on
                  ? { borderColor: c, background: `color-mix(in srgb, ${c} 16%, var(--surface))` }
                  : undefined
              }
            >
              <span
                aria-hidden="true"
                className="inline-block h-[9px] w-[9px] rounded-full"
                style={{ background: c }}
              />
              {l.states[id].label}
            </button>
          )
        })}
      </div>

      <div
        className="border-line overflow-hidden rounded-2xl border"
        style={{
          background:
            'radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)',
        }}
      >
        <svg
          viewBox="0 0 760 300"
          role="img"
          aria-labelledby={titleId}
          className="block h-auto w-full"
        >
          <title id={titleId}>{l.svgTitle}</title>
          <defs>
            <linearGradient id={duskId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5b3a22" />
              <stop offset=".62" stopColor="#2f1f10" />
              <stop offset="1" stopColor="#1d1309" />
            </linearGradient>
            <linearGradient id={fogId} x1="0" x2="1">
              <stop offset="0" stopColor="#c9a77a" stopOpacity="0" />
              <stop offset="1" stopColor="#c9a77a" stopOpacity=".22" />
            </linearGradient>
          </defs>
          <rect width={760} height={300} fill={`url(#${duskId})`} />
          <circle cx={680} cy={70} r={26} fill="#f2b45a" />
          <text
            x={680}
            y={116}
            textAnchor="middle"
            fill={SCENE_DIM}
            fontFamily={MONO}
            fontSize={11}
          >
            {l.hostSun}
          </text>
          <polygon points="0,210 760,196 760,300 0,300" fill="#3a2a17" />

          {/* host 나무와 그림자: host는 항상 자기 것을 그린다 */}
          <ellipse
            cx={160}
            cy={214}
            rx={64}
            ry={7}
            fill="#000"
            opacity={0.42}
            transform="skewX(-30) translate(120 0)"
          />
          <rect x={226} y={150} width={10} height={62} fill="#4b3621" />
          <circle cx={231} cy={140} r={30} fill="#4f5d2f" />
          <circle cx={243} cy={128} r={20} fill="#5d6d37" />
          <text
            x={231}
            y={244}
            textAnchor="middle"
            fill={SCENE_DIM}
            fontFamily={SANS}
            fontSize={11.5}
          >
            {l.hostTree}
          </text>

          <g style={{ opacity: s.shadow }}>
            <polygon points="410,206 474,206 420,222 356,222" fill="#000" opacity={0.42} />
          </g>
          <g transform="translate(410 120)">
            <polygon points="40,0 80,20 40,40 0,20" fill={s.top} />
            <polygon points="0,20 40,40 40,88 0,68" fill={s.left} />
            <polygon points="80,20 40,40 40,88 80,68" fill={s.right} />
            <rect
              x={-6}
              y={-6}
              width={92}
              height={100}
              fill="none"
              stroke={TYPE_COLORS.pixel}
              strokeDasharray="4 3"
              style={{ opacity: s.paste }}
            />
          </g>
          <text
            x={450}
            y={244}
            textAnchor="middle"
            fill={SCENE_INK}
            fontFamily={SANS}
            fontSize={12}
            fontWeight={600}
          >
            {l.states[k].blockLabel}
          </text>
          <rect width={760} height={300} fill={`url(#${fogId})`} style={{ opacity: s.fog }} />
        </svg>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {l.tableHeads.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="border-line text-muted border-b px-2 py-1.5 text-left font-mono text-[11px] font-normal tracking-wider uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {l.rows.map((r) => (
              <tr key={r.label}>
                <th
                  scope="row"
                  className="border-line text-ink border-b px-2 py-1.5 text-left font-normal"
                >
                  {r.label}
                </th>
                {r.cells.map((c, i) => (
                  <td
                    key={i}
                    className={`border-line border-b px-2 py-1.5 text-left ${
                      r.on[i] ? 'font-semibold text-[#23706b] dark:text-[#2f8f8a]' : 'text-muted'
                    }`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted border-line m-0 border-l-2 pl-2.5 text-[12.5px] leading-relaxed">
        {l.note}
      </p>

      <figcaption className="text-ink/75 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}</span> {l.caption}{' '}
        <span className="text-muted">{l.source}</span>
      </figcaption>
    </figure>
  )
}
