'use client'

import { useRef } from 'react'
import { gasMix, t, type Lang } from '@/data/charts/carbon-basics-1'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { discSprite, makePoints, disposePoints } from './three-utils'
import VizFrame from './VizFrame'

const COUNT = 1800

const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 100)
  camera.position.set(0, 0.6, 4.2)
  camera.lookAt(0, 0, 0)
  const sprite = discSprite(THREE)
  const root = new THREE.Group()
  scene.add(root)

  // 가스별 경도 구간: share에 비례한 각도 폭. 조각 사이 2도 틈.
  const pos = new Float32Array(COUNT * 3)
  const col = new Float32Array(COUNT * 3)
  const total = gasMix.shares.reduce((s, g) => s + g.share, 0)
  const gap = (2 * Math.PI) / 180
  let start = 0
  let idx = 0
  let allocated = 0
  for (const [i, g] of gasMix.shares.entries()) {
    // 마지막 조각이 반올림 잔여를 흡수해 원점에 빈 슬롯이 남지 않게 한다
    const n =
      i === gasMix.shares.length - 1 ? COUNT - allocated : Math.round((g.share / total) * COUNT)
    allocated += n
    const width = (g.share / total) * 2 * Math.PI - gap
    const c = new THREE.Color(g.color)
    for (let k = 0; k < n && idx < COUNT; k++, idx++) {
      const a = start + Math.random() * width
      const r = 0.55 + Math.sqrt(Math.random()) * 0.95
      const y = (Math.random() - 0.5) * 0.7 * (1 - (r - 0.55) / 1.4)
      pos[idx * 3] = Math.cos(a) * r
      pos[idx * 3 + 1] = y
      pos[idx * 3 + 2] = Math.sin(a) * r
      col[idx * 3] = c.r
      col[idx * 3 + 1] = c.g
      col[idx * 3 + 2] = c.b
    }
    start += width + gap
  }
  const cloud = makePoints(THREE, pos, {
    size: 0.075,
    sprite,
    vertexColors: col,
    opacity: 0.9,
    additive: true,
  })
  root.add(cloud)
  root.rotation.x = 0.35

  return {
    render(ts) {
      root.rotation.y = ts * 0.00012
      renderer.render(scene, camera)
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposePoints(cloud)
      sprite.dispose()
    },
  }
}

export default function GasMixCloud({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  return (
    <VizFrame
      title={L.gasTitle}
      caption={L.gasCaption}
      sourceLabel={L.source}
      sourceName={`${gasMix.source.name}, ${gasMix.source.year}`}
      sourceUrl={gasMix.source.url}
      status={status}
      canvasRef={canvasRef}
      overlay={
        <ul className="absolute bottom-4 left-4 m-0 flex list-none flex-col gap-1 p-0 font-mono text-[12px] text-[#f4efe4]">
          {gasMix.shares.map((g) => (
            <li key={g.id} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: g.color }}
              />
              <span>{L.gas[g.id]}</span>
              <span className="tabular-nums opacity-80">{g.share}%</span>
            </li>
          ))}
        </ul>
      }
      fallback={{
        columns: [lang === 'ko' ? '가스' : 'Gas', '%'],
        rows: gasMix.shares.map((g) => ({ label: L.gas[g.id], value: `${g.share}%` })),
        note: L.fallbackNote,
      }}
    />
  )
}
