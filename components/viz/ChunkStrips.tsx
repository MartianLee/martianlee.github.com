'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  measured,
  schedule,
  sourceName,
  stripCosts,
  stripText as T,
  type Lang,
} from '@/data/charts/pungsu-stutter'

const C = measured.chunk
const GROUND: Record<string, string> = { g: '#7da453', w: '#4f86a8', f: '#3f6a34' }
const PROP: Record<string, string> = { t: '#1f3a18', r: '#cfc8bd', p: '#e8cf4f' }
const FRAME_MS = 420 // playback speed: one game frame per this many real ms
const BAR_MAX = 55 // ms

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

function drawChunk(canvas: HTMLCanvasElement, rows: number, cols: number) {
  const dpr = window.devicePixelRatio || 1
  const { width } = canvas.getBoundingClientRect()
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(width * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const cell = width / 64
  ctx.fillStyle = cssVar('--line')
  ctx.fillRect(0, 0, width, width)
  for (let y = 0; y < rows; y++) {
    const row = C.cells[y]
    for (let x = 0; x < 64; x++) {
      ctx.fillStyle = GROUND[row[x]] ?? '#777'
      ctx.fillRect(x * cell, y * cell, cell + 0.3, cell + 0.3)
    }
  }
  for (const [x, y, k] of C.props) {
    if (x >= cols) continue
    ctx.fillStyle = PROP[k] ?? '#000'
    ctx.strokeStyle = 'rgba(20, 16, 10, 0.75)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(
      (x + 0.5) * cell,
      (y + 0.5) * cell,
      k === 't' ? cell * 1.1 : cell * 0.65,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.stroke()
  }
  // the strip being worked on
  ctx.strokeStyle = cssVar('--accent')
  ctx.lineWidth = 2
  if (rows > 0 && rows < 64) ctx.strokeRect(1, (rows - 4) * cell, width - 2, 4 * cell)
  else if (rows === 64 && cols > 0 && cols < 64)
    ctx.strokeRect((cols - 4) * cell, 1, 4 * cell, width - 2)
}

export default function ChunkStrips({ lang = 'ko' }: { lang?: Lang }) {
  const [after, setAfter] = useState(true)
  const frames = useMemo(() => schedule(after), [after])
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(true)
  const canvas = useRef<HTMLCanvasElement>(null)
  const f = frames[Math.min(i, frames.length - 1)]

  useEffect(() => setI(0), [after])
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(
      () => setI((v) => (v + 1 >= frames.length + 3 ? 0 : v + 1)), // hold the last frame a moment
      after ? FRAME_MS : FRAME_MS * 4
    )
    return () => window.clearInterval(id)
  }, [playing, frames.length, after])
  useEffect(() => {
    const draw = () => canvas.current && drawChunk(canvas.current, f.rows, f.cols)
    draw()
    const ro = new ResizeObserver(draw)
    if (canvas.current) ro.observe(canvas.current)
    const mo = new MutationObserver(draw)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [f.rows, f.cols])

  const current = Math.min(i, frames.length - 1)
  const total = (fr: (typeof frames)[number]) => stripCosts.baseFrame + fr.script + fr.engine
  const longest = Math.max(...frames.map(total))
  const readout = (() => {
    const r = T.readout
    if (f.label === 'whole') return r.whole[lang]
    if (f.label === 'engine') return r.engine[lang]
    if (f.label === 'monsters') return r.monsters[lang]
    if (f.label === 'props') return r.props[lang].replace('{n}', String(f.cols))
    return r.terrain[lang].replace('{n}', String(f.rows))
  })()

  // frame bars
  const BW = 720
  const BH = 170
  const barW = Math.min(24, (BW - 50) / frames.length - 4)
  const y = (ms: number) => BH - 16 - (Math.min(ms, BAR_MAX) / BAR_MAX) * (BH - 26)

  return (
    <figure className="my-8">
      <div className="border-line bg-surface rounded-2xl border p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {[false, true].map((a) => (
            <button
              key={String(a)}
              type="button"
              onClick={() => setAfter(a)}
              className={`rounded-full border px-3 py-1 text-xs ${
                a === after
                  ? 'border-accent bg-accent text-white'
                  : 'border-line text-muted hover:text-ink'
              }`}
            >
              {a ? T.modeAfter[lang] : T.modeBefore[lang]}
            </button>
          ))}
        </div>
        <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,15rem)_1fr]">
          <div>
            <canvas
              ref={canvas}
              aria-hidden="true"
              className="border-line aspect-square w-full rounded border"
            />
            <div className="text-muted mt-2 flex flex-wrap gap-x-3 text-[11px]">
              {(['g', 'w', 'f'] as const).map((k) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <i className="inline-block h-2.5 w-2.5" style={{ background: GROUND[k] }} />
                  {T.colors[k][lang]}
                </span>
              ))}
              {(['t', 'r', 'p'] as const).map((k) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <i
                    className="inline-block h-2.5 w-2.5 rounded-full border border-black/60"
                    style={{ background: PROP[k] }}
                  />
                  {T.props[k][lang]}
                </span>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-1 font-mono text-2xl tabular-nums">
              {T.frame[lang]} {current + 1}/{frames.length}{' '}
              <b className={total(f) > 33.3 ? 'text-accent' : ''}>{total(f).toFixed(1)}ms</b>
            </div>
            <div className="text-muted mb-4 text-sm">{readout}</div>
            <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div className="border-line rounded-lg border p-3">
                <dt className="text-muted text-xs">{T.count[lang]}</dt>
                <dd className="font-mono text-lg tabular-nums">{frames.length}</dd>
              </div>
              <div className="border-line rounded-lg border p-3">
                <dt className="text-muted text-xs">{T.longest[lang]}</dt>
                <dd
                  className={`font-mono text-lg tabular-nums ${longest > 33.3 ? 'text-accent' : ''}`}
                >
                  {longest.toFixed(1)}ms
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="border-line hover:text-accent rounded-full border px-3 py-1 font-mono text-[11px] uppercase"
              >
                {playing ? T.pause[lang] : T.play[lang]}
              </button>
              <input
                type="range"
                min={0}
                max={frames.length - 1}
                value={current}
                onChange={(e) => {
                  setPlaying(false)
                  setI(Number(e.target.value))
                }}
                aria-label={T.slider[lang]}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          </div>
        </div>
        <div className="-mx-1 mt-5 overflow-x-auto px-1">
          <svg
            viewBox={`0 0 ${BW} ${BH}`}
            className="w-full min-w-[540px]"
            role="img"
            aria-label={T.title[lang]}
          >
            <line
              x1={40}
              x2={BW}
              y1={y(16.7)}
              y2={y(16.7)}
              stroke="var(--accent)"
              strokeDasharray="4 3"
            />
            <text x={BW} y={y(16.7) - 4} textAnchor="end" className="fill-accent text-[10px]">
              {T.budget[lang]}
            </text>
            {[0, 25, 50].map((ms) => (
              <text
                key={ms}
                x={34}
                y={y(ms) + 3}
                textAnchor="end"
                className="fill-muted text-[10px]"
              >
                {ms}
              </text>
            ))}
            {frames.map((fr, k) => {
              const x = 46 + k * (barW + 4)
              const parts = [
                { v: stripCosts.baseFrame, c: 'var(--line)' },
                { v: fr.script, c: 'var(--ink)' },
                { v: fr.engine, c: 'var(--accent)' },
              ]
              let acc = 0
              return (
                <g
                  key={k}
                  opacity={k <= current ? 1 : 0.25}
                  onClick={() => {
                    setPlaying(false)
                    setI(k)
                  }}
                  className="cursor-pointer"
                >
                  {parts.map((p, j) => {
                    const top = y(acc + p.v)
                    const bottom = y(acc)
                    acc += p.v
                    return (
                      <rect
                        key={j}
                        x={x}
                        y={top}
                        width={barW}
                        height={Math.max(0, bottom - top)}
                        fill={p.c}
                        fillOpacity={j === 1 ? 0.7 : 1}
                      />
                    )
                  })}
                  {k === current && (
                    <rect
                      x={x - 1.5}
                      y={4}
                      width={barW + 3}
                      height={BH - 18}
                      fill="none"
                      stroke="var(--ink)"
                    />
                  )}
                </g>
              )
            })}
            <line x1={40} x2={BW} y1={BH - 16} y2={BH - 16} stroke="var(--muted)" />
          </svg>
          <div className="text-muted mt-1 flex flex-wrap gap-x-4 text-[11px]">
            {(
              [
                ['base', 'var(--line)'],
                ['script', 'var(--ink)'],
                ['engine', 'var(--accent)'],
              ] as const
            ).map(([k, c]) => (
              <span key={k} className="inline-flex items-center gap-1">
                <i
                  className="inline-block h-2.5 w-2.5"
                  style={{ background: c, opacity: k === 'script' ? 0.7 : 1 }}
                />
                {T.legend[k][lang]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{T.title[lang]}.</span> {T.caption[lang]}{' '}
        <span className="text-muted">{sourceName[lang]}</span>
      </figcaption>
      <div className="sr-only">
        <table>
          <tbody>
            {[false, true].map((a) => {
              const fs = schedule(a)
              return (
                <tr key={String(a)}>
                  <td>{a ? T.modeAfter[lang] : T.modeBefore[lang]}</td>
                  <td>
                    {fs.length} {T.frame[lang]}, max{' '}
                    {Math.max(
                      ...fs.map((fr) => stripCosts.baseFrame + fr.script + fr.engine)
                    ).toFixed(1)}
                    ms
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
