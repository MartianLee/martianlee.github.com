'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  MODE_META,
  MODE_ORDER,
  TYPE_COLORS,
  t,
  type Lang,
  type ModeId,
} from '@/data/charts/bridge-spectrum'

/**
 * 브릿지로 무엇을 넘기는가: 픽셀 / 메시 / 로직 / 브릿지 없음.
 * 패킷은 React가 그리고, 움직임은 rAF 루프가 ref의 transform만 갱신한다.
 * reduced-motion이거나 화면 밖이면 루프를 돌리지 않는다.
 */

const SCENE_BG = 'radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)'
const SCENE_INK = '#e9ddc9'
const SCENE_DIM = '#8f7f68'
const SANS = 'var(--font-family-sans)'
const MONO = 'var(--font-mono)'
const X0 = 262
const X1 = 498
const CYCLE_MS = 2600

/** 시각 t(0..1 주기)에서 패킷 i의 위치와 투명도. */
function packetPose(mode: ModeId, i: number, n: number, t: number) {
  const phase = i / n
  let u = (phase + t) % 1
  let opacity = 1
  if (mode === 'mesh') {
    u = (phase * 0.5 + t * 0.35) % 1
    opacity = u < 0.5 ? 1 : 0
    u *= 2
  }
  // 로직은 양방향: 짝수 → 오른쪽, 홀수 → 왼쪽
  const dir = mode === 'logic' && i % 2 ? -1 : 1
  const x = dir > 0 ? X0 + (X1 - X0) * u : X1 - (X1 - X0) * u
  return { transform: `translate(${x.toFixed(1)} 145)`, opacity }
}

const INITIAL_T = 0.3

function Cube({ top, left, right }: { top: string; left: string; right: string }) {
  return (
    <>
      <polygon points="30,0 60,15 30,30 0,15" fill={top} />
      <polygon points="0,15 30,30 30,66 0,51" fill={left} />
      <polygon points="60,15 30,30 30,66 60,51" fill={right} />
    </>
  )
}

function PacketShape({
  mode,
  i,
  gradId,
  logicLabels,
}: {
  mode: ModeId
  i: number
  gradId: string
  logicLabels: string[]
}) {
  if (mode === 'pixel') {
    return (
      <>
        <rect x={-14} y={-9} width={28} height={9} fill="#7cb342" />
        <rect x={-14} y={0} width={28} height={9} fill={`url(#${gradId})`} />
        <rect x={-14} y={-9} width={28} height={18} fill="none" stroke="#f3e9d6" strokeWidth={1} />
      </>
    )
  }
  if (mode === 'mesh') {
    const c = TYPE_COLORS.mesh
    return (
      <>
        <polygon points="0,-10 10,-5 0,0 -10,-5" fill="none" stroke={c} strokeWidth={1.5} />
        <polyline points="-10,-5 -10,6 0,11 10,6 10,-5" fill="none" stroke={c} strokeWidth={1.5} />
        <line x1={0} y1={0} x2={0} y2={11} stroke={c} strokeWidth={1.5} />
      </>
    )
  }
  if (mode === 'logic') {
    return (
      <>
        <rect
          x={-26}
          y={-9}
          width={52}
          height={18}
          rx={9}
          fill="#2b1f0c"
          stroke={TYPE_COLORS.logic}
        />
        <text
          x={0}
          y={4}
          textAnchor="middle"
          fill={TYPE_COLORS.logic}
          fontFamily={MONO}
          fontSize={9.5}
        >
          {logicLabels[i % logicLabels.length]}
        </text>
      </>
    )
  }
  return null
}

export default function BridgeSpectrum({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang].spectrum
  const [mode, setMode] = useState<ModeId>('pixel')
  const m = l.modes[mode]
  const meta = MODE_META[mode]
  const color = TYPE_COLORS[mode]
  const uid = useId().replace(/:/g, '')
  const depthId = `${uid}-depth`
  const skyId = `${uid}-sky`
  const titleId = `${uid}-title`

  const figRef = useRef<HTMLElement>(null)
  const packetRefs = useRef<(SVGGElement | null)[]>([])
  const [inView, setInView] = useState(false)
  const [reduce, setReduce] = useState(true) // 확인 전에는 움직이지 않는다

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    const onChange = () => setReduce(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = figRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const n = meta.packets
  useEffect(() => {
    if (reduce || !inView || n === 0) return
    const t0 = performance.now() - INITIAL_T * CYCLE_MS
    let raf = 0
    const loop = (now: number) => {
      const t = ((now - t0) / CYCLE_MS) % 1
      for (let i = 0; i < n; i++) {
        const g = packetRefs.current[i]
        if (!g) continue
        const p = packetPose(mode, i, n, t)
        g.setAttribute('transform', p.transform)
        g.setAttribute('opacity', String(p.opacity))
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [mode, n, reduce, inView])

  const none = mode === 'none'

  return (
    <figure ref={figRef} className="my-8 grid gap-3">
      <div role="group" aria-label={l.group} className="flex flex-wrap gap-2">
        {MODE_ORDER.map((id) => {
          const on = id === mode
          const c = TYPE_COLORS[id]
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setMode(id)}
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
              {l.modes[id].label}
            </button>
          )
        })}
      </div>

      <div
        className="border-line overflow-hidden rounded-2xl border"
        style={{ background: SCENE_BG }}
      >
        <svg
          viewBox="0 0 760 300"
          role="img"
          aria-labelledby={titleId}
          className="block h-auto w-full"
        >
          <title id={titleId}>{l.svgTitle}</title>
          <defs>
            <linearGradient id={depthId} x1="0" x2="1">
              <stop offset="0" stopColor="#f3e9d6" />
              <stop offset="1" stopColor="#3b3226" />
            </linearGradient>
            <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a3420" />
              <stop offset="1" stopColor="#2b1d10" />
            </linearGradient>
          </defs>

          {/* 한 프로세스 윤곽 (브릿지 없음) */}
          <rect
            x={10}
            y={22}
            width={740}
            height={244}
            rx={18}
            fill="none"
            stroke={TYPE_COLORS.none}
            strokeWidth={2}
            strokeDasharray="7 6"
            opacity={none ? 1 : 0}
          />
          <text
            x={380}
            y={16}
            textAnchor="middle"
            fill={TYPE_COLORS.none}
            fontFamily={MONO}
            fontSize={12}
            opacity={none ? 1 : 0}
          >
            {l.procLabel}
          </text>

          {/* guest */}
          <g opacity={mode === 'logic' ? 0.55 : 1}>
            <rect x={24} y={40} width={220} height={210} rx={14} fill="#1a1108" stroke="#5a4630" />
            <text x={40} y={66} fill={SCENE_DIM} fontFamily={MONO} fontSize={11} letterSpacing={1}>
              {l.guestTag}
            </text>
            <text x={40} y={88} fill={SCENE_INK} fontFamily={SANS} fontSize={17} fontWeight={700}>
              {m.guest}
            </text>
            <text x={40} y={232} fill={SCENE_DIM} fontFamily={SANS} fontSize={12}>
              {m.guestRole}
            </text>
            <g transform="translate(104 118)">
              <Cube top="#7cb342" left="#795548" right="#5d4037" />
            </g>
          </g>

          {/* 브릿지 */}
          <g opacity={none ? 0.18 : 1}>
            <rect x={244} y={128} width={272} height={34} rx={17} fill="#120b05" stroke="#5a4630" />
            <text
              x={380}
              y={118}
              textAnchor="middle"
              fill={SCENE_DIM}
              fontFamily={MONO}
              fontSize={11}
              letterSpacing={1}
            >
              {l.pipeLabel}
            </text>
            <text
              x={380}
              y={186}
              textAnchor="middle"
              fill={color}
              fontFamily={SANS}
              fontSize={13}
              fontWeight={600}
            >
              {m.note}
            </text>
            <g>
              {Array.from({ length: n }, (_, i) => {
                const p = packetPose(mode, i, n, INITIAL_T)
                return (
                  <g
                    key={`${mode}-${i}`}
                    ref={(el) => {
                      packetRefs.current[i] = el
                    }}
                    transform={p.transform}
                    opacity={p.opacity}
                  >
                    <PacketShape mode={mode} i={i} gradId={depthId} logicLabels={l.logicPackets} />
                  </g>
                )
              })}
            </g>
          </g>

          {/* host */}
          <g>
            <rect
              x={516}
              y={40}
              width={220}
              height={210}
              rx={14}
              fill={`url(#${skyId})`}
              stroke="#8a6a44"
            />
            <text x={532} y={66} fill={SCENE_DIM} fontFamily={MONO} fontSize={11} letterSpacing={1}>
              {l.hostTag}
            </text>
            <text x={532} y={88} fill={SCENE_INK} fontFamily={SANS} fontSize={17} fontWeight={700}>
              {m.host}
            </text>
            <circle cx={700} cy={104} r={11} fill="#f2b45a" />
            <line x1={530} y1={206} x2={722} y2={206} stroke="#6b5233" strokeWidth={2} />

            {mode === 'pixel' && (
              <g>
                <rect
                  x={590}
                  y={128}
                  width={72}
                  height={78}
                  fill="none"
                  stroke={TYPE_COLORS.pixel}
                  strokeDasharray="4 3"
                />
                <g transform="translate(596 136)">
                  <Cube top="#7cb342" left="#795548" right="#5d4037" />
                </g>
              </g>
            )}
            {mode === 'mesh' && (
              <g>
                <ellipse cx={604} cy={207} rx={40} ry={6} fill="#000" opacity={0.45} />
                <g transform="translate(596 136)">
                  <Cube top="#9ccc65" left="#4e342e" right="#a1887f" />
                </g>
              </g>
            )}
            {mode === 'logic' && (
              <g>
                <circle cx={620} cy={146} r={9} fill="#d7c4a3" />
                <g stroke="#d7c4a3" strokeLinecap="round">
                  <line x1={620} y1={155} x2={620} y2={184} strokeWidth={5} />
                  <line x1={620} y1={184} x2={608} y2={205} strokeWidth={5} />
                  <line x1={620} y1={184} x2={634} y2={205} strokeWidth={5} />
                  <line x1={620} y1={162} x2={644} y2={150} strokeWidth={4} />
                </g>
                <line x1={644} y1={150} x2={662} y2={128} stroke="#cfd8dc" strokeWidth={3} />
                <rect x={540} y={104} width={64} height={5} rx={2} fill="#3b2a18" />
                <rect x={540} y={104} width={44} height={5} rx={2} fill={TYPE_COLORS.logic} />
                <text x={540} y={98} fill={TYPE_COLORS.logic} fontFamily={MONO} fontSize={10}>
                  STAMINA
                </text>
              </g>
            )}
            {mode === 'none' && (
              <g>
                <rect
                  x={560}
                  y={132}
                  width={132}
                  height={58}
                  rx={10}
                  fill="#1a1108"
                  stroke={TYPE_COLORS.none}
                />
                <text
                  x={626}
                  y={156}
                  textAnchor="middle"
                  fill={SCENE_INK}
                  fontFamily={MONO}
                  fontSize={12}
                >
                  {l.noneChipTitle}
                </text>
                <text
                  x={626}
                  y={176}
                  textAnchor="middle"
                  fill={SCENE_DIM}
                  fontFamily={SANS}
                  fontSize={11}
                >
                  {l.noneChipSub}
                </text>
              </g>
            )}
            <text
              x={626}
              y={226}
              textAnchor="middle"
              fill={color}
              fontFamily={SANS}
              fontSize={11.5}
            >
              {m.hostCaption}
            </text>
          </g>
        </svg>
      </div>

      <dl className="bg-line border-line grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4">
        {(
          [
            [l.factWhat, m.what],
            [l.factFreq, m.freq],
            [l.factSize, m.size],
            [l.factDraw, m.draw],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="bg-surface min-w-0 px-3 py-2.5">
            <dt className="text-muted font-mono text-[11px] tracking-wider uppercase">{k}</dt>
            <dd className="text-ink m-0 mt-0.5 text-sm font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="text-ink m-0 max-w-[66ch]" aria-live="polite">
        {m.desc}
      </p>

      <div className="flex flex-wrap gap-1.5 font-mono text-xs">
        {meta.examples.map((s) => (
          <span key={s} className="border-line bg-surface text-ink rounded-md border px-2 py-0.5">
            {s}
          </span>
        ))}
      </div>

      <figcaption className="text-ink/75 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}</span> {l.caption}{' '}
        <span className="text-muted">{l.source}</span>
      </figcaption>
    </figure>
  )
}
