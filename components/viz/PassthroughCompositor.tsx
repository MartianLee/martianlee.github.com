'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { SOURCE_URL, t, type Lang } from '@/data/charts/passthrough-compositor'
import { H, W, buildScene, composite } from './passthrough-scene'

/**
 * 패스스루 합성을 토글로 직접 켜고 끄는 시각화.
 * 장면과 수식은 passthrough-scene.ts에 있고, 여기서는 토글이 바뀔 때만 다시 합성한다.
 * 애니메이션 루프는 없다.
 */

interface Flags {
  occlusion: boolean
  relight: boolean
  haze: boolean
  depth: boolean
}

export default function PassthroughCompositor({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang]
  const [flags, setFlags] = useState<Flags>({
    occlusion: true,
    relight: true,
    haze: true,
    depth: false,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 장면은 한 번만 만들고, 토글이 바뀔 때마다 합성만 다시 돌린다.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(W, H)
    composite(buildScene(), { ...flags, depthView: flags.depth }, img.data)
    ctx.putImageData(img, 0, 0)
  }, [flags])

  const { occlusion, relight, haze, depth } = flags
  const allOn = occlusion && relight && haze
  const allOff = !occlusion && !relight && !haze

  const explanation = useMemo(() => {
    if (depth) return l.depthOn
    return [
      occlusion ? l.occlusionOn : l.occlusionOff,
      relight ? l.relightOn : l.relightOff,
      haze ? l.hazeOn : l.hazeOff,
    ].join(' ')
  }, [l, occlusion, relight, haze, depth])

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
      on ? 'border-accent bg-accent text-white' : 'border-line text-ink hover:bg-line/60'
    }`

  const toggles: { key: keyof Flags; label: string }[] = [
    { key: 'occlusion', label: l.occlusion },
    { key: 'relight', label: l.relight },
    { key: 'haze', label: l.haze },
    { key: 'depth', label: l.depth },
  ]

  return (
    <figure className="my-8">
      <div className="border-line bg-surface rounded-2xl border p-3 sm:p-5">
        <div
          className="w-full overflow-hidden rounded-lg"
          style={{ aspectRatio: '16 / 9', background: '#1b1a24' }}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            role="img"
            aria-label={`${l.canvasPrefix} ${explanation}`}
            className="block h-full w-full"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div role="group" aria-label={l.presetGroup} className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={allOff}
              className={chip(allOff)}
              onClick={() =>
                setFlags((s) => ({ ...s, occlusion: false, relight: false, haze: false }))
              }
            >
              {l.presetOverlay}
            </button>
            <button
              type="button"
              aria-pressed={allOn}
              className={chip(allOn)}
              onClick={() =>
                setFlags((s) => ({ ...s, occlusion: true, relight: true, haze: true }))
              }
            >
              {l.presetPassthrough}
            </button>
          </div>
          <div role="group" aria-label={l.toggleGroup} className="flex flex-wrap gap-2">
            {toggles.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={flags[key]}
                className={chip(flags[key])}
                onClick={() => setFlags((s) => ({ ...s, [key]: !s[key] }))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-ink/80 mt-3 text-sm leading-relaxed" aria-live="polite">
          {explanation}
        </p>
      </div>

      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}</span> {l.caption}{' '}
        <span className="text-muted">
          {l.source}:{' '}
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            {l.sourceName}
          </a>
        </span>
      </figcaption>

      <div className="sr-only">
        {l.srAlt.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </figure>
  )
}
