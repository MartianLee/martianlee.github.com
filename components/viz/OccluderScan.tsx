'use client'

import { useEffect, useRef } from 'react'
import { measured, occluderText as T, sourceName, type Lang } from '@/data/charts/pungsu-stutter'

const O = measured.occluders
const KIND_COLORS: Record<string, string> = { t: '#4d7c3a', r: '#8a8178', p: '#b7a24a' }

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

function setup(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1
  const { width, height } = canvas.getBoundingClientRect()
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  return ctx
}

/** 왼쪽: 7×7 청크 전체 밀도, 모두 확인 대상. */
function drawWhole(canvas: HTMLCanvasElement) {
  const ctx = setup(canvas)
  if (!ctx) return
  const size = canvas.getBoundingClientRect().width
  const cell = size / O.cols
  const maxCount = Math.max(...O.density)
  const accent = cssVar('--accent')
  ctx.fillStyle = accent
  O.density.forEach((n, i) => {
    if (n === 0) return
    ctx.globalAlpha = 0.18 + 0.82 * Math.sqrt(n / maxCount)
    ctx.fillRect((i % O.cols) * cell, Math.floor(i / O.cols) * cell, cell + 0.4, cell + 0.4)
  })
  ctx.globalAlpha = 1
  // chunk grid
  ctx.strokeStyle = cssVar('--line')
  ctx.lineWidth = 1
  for (let c = 0; c <= 7; c++) {
    const p = (c * size) / 7
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, size)
    ctx.moveTo(0, p)
    ctx.lineTo(size, p)
    ctx.stroke()
  }
  // zoom window and the hero
  const span = O.cols * O.cell
  const toPx = (v: number, o: number) => ((v - o) / span) * size
  const hx = toPx(O.player[0], O.origin[0])
  const hy = toPx(O.player[1], O.origin[1])
  const r = (O.localRadius / span) * size
  ctx.strokeStyle = cssVar('--ink')
  ctx.setLineDash([3, 2])
  ctx.strokeRect(hx - r, hy - r, r * 2, r * 2)
  ctx.setLineDash([])
  ctx.fillStyle = cssVar('--ink')
  ctx.beginPath()
  ctx.arc(hx, hy, 3, 0, Math.PI * 2)
  ctx.fill()
}

/** 오른쪽: 주인공 주변 확대, 128px 칸과 확인하는 3×3칸. */
function drawNear(canvas: HTMLCanvasElement) {
  const ctx = setup(canvas)
  if (!ctx) return
  const size = canvas.getBoundingClientRect().width
  const R = O.localRadius
  const s = size / (R * 2)
  const at = (v: number) => (v + R) * s
  const accent = cssVar('--accent')
  // the 3x3 buckets the fader checks
  const [bx, by] = O.bucketOrigin
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.16
  ctx.fillRect(at(bx - O.bucket), at(by - O.bucket), O.bucket * 3 * s, O.bucket * 3 * s)
  ctx.globalAlpha = 1
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  ctx.strokeRect(at(bx - O.bucket), at(by - O.bucket), O.bucket * 3 * s, O.bucket * 3 * s)
  // bucket grid
  ctx.strokeStyle = cssVar('--line')
  ctx.lineWidth = 1
  for (let v = bx - O.bucket * 6; v <= R; v += O.bucket) {
    ctx.beginPath()
    ctx.moveTo(at(v), 0)
    ctx.lineTo(at(v), size)
    ctx.stroke()
  }
  for (let v = by - O.bucket * 6; v <= R; v += O.bucket) {
    ctx.beginPath()
    ctx.moveTo(0, at(v))
    ctx.lineTo(size, at(v))
    ctx.stroke()
  }
  const inBox = (x: number, y: number) =>
    x >= bx - O.bucket && x < bx + 2 * O.bucket && y >= by - O.bucket && y < by + 2 * O.bucket
  for (const [x, y, k] of O.local) {
    ctx.fillStyle = KIND_COLORS[k] ?? '#999'
    ctx.beginPath()
    ctx.arc(at(x), at(y), inBox(x, y) ? 5 : 3.5, 0, Math.PI * 2)
    ctx.fill()
    if (inBox(x, y)) {
      ctx.strokeStyle = accent
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
  ctx.fillStyle = cssVar('--ink')
  ctx.beginPath()
  ctx.arc(at(0), at(0), 5, 0, Math.PI * 2)
  ctx.fill()
}

export default function OccluderScan({ lang = 'ko' }: { lang?: Lang }) {
  const whole = useRef<HTMLCanvasElement>(null)
  const near = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const draw = () => {
      if (whole.current) drawWhole(whole.current)
      if (near.current) drawNear(near.current)
    }
    draw()
    const ro = new ResizeObserver(draw)
    if (whole.current) ro.observe(whole.current)
    const mo = new MutationObserver(draw) // light/dark theme switch
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [])
  const fmt = (n: number) => n.toLocaleString('en-US')
  return (
    <figure className="my-8">
      <div className="border-line bg-surface grid gap-5 rounded-2xl border p-5 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-bold">{T.before[lang]}</div>
          <canvas
            ref={whole}
            aria-hidden="true"
            className="border-line aspect-square w-full rounded border"
          />
          <div className="mt-2 flex items-baseline justify-between text-xs">
            <span className="text-muted">
              <i className="border-ink mr-1 inline-block h-2.5 w-2.5 border border-dashed align-middle" />
              {T.zoom[lang]}
            </span>
            <span>
              {T.checked[lang]}{' '}
              <b className="text-accent font-mono text-base tabular-nums">{fmt(O.total)}</b>
            </span>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-bold">{T.after[lang]}</div>
          <canvas
            ref={near}
            aria-hidden="true"
            className="border-line aspect-square w-full rounded border"
          />
          <div className="mt-2 flex items-baseline justify-between text-xs">
            <span className="text-muted flex flex-wrap gap-x-3">
              {(['t', 'r', 'p'] as const).map((k) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <i
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: KIND_COLORS[k] }}
                  />
                  {T.kinds[k][lang]}
                </span>
              ))}
              <span className="inline-flex items-center gap-1">
                <i className="bg-ink inline-block h-2.5 w-2.5 rounded-full" />
                {T.hero[lang]}
              </span>
            </span>
            <span className="whitespace-nowrap">
              {T.checked[lang]}{' '}
              <b className="text-accent font-mono text-base tabular-nums">{O.near}</b>
            </span>
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
            <tr>
              <td>{T.before[lang]}</td>
              <td>{fmt(O.total)}</td>
            </tr>
            <tr>
              <td>{T.after[lang]}</td>
              <td>{O.near}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </figure>
  )
}
