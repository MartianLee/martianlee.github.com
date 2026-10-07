'use client'

import { Fragment, useEffect, useRef } from 'react'
import { SOURCE_URL, t, type Lang, type ThumbId } from '@/data/charts/passthrough-compositor'
import {
  H,
  SCENE,
  W,
  buildScene,
  renderAfterHaze,
  renderAfterOcclusion,
  renderAfterRelight,
  renderFinal,
  renderGui,
  renderHand,
  renderHazeMap,
  renderHostColor,
  renderHostDepth,
  renderLightMap,
  renderMcColor,
  renderMcDepth,
  renderOcclusionMask,
  type Scene,
} from './passthrough-scene'

/**
 * 패스스루 합성의 입력 레이어와 단계별 중간 결과를 정적 썸네일로 나열한다.
 * PassthroughCompositor와 같은 장면/수식(passthrough-scene.ts)을 쓰며, 마운트 때 한 번만 그린다.
 * 서버 렌더에서는 aspect-ratio 박스만 자리를 잡고 캔버스는 effect에서 채운다.
 */

const RENDERERS: Record<ThumbId, (sc: Scene, out: Uint8ClampedArray) => void> = {
  hostColor: renderHostColor,
  hostDepth: renderHostDepth,
  mcColor: renderMcColor,
  mcDepth: renderMcDepth,
  hand: renderHand,
  gui: renderGui,
  mask: renderOcclusionMask,
  afterOcc: renderAfterOcclusion,
  lightMap: renderLightMap,
  afterRelight: renderAfterRelight,
  hazeBg: renderHazeMap,
  afterHaze: renderAfterHaze,
  final: renderFinal,
}

interface Box {
  x0: number
  y0: number
  x1: number
  y1: number
}

// 관심 영역만 잘라 보여 준다 (176x99, 16:9).
const CROP = { x: 60, y: 30, w: 176, h: 99 }
const PAD = 4
const box = (x0: number, y0: number, w: number, h: number): Box => ({
  x0: Math.max(CROP.x, x0 - PAD),
  y0: Math.max(CROP.y, y0 - PAD),
  x1: Math.min(CROP.x + CROP.w, x0 + w + PAD),
  y1: Math.min(CROP.y + CROP.h, y0 + h + PAD),
})

const { stack, pillar, near, far } = SCENE
const stackSize = stack.cell * stack.n
const HL = {
  // 블록 더미가 기둥 뒤로 들어가는 영역
  overlap: box(stack.x0, stack.y0, pillar.x1 - stack.x0, stackSize),
  stack: box(stack.x0, stack.y0, stackSize, stackSize),
  near: box(near.x0, near.y0, near.size, near.size),
  far: box(far.x0, far.y0, far.size, far.size),
}

type Item = { id: ThumbId; hl?: Box[]; wide?: boolean } | string
const th = (id: ThumbId, hl?: Box[]): Item => ({ id, hl })

// 문자열은 썸네일 사이의 기호. 한 배열이 한 줄의 식이다 (sm+에서 썸네일 3칸).
const STEP_ROWS: Item[][][] = [
  [
    [th('mcDepth'), 'vs', th('hostDepth'), '→', th('mask', [HL.overlap])],
    [th('mcColor'), '×', th('mask', [HL.overlap]), '→', th('afterOcc', [HL.overlap])],
  ],
  [
    [th('hostColor'), '→', th('lightMap')],
    [th('afterOcc'), '×', th('lightMap'), '→', th('afterRelight', [HL.near, HL.stack])],
  ],
  [[th('hazeBg'), '+', th('afterRelight'), '→', th('afterHaze', [HL.far])]],
  [
    [th('afterHaze'), '+', th('hand'), '+', th('gui')],
    [th('hostColor'), 'over', { id: 'final', wide: true }],
  ],
]

export default function PassthroughLayers({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang].layers
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const sc = buildScene()
    const cache = new Map<ThumbId, Uint8ClampedArray>()
    root.querySelectorAll<HTMLCanvasElement>('canvas[data-layer]').forEach((cv) => {
      const id = cv.dataset.layer as ThumbId
      const ctx = cv.getContext('2d')
      if (!ctx) return
      let data = cache.get(id)
      if (!data) {
        data = new Uint8ClampedArray(W * H * 4)
        RENDERERS[id](sc, data)
        cache.set(id, data)
      }
      const img = ctx.createImageData(W, H)
      img.data.set(data)
      ctx.putImageData(img, -CROP.x, -CROP.y)
    })
  }, [])

  const thumb = (id: ThumbId, hl?: Box[]) => (
    <div className="min-w-0">
      <div
        className="border-line relative w-full overflow-hidden rounded-lg border"
        style={{ aspectRatio: '16 / 9', background: '#1b1a24' }}
      >
        <canvas
          data-layer={id}
          width={CROP.w}
          height={CROP.h}
          role="img"
          aria-label={l.thumbs[id]}
          className="block h-full w-full"
          style={{ imageRendering: 'pixelated' }}
        />
        {hl?.map((b, i) => (
          <div
            key={i}
            className="border-accent pointer-events-none absolute border-2 border-dashed"
            style={{
              left: `${((b.x0 - CROP.x) / CROP.w) * 100}%`,
              top: `${((b.y0 - CROP.y) / CROP.h) * 100}%`,
              width: `${((b.x1 - b.x0) / CROP.w) * 100}%`,
              height: `${((b.y1 - b.y0) / CROP.h) * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="text-muted mt-1 text-xs leading-tight">{l.thumbs[id]}</div>
    </div>
  )

  const group = (label: string, color: string, ids: ThumbId[], cols: string) => (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold">
        <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        {label}
      </div>
      <div className={`grid gap-2 ${cols}`}>
        {ids.map((id) => (
          <Fragment key={id}>{thumb(id)}</Fragment>
        ))}
      </div>
    </div>
  )

  const sectionLabel = 'text-muted mb-3 text-xs font-semibold tracking-wide uppercase'

  return (
    <figure ref={rootRef} className="my-8">
      <div className="border-line bg-surface rounded-2xl border p-4 sm:p-5">
        <div className={sectionLabel}>{l.inputs}</div>
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          {group(l.erGroup, '#b8a27a', ['hostColor', 'hostDepth'], 'grid-cols-2')}
          {group(
            l.mcGroup,
            '#5fa83a',
            ['mcColor', 'mcDepth', 'hand', 'gui'],
            'grid-cols-2 sm:grid-cols-4'
          )}
        </div>

        <div className={`${sectionLabel} mt-6`}>{l.steps}</div>
        <ol className="m-0 flex list-none flex-col p-0">
          {l.step.map((s, n) => (
            <li
              key={s.badge}
              className="border-line grid gap-3 border-t py-4 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:gap-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-accent inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm leading-none text-white">
                    {s.badge}
                  </span>
                  <span className="text-sm font-bold">{s.title}</span>
                </div>
                <code className="text-muted mt-2 block font-mono text-[11px] leading-snug break-words">
                  {s.formula}
                </code>
                <p className="text-ink/80 mt-2 text-sm leading-relaxed">{s.result}</p>
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                {STEP_ROWS[n].map((row, r) => (
                  <div
                    key={r}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-x-1.5"
                  >
                    {row.map((it, k) =>
                      typeof it === 'string' ? (
                        <span
                          key={k}
                          className="text-muted hidden px-0.5 pt-5 text-sm sm:block"
                          aria-hidden="true"
                        >
                          {it}
                        </span>
                      ) : (
                        <div
                          key={k}
                          className={it.wide ? 'col-span-2 min-w-0 sm:col-span-3' : 'min-w-0'}
                        >
                          {thumb(it.id, it.hl)}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <figcaption className="text-ink/75 mt-3 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}</span> {l.caption}{' '}
        <span className="text-muted">
          {t[lang].source}:{' '}
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            {t[lang].sourceName}
          </a>
        </span>
      </figcaption>

      <div className="sr-only">
        <ol>
          {l.srAlt.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </div>
    </figure>
  )
}
