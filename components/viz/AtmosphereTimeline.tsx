// components/viz/AtmosphereTimeline.tsx
'use client'

import { useMemo, useRef, useState } from 'react'
import { co2Annual, t, type Lang } from '@/data/charts/carbon-basics-1'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { buildEarthScene } from './earthScene'
import VizFrame from './VizFrame'

const series = co2Annual.series
const FIRST = series[0][0]
const LAST = series[series.length - 1][0]
const MAX_PPM = series[series.length - 1][1]
const CYCLE_MS = 14000
const HOLD_MS = 3000

/** 렌더 루프와 React 사이의 공유 상태(리렌더 없이 매 프레임 읽음) */
interface Shared {
  year: number
  playing: boolean
  t0: number
  onYear?: (y: number) => void
}
const shared: Shared = { year: FIRST, playing: true, t0: 0 }

function ppmOf(year: number): number {
  const row = series.find((r) => r[0] === year) ?? series[series.length - 1]
  return row[1]
}
function levelOf(year: number): number {
  return (ppmOf(year) - co2Annual.preindustrial) / (MAX_PPM - co2Annual.preindustrial)
}

const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const earth = buildEarthScene(THREE, { cameraZ: 4.4, hazeCount: 3200 })
  earth.setHazeLevel(levelOf(shared.year))
  let lastYear = shared.year
  return {
    render(ts) {
      if (shared.playing) {
        if (!shared.t0) shared.t0 = ts
        const el = (ts - shared.t0) % (CYCLE_MS + HOLD_MS)
        const p = Math.min(1, el / CYCLE_MS)
        shared.year = Math.round(FIRST + p * (LAST - FIRST))
      }
      if (shared.year !== lastYear) {
        lastYear = shared.year
        earth.setHazeLevel(levelOf(shared.year))
        shared.onYear?.(shared.year)
      }
      earth.render(renderer, ts)
    },
    resize: earth.resize,
    dispose: earth.dispose,
  }
}

export default function AtmosphereTimeline({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [year, setYear] = useState(FIRST)
  const [playing, setPlaying] = useState(true)
  shared.onYear = setYear
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  const ppm = useMemo(() => ppmOf(year), [year])

  const scrub = (y: number) => {
    shared.playing = false
    shared.year = y
    setPlaying(false)
    setYear(y)
  }
  const toggle = () => {
    const next = !playing
    shared.playing = next
    if (next) shared.t0 = 0
    setPlaying(next)
  }

  return (
    <VizFrame
      title={L.timelineTitle}
      caption={L.timelineCaption}
      sourceLabel={L.source}
      sourceName={`${co2Annual.source.name}, ${co2Annual.source.year}`}
      sourceUrl={co2Annual.source.url}
      status={status}
      canvasRef={canvasRef}
      aspect="1 / 1"
      overlay={
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 text-[#f4efe4]">
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-bold tabular-nums">{year}</span>
            <span className="text-xl tabular-nums">
              {ppm.toFixed(1)} <span className="text-sm opacity-80">{L.ppm}</span>
            </span>
          </div>
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="rounded-full border border-[rgba(244,239,228,.4)] px-3 py-1 font-mono text-[11px] tracking-wide uppercase"
            >
              {playing ? L.pause : L.play}
            </button>
            <input
              type="range"
              min={FIRST}
              max={LAST}
              value={year}
              onChange={(e) => scrub(Number(e.target.value))}
              aria-label={L.year}
              className="w-full accent-[#e6a760]"
            />
          </div>
          <div className="font-mono text-[10.5px] tracking-wide uppercase opacity-70">
            {L.preindustrial}
          </div>
        </div>
      }
      fallback={{
        columns: [L.year, L.ppm],
        rows: series
          .filter((r) => r[0] % 10 === 0 || r[0] === LAST)
          .map((r) => ({ label: String(r[0]), value: r[1].toFixed(1) })),
        note: L.fallbackNote,
      }}
    />
  )
}
