// components/viz/FoodMasses.tsx
'use client'

import { useRef } from 'react'
import { CO2_M3_PER_KG, foods, t, type Lang } from '@/data/charts/carbon-basics-2'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import VizFrame from './VizFrame'

const GAP = 0.8
const REVEAL_MS = 16000
const HOLD_MS = 4000
const labelRefs: (HTMLDivElement | null)[] = []

interface Placed {
  id: (typeof foods.items)[number]['id']
  size: number
  x: number
  kgPerKg: number
}

function place(): Placed[] {
  const out: Placed[] = []
  let x = 0
  // foods.items는 소고기(가장 크다) -> 채소(가장 작다) 순이라, 뒤집어야 작은 것부터
  // 배치된다. 카메라가 작은 큐브에서 소고기 큐브로 패닝하며 스케일이 무너지는 순간을
  // 보여 주는 것이 이 장면의 요지다.
  const reversed = [...foods.items].reverse()
  for (const item of reversed) {
    const size = Math.cbrt(item.kgPerKg * CO2_M3_PER_KG)
    x += size / 2
    out.push({ id: item.id, size, x, kgPerKg: item.kgPerKg })
    x += size / 2 + GAP
  }
  return out
}
const placed = place()
const totalWidth = placed[placed.length - 1].x + placed[placed.length - 1].size / 2
const biggest = placed[placed.length - 1].size

const build: SceneBuilder = (THREE, canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1.6, 0.1, 400)
  const root = new THREE.Group()
  scene.add(root)

  const grid = new THREE.GridHelper(80, 40, '#5b3a1c', '#3a2413')
  grid.position.set(totalWidth / 2, 0, 0)
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
  // 소고기 큐브만 rust 모서리로 강조한다
  const beefEdgeMat = new THREE.LineBasicMaterial({
    color: '#cf7a3d',
    transparent: true,
    opacity: 0.9,
  })
  const disposables: { dispose: () => void }[] = [cubeMat, edgeMat, beefEdgeMat]
  const anchors: { obj: InstanceType<typeof THREE.Object3D>; y: number }[] = []

  for (const p of placed) {
    const geo = new THREE.BoxGeometry(p.size, p.size, p.size)
    disposables.push(geo)
    const edges = new THREE.EdgesGeometry(geo)
    disposables.push(edges)
    const group = new THREE.Group()
    group.position.set(p.x, p.size / 2, 0)
    group.add(new THREE.Mesh(geo, cubeMat))
    group.add(new THREE.LineSegments(edges, p.id === 'beef' ? beefEdgeMat : edgeMat))
    root.add(group)
    // 작은 큐브 여섯 개는 화면상 60px 남짓 간격이라 라벨이 가로로 겹친다. 계단식으로 쌓으면
    // 맨 앞 라벨이 화면 위로 잘리므로 한 칸씩 번갈아 올리는 지그재그로 푼다.
    anchors.push({
      obj: group,
      y: p.size / 2 + 0.6 + (anchors.length < 6 ? (anchors.length % 2) * 2.6 : 0),
    })
  }

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

  // settle()이 켜면 render는 ts와 무관하게 왕복의 끝(p = 1, 소고기 큐브가 보이는 프레임)에 멈춘다
  let settled = false

  return {
    settle() {
      settled = true
    },
    render(ts) {
      // 채소 큐브를 가까이 잡은 채로 시작해 천천히 뒤로 빠지면서 아홉 개를 한 프레임에
      // 담는다. 스케일이 무너지는 순간은 "옆으로 훑을 때"가 아니라 "전체가 한 화면에
      // 들어올 때" 보인다. 끝까지 빠지면 잠시 멈췄다가 처음부터 반복한다.
      const cycle = REVEAL_MS + HOLD_MS
      const raw = settled ? 1 : Math.min((ts % cycle) / REVEAL_MS, 1)
      const p = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2
      const cx = 2 + p * (totalWidth / 2 - 2)
      const dist = 9 + p * 19
      camera.position.set(cx + dist * 0.26, 2 + p * 5.4, dist)
      camera.lookAt(cx, 0.8 + p * 1.5, 0)
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

export default function FoodMasses({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  return (
    <VizFrame
      title={L.foodTitle}
      caption={L.foodCaption}
      sourceLabel={L.source}
      sourceName={foods.source.name}
      sourceUrl={foods.source.url}
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
              <div>{L.food[p.id]}</div>
              <div className="tabular-nums opacity-80">{`${p.kgPerKg} ${L.kg}`}</div>
            </div>
          ))}
        </>
      }
      fallback={{
        columns: [lang === 'ko' ? '식품' : 'Food', L.kg],
        rows: foods.items.map((item) => ({
          label: L.food[item.id],
          value: `${item.kgPerKg} ${L.kg}`,
        })),
        note: L.fallbackNote,
      }}
    />
  )
}
