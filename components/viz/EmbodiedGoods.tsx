// components/viz/EmbodiedGoods.tsx
'use client'

import { useRef } from 'react'
import type * as ThreeNS from 'three'
import { CO2_M3_PER_KG, goods, t, type Lang } from '@/data/charts/carbon-basics-2'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { discSprite, makePoints, disposePoints } from './three-utils'
import VizFrame from './VizFrame'

const X_GAP = 2.6
const DIST = 24
const HEIGHT = 6
const LOOK_Y = 5
const labelRefs: (HTMLDivElement | null)[] = []

type Good = (typeof goods)[number]

/** 물건 실물 크기(m): [가로, 두께, 깊이]. 모두 바닥에 눕혀 놓은 대략치. */
const GOODS_SIZE: Record<Good['id'], [number, number, number]> = {
  laptop: [0.34, 0.02, 0.24],
  phone: [0.075, 0.008, 0.15],
  jeans: [0.4, 0.03, 0.5],
  shoes: [0.29, 0.11, 0.11],
  tshirt: [0.45, 0.01, 0.6],
}

interface Placed extends Good {
  x: number
  size: [number, number, number]
  makeKg: number
  useKg: number
  rMake: number
  rUse: number
}

/** 구름 반지름은 부분 kg의 CO2 부피 환산이라 물건 크기와 전혀 비례하지 않는다 */
function radiiOf(g: Good) {
  const makeKg = g.totalKg * (g.makePct / 100)
  const useKg = g.totalKg * (g.usePct / 100)
  return {
    makeKg,
    useKg,
    rMake: Math.cbrt(makeKg * CO2_M3_PER_KG) / 2,
    rUse: g.usePct > 0 ? Math.cbrt(useKg * CO2_M3_PER_KG) / 2 : 0,
  }
}

// 간격을 물건 크기로 잡으면 최대 1.9m짜리 구름들이 서로 겹쳐 한 덩어리 안개가 된다.
// 구름 반지름 기준으로 벌려야 다섯 덩어리가 각각의 물건에 달린 것으로 읽힌다.
const placed: Placed[] = (() => {
  const out: Placed[] = []
  let x = 0
  for (const g of goods) {
    const r = radiiOf(g)
    const half = Math.max(r.rMake, r.rUse)
    x += half
    out.push({ ...g, ...r, x, size: GOODS_SIZE[g.id] })
    x += half + X_GAP
  }
  return out
})()
const last = placed[placed.length - 1]
const totalWidth = last.x + Math.max(last.rMake, last.rUse)

/** 반지름 r 구 안에 n개 점을 부피 기준으로 고르게 채운다(입자 구름 모양) */
function spherePoints(n: number, r: number): Float32Array {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = Math.acos(2 * u - 1)
    const phi = 2 * Math.PI * v
    const rad = Math.cbrt(Math.random()) * r
    out[i * 3] = Math.sin(theta) * Math.cos(phi) * rad
    out[i * 3 + 1] = Math.cos(theta) * rad
    out[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * rad
  }
  return out
}

const build: SceneBuilder = (THREE, canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 100)
  const root = new THREE.Group()
  scene.add(root)
  const sprite = discSprite(THREE)

  const boxMat = new THREE.MeshBasicMaterial({ color: '#f4efe4' })
  const disposables: { dispose: () => void }[] = [boxMat, sprite]

  const clouds: {
    pts: ThreeNS.Points
    group: InstanceType<typeof THREE.Group>
    baseY: number
    phase: number
  }[] = []
  const anchors: { x: number; y: number }[] = []

  for (const [i, p] of placed.entries()) {
    const [w, h, d] = p.size
    const geo = new THREE.BoxGeometry(w, h, d)
    disposables.push(geo)
    const mesh = new THREE.Mesh(geo, boxMat)
    mesh.position.set(p.x, h / 2, 0)
    root.add(mesh)

    const { makeKg, useKg, rMake, rUse } = p

    const makePts = makePoints(THREE, spherePoints(Math.round(makeKg * 14), rMake), {
      size: 0.22,
      sprite,
      color: '#e6a760',
      opacity: 0.7,
      additive: true,
    })
    const makeGroup = new THREE.Group()
    const makeBaseY = 0.5 + rMake
    makeGroup.position.set(p.x, makeBaseY, 0)
    makeGroup.add(makePts)
    root.add(makeGroup)
    clouds.push({ pts: makePts, group: makeGroup, baseY: makeBaseY, phase: i * 1.7 })

    // 제조 구름 위에 사용 구름을 쌓는다. 나란히 놓으면 이웃 물건과 섞이고, 겹쳐 놓으면
    // 두 단계가 구분되지 않는다. 운동화(usePct 0)는 사용 구름 자체가 없다.
    let topY = makeBaseY + rMake
    if (p.usePct > 0) {
      const usePts = makePoints(THREE, spherePoints(Math.round(useKg * 14), rUse), {
        size: 0.22,
        sprite,
        color: '#a8bd74',
        opacity: 0.7,
        additive: true,
      })
      const useGroup = new THREE.Group()
      const useBaseY = topY + 0.5 + rUse
      useGroup.position.set(p.x, useBaseY, 0)
      useGroup.add(usePts)
      root.add(useGroup)
      clouds.push({ pts: usePts, group: useGroup, baseY: useBaseY, phase: i * 1.7 + 0.6 })
      topY = useBaseY + rUse
    }

    // 하나 걸러 한 칸씩 올려 이웃 라벨과 겹치지 않게 한다
    anchors.push({ x: p.x, y: topY + 0.5 + (i % 2 === 1 ? 1.8 : 0) })
  }

  let settled = false
  const v = new THREE.Vector3()
  const project = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    anchors.forEach((a, i) => {
      const el = labelRefs[i]
      if (!el) return
      v.set(a.x, a.y, 0).project(camera)
      const sx = (v.x * 0.5 + 0.5) * w
      const sy = (-v.y * 0.5 + 0.5) * h
      const visible = v.z < 1 && sx > -80 && sx < w + 80
      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`
      el.style.opacity = visible ? '1' : '0'
    })
  }

  return {
    // reduced-motion: 패닝 중앙 프레임으로 고정
    settle() {
      settled = true
    },
    render(ts, dt) {
      for (const c of clouds) {
        c.group.rotation.y += dt * 0.00012
        c.group.position.y = c.baseY + Math.sin(ts * 0.0006 + c.phase) * 0.05
      }
      // 다섯 덩어리를 한 프레임에 담은 채 아주 느리게만 흔든다. 옆으로 훑으면 물건 크기와
      // 구름 크기가 어긋난다는 이 장면의 요지를 한눈에 비교할 수 없다.
      const sway = settled ? 0 : Math.sin(ts * 0.00004) * 1.4
      const cx = totalWidth / 2
      camera.position.set(cx + DIST * 0.22 + sway, HEIGHT, DIST)
      camera.lookAt(cx, LOOK_Y, 0)
      renderer.render(scene, camera)
      project()
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposables.forEach((d) => d.dispose())
      clouds.forEach((c) => disposePoints(c.pts))
    },
  }
}

export default function EmbodiedGoods({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  return (
    <VizFrame
      title={L.goodsTitle}
      caption={L.goodsCaption}
      sourceLabel={L.source}
      sourceName={goods
        .map((g) => g.source.name)
        .filter((n, k, a) => n && a.indexOf(n) === k)
        .join(' · ')}
      status={status}
      canvasRef={canvasRef}
      aspect="16 / 9"
      overlay={
        <>
          {placed.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                labelRefs[i] = el
              }}
              className="absolute top-0 left-0 text-center font-mono text-[11px] leading-tight whitespace-nowrap text-[#f4efe4] opacity-0 transition-opacity"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
            >
              {/* 라벨이 넓으면 이웃과 겹친다. 제조/사용 비중은 쌓인 두 구름이 이미 보여
                  주므로 라벨에서는 빼고 폴백 표에만 숫자로 남긴다. */}
              <div>{L.goods[p.id]}</div>
              <div className="tabular-nums opacity-80">
                {p.totalKg} {L.kg}
              </div>
            </div>
          ))}
          <div
            className="absolute top-4 right-4 flex flex-col gap-1 font-mono text-[11px] text-[#f4efe4]"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: '#e6a760' }}
              />
              <span>{L.make}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: '#a8bd74' }}
              />
              <span>{L.use}</span>
            </div>
          </div>
        </>
      }
      fallback={{
        columns: [lang === 'ko' ? '물건' : 'Object', L.kg],
        rows: goods.map((g) => ({
          label: `${L.goods[g.id]} (${L.make} ${g.makePct}% · ${L.use} ${g.usePct}%)`,
          value: `${g.totalKg} ${L.kg}`,
        })),
        note: L.fallbackNote,
      }}
    />
  )
}
