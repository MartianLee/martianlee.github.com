'use client'

import type { ReactNode, RefObject } from 'react'
import type { VizStatus } from './useThreeScene'

export interface FallbackRow {
  label: string
  value: string
}

interface Props {
  title: string
  caption: string
  sourceLabel: string
  sourceName: string
  sourceUrl?: string
  status: VizStatus
  canvasRef: RefObject<HTMLCanvasElement | null>
  /** 캔버스 위에 얹는 HTML(범례, 숫자, 컨트롤). pointer-events는 자식이 직접 켠다. */
  overlay?: ReactNode
  /** 3D 불가 시 보여줄 표(라이브 상태에서는 sr-only) */
  fallback: { columns: [string, string]; rows: FallbackRow[]; note: string }
  /** 캔버스 가로:세로. 기본 16/10 */
  aspect?: string
}

const SCENE_BG = 'radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)'

export default function VizFrame({
  title,
  caption,
  sourceLabel,
  sourceName,
  sourceUrl,
  status,
  canvasRef,
  overlay,
  fallback,
  aspect = '16 / 10',
}: Props) {
  const showCanvas = status === 'live' || status === 'static'
  const failed = status === 'failed'
  return (
    <figure className="my-8">
      <div
        className="border-line relative w-full overflow-hidden rounded-2xl border"
        style={{ aspectRatio: aspect, background: SCENE_BG }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${showCanvas ? 'opacity-100' : 'opacity-0'}`}
        />
        {overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}
        {failed && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-[#e9ddc9]">
            {fallback.note}
          </div>
        )}
      </div>
      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{title}.</span> {caption}{' '}
        <span className="text-muted">
          {sourceLabel}:{' '}
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {sourceName}
            </a>
          ) : (
            sourceName
          )}
        </span>
      </figcaption>
      <table className={failed ? 'mt-4 w-full text-sm' : 'sr-only'}>
        <thead>
          <tr>
            <th className="text-left">{fallback.columns[0]}</th>
            <th className="text-right">{fallback.columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {fallback.rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className="text-right tabular-nums">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
