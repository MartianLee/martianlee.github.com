// components/viz/TonneCubes.tsx
'use client'

import { useRef } from 'react'
import { CO2_M3_PER_KG, t, tonneItems, type Lang } from '@/data/charts/carbon-basics-1'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import VizFrame from './VizFrame'

const GAP = 3
const labelRefs: (HTMLDivElement | null)[] = []

interface Placed {
  id: string
  size: number
  x: number
  kg: number
}

function place(): Placed[] {
  const out: Placed[] = []
  let x = 0
  for (const item of tonneItems) {
    const size = Math.cbrt(Math.abs(item.kg) * CO2_M3_PER_KG)
    x += size / 2
    out.push({ id: item.id, size, x, kg: item.kg })
    x += size / 2 + GAP
  }
  return out
}
const placed = place()
const totalWidth = placed[placed.length - 1].x + placed[placed.length - 1].size / 2

const build: SceneBuilder = (THREE, canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1.6, 0.1, 400)
  const root = new THREE.Group()
  scene.add(root)

  const grid = new THREE.GridHelper(400, 80, '#5b3a1c', '#3a2413')
  grid.position.y = 0
  root.add(grid)

  const cubeMat = new THREE.MeshBasicMaterial({
    color: '#e6a760',
    transparent: true,
    opacity: 0.22,
  })
  const edgeMat = new THREE.LineBasicMaterial({
    color: '#f4efe4',
    transparent: true,
    opacity: 0.55,
  })
  const absorbMat = new THREE.LineBasicMaterial({
    color: '#a8bd74',
    transparent: true,
    opacity: 0.9,
  })
  const refMat = new THREE.MeshBasicMaterial({ color: '#f4efe4', transparent: true, opacity: 0.85 })
  const disposables: { dispose: () => void }[] = [cubeMat, edgeMat, absorbMat, refMat]
  const anchors: { obj: InstanceType<typeof THREE.Object3D>; y: number }[] = []

  for (const p of placed) {
    const geo = new THREE.BoxGeometry(p.size, p.size, p.size)
    disposables.push(geo)
    const edges = new THREE.EdgesGeometry(geo)
    disposables.push(edges)
    const group = new THREE.Group()
    group.position.set(p.x, p.size / 2, 0)
    if (p.kg >= 0) group.add(new THREE.Mesh(geo, cubeMat))
    group.add(new THREE.LineSegments(edges, p.kg >= 0 ? edgeMat : absorbMat))
    root.add(group)
    // 작은 큐브 4개는 붙어 있어 라벨을 2 m 간격 사다리로 올려 겹치지 않게 한다
    anchors.push({
      obj: group,
      y: p.size / 2 + 0.8 + (anchors.length < 4 ? anchors.length * 2.0 : 0),
    })
  }

  // 기준 물체: 사람(1.7 m)과 자동차, 1 t 큐브 앞에
  const tonne = placed.find((p) => p.id === 'tonne') ?? placed[placed.length - 1]
  const human = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.26, 4, 8), refMat)
  human.position.set(tonne.x - tonne.size / 2 - 1.2, 0.85, 1.6)
  const car = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.5, 1.8), refMat)
  car.position.set(tonne.x - tonne.size / 2 - 4.6, 0.75, 1.6)
  disposables.push(human.geometry, car.geometry)
  root.add(human, car)
  anchors.push({ obj: human, y: 2.6 }, { obj: car, y: 1.2 })

  const v = new THREE.Vector3()
  const project = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    anchors.forEach((a, i) => {
      const el = labelRefs[i]
      if (!el) return
      v.set(a.obj.position.x, a.obj.position.y + a.y, a.obj.position.z).project(camera)
      const sx = (v.x * 0.5 + 0.5) * w
      const sy = (-v.y * 0.5 + 0.5) * h
      const visible = v.z < 1 && sx > -80 && sx < w + 80
      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`
      el.style.opacity = visible ? '1' : '0'
    })
  }

  return {
    render(ts) {
      // 카메라가 왼쪽 끝에서 오른쪽 끝까지 천천히 왕복
      const p = (Math.sin(ts * 0.00008 - Math.PI / 2) + 1) / 2
      const cx = -2 + p * (totalWidth + 4)
      const big = placed[placed.length - 1].size
      // 큰 큐브 쪽으로 갈수록 카메라를 뒤로 빼서 큐브 안으로 들어가지 않게 한다
      const dist = 26 + p * big * 2.6
      camera.position.set(cx + dist * 0.35, 4 + p * big * 0.9, dist)
      camera.lookAt(cx, 1.5 + p * big * 0.3, 0)
      renderer.render(scene, camera)
      project()
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposables.forEach((d) => d.dispose())
      grid.geometry.dispose()
      ;(grid.material as InstanceType<typeof THREE.Material>).dispose()
    },
  }
}

export default function TonneCubes({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  const fmt = (kg: number) => `${kg < 0 ? '−' : ''}${Math.abs(kg).toLocaleString('en-US')} ${L.kg}`
  const labels = [
    ...placed.map((p) => ({ key: p.id, text: L.tonne[p.id], sub: fmt(p.kg) })),
    { key: 'human', text: L.human, sub: '' },
    { key: 'car', text: L.car, sub: '' },
  ]
  return (
    <VizFrame
      title={L.tonneTitle}
      caption={L.tonneCaption}
      sourceLabel={L.source}
      sourceName={tonneItems
        .map((i) => i.source.name)
        .filter((n, k, a) => n && a.indexOf(n) === k)
        .join(' · ')}
      status={status}
      canvasRef={canvasRef}
      aspect="16 / 9"
      overlay={
        <>
          {labels.map((l, i) => (
            <div
              key={l.key}
              ref={(el) => {
                labelRefs[i] = el
              }}
              className="absolute top-0 left-0 text-center font-mono text-[11px] leading-tight whitespace-nowrap text-[#f4efe4] opacity-0 transition-opacity"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
            >
              <div>{l.text}</div>
              {l.sub && <div className="tabular-nums opacity-80">{l.sub}</div>}
            </div>
          ))}
        </>
      }
      fallback={{
        columns: [lang === 'ko' ? '활동' : 'Activity', L.kg],
        rows: placed.map((p) => ({ label: L.tonne[p.id], value: fmt(p.kg) })),
        note: L.fallbackNote,
      }}
    />
  )
}
