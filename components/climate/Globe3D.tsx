'use client'

import { useRef } from 'react'
import { useThreeScene, type SceneBuilder } from '@/components/viz/useThreeScene'
import { buildEarthScene } from '@/components/viz/earthScene'

/**
 * Hero 3D panel: fibonacci particle Earth with an amber CO₂ haze shell.
 * three.js loads lazily inside useThreeScene; the static gradient + rings stay
 * as the fallback (reduced-motion renders one frame, failure keeps the panel).
 */
const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const earth = buildEarthScene(THREE)
  return {
    render: (ts) => earth.render(renderer, ts),
    resize: earth.resize,
    dispose: earth.dispose,
  }
}

export default function Globe3D({ caption }: { caption: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const live = status === 'live' || status === 'static'
  return (
    <div
      className="border-line relative aspect-square overflow-hidden rounded-2xl border shadow-[0_24px_60px_-28px_rgba(120,48,21,.55)] dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,.7)]"
      style={{
        background:
          'radial-gradient(circle at 38% 34%, #c98b54 0%, #a8431f 34%, #5b2a12 72%, #2c160a 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background:
            'radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)',
        }}
      />
      <div
        className={`absolute inset-[14%] rounded-full border border-dashed border-[rgba(244,239,228,.35)] transition-opacity duration-700 ${live ? 'opacity-0' : ''}`}
      />
      <div
        className={`absolute inset-[26%] rounded-full border border-dashed border-[rgba(244,239,228,.35)] transition-opacity duration-700 ${live ? 'opacity-0' : ''}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`}
      />
      <p
        className="absolute right-3.5 bottom-3 left-3.5 text-[11.5px] leading-snug text-[#f4efe4]"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,.45)' }}
      >
        {caption}
      </p>
    </div>
  )
}
