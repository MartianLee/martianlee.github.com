// components/viz/GridTiles.tsx
'use client'

import { useRef } from 'react'
import { grid, HOUSEHOLD_KWH_PER_YEAR, t, type Lang } from '@/data/charts/carbon-basics-2'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import VizFrame from './VizFrame'

const TILE_COLS = 36
const TILE_ROWS = 22
const TILE_COUNT = TILE_COLS * TILE_ROWS
const TILE_SIZE = 0.9
const TILE_GAP = 0.1
const TILE_PITCH = TILE_SIZE + TILE_GAP

const COLUMN_SIDE = 4.6
const COLUMN_GAP = 9.5
// 한국 기둥 위 라벨까지 화면에 들어와야 하므로 최대 높이를 프레임에 맞춰 잡는다
const COLUMN_MAX_HEIGHT = 15.5

const items = grid.items
const labelRefs: (HTMLDivElement | null)[] = []

/** 한국을 기준 높이로 잡고 나머지는 그 비율로 낮아진다 */
const koreaGPerKwh = items.find((it) => it.id === 'korea')?.gPerKwh ?? items[0].gPerKwh
const heightFor = (gPerKwh: number) => (gPerKwh / koreaGPerKwh) * COLUMN_MAX_HEIGHT
/** 네 기둥을 x축에 나란히, 전체를 원점 기준으로 가운데 정렬한다 */
const columnX = (i: number) => (i - (items.length - 1) / 2) * COLUMN_GAP

export const annualKgOf = (gPerKwh: number) => (gPerKwh * HOUSEHOLD_KWH_PER_YEAR) / 1000

const build: SceneBuilder = (THREE, canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1.6, 0.1, 200)
  const root = new THREE.Group()
  scene.add(root)

  // 카메라는 이 기준점 주위로 아주 살짝(좌우 3도)만 궤도를 돈다
  const basePos = new THREE.Vector3(7, 16, 32)
  const lookTarget = new THREE.Vector3(0, 9, 0)
  const camOffset = basePos.clone().sub(lookTarget)
  const camPos = new THREE.Vector3()

  // 바닥 kWh 타일: 한 가구가 1년에 쓰는 전기. 네 나라가 이 똑같은 바닥을 공유한다.
  const tileGeo = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE)
  tileGeo.rotateX(-Math.PI / 2)
  const tileMat = new THREE.MeshBasicMaterial({ color: '#4a3018' })
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, TILE_COUNT)
  const m4 = new THREE.Matrix4()
  let ti = 0
  for (let row = 0; row < TILE_ROWS; row++) {
    for (let col = 0; col < TILE_COLS; col++) {
      m4.makeTranslation(
        (col - (TILE_COLS - 1) / 2) * TILE_PITCH,
        0,
        (row - (TILE_ROWS - 1) / 2) * TILE_PITCH
      )
      tiles.setMatrixAt(ti, m4)
      ti++
    }
  }
  tiles.instanceMatrix.needsUpdate = true
  root.add(tiles)

  const columnGeo = new THREE.BoxGeometry(COLUMN_SIDE, 1, COLUMN_SIDE)
  const edgeGeo = new THREE.EdgesGeometry(columnGeo)
  const columnMat = new THREE.MeshBasicMaterial({
    color: '#e6a760',
    transparent: true,
    opacity: 0.22,
  })
  const edgeMat = new THREE.LineBasicMaterial({
    color: '#f4efe4',
    transparent: true,
    opacity: 0.55,
  })
  // 읽는 사람이 사는 나라라서 한국 기둥만 rust 모서리로 표시한다(FoodMasses의 소고기와 같은 규칙)
  const koreaEdgeMat = new THREE.LineBasicMaterial({
    color: '#cf7a3d',
    transparent: true,
    opacity: 0.9,
  })
  const disposables: { dispose: () => void }[] = [
    tileGeo,
    tileMat,
    tiles,
    columnGeo,
    edgeGeo,
    columnMat,
    edgeMat,
    koreaEdgeMat,
  ]

  const anchors: { x: number; y: number }[] = []
  items.forEach((item, i) => {
    const h = heightFor(item.gPerKwh)
    const group = new THREE.Group()
    group.position.set(columnX(i), h / 2, 0)
    group.scale.y = h
    group.add(new THREE.Mesh(columnGeo, columnMat))
    group.add(new THREE.LineSegments(edgeGeo, item.id === 'korea' ? koreaEdgeMat : edgeMat))
    root.add(group)
    anchors.push({ x: columnX(i), y: h + 0.9 })
  })

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
      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`
      el.style.opacity = v.z < 1 ? '1' : '0'
    })
  }

  return {
    render(ts) {
      const sway = Math.sin(ts * 0.00003) * ((3 * Math.PI) / 180)
      const cos = Math.cos(sway)
      const sin = Math.sin(sway)
      camPos.set(
        camOffset.x * cos + camOffset.z * sin,
        camOffset.y,
        -camOffset.x * sin + camOffset.z * cos
      )
      camera.position.copy(lookTarget).add(camPos)
      camera.lookAt(lookTarget)
      renderer.render(scene, camera)
      project()
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposables.forEach((d) => d.dispose())
    },
  }
}

export default function GridTiles({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  const fmtKg = (n: number) => Math.round(n).toLocaleString('en-US')

  return (
    <VizFrame
      title={L.gridTitle}
      caption={L.gridCaption}
      sourceLabel={L.source}
      sourceName={grid.source.name}
      sourceUrl={grid.source.url}
      status={status}
      canvasRef={canvasRef}
      aspect="16 / 9"
      overlay={
        <>
          {items.map((it, i) => (
            <div
              key={it.id}
              ref={(el) => {
                labelRefs[i] = el
              }}
              className="absolute top-0 left-0 text-center leading-tight whitespace-nowrap text-[#f4efe4] opacity-0"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
            >
              <div className="text-[15px] font-semibold">{L.gridCountry[it.id]}</div>
              <div className="font-mono text-[17px] font-bold tabular-nums">
                {fmtKg(annualKgOf(it.gPerKwh))} <span className="text-[12px]">{L.kg}</span>
              </div>
              <div className="font-mono text-[10.5px] tabular-nums opacity-70">
                {it.gPerKwh.toFixed(0)} g/kWh
              </div>
            </div>
          ))}
          <div
            className="absolute inset-x-0 bottom-3 text-center font-mono text-[11px] text-[#f4efe4] opacity-70"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
          >
            {L.gridUsage}
          </div>
        </>
      }
      fallback={{
        columns: [lang === 'ko' ? '국가' : 'Country', L.kg],
        rows: items.map((it) => ({
          label: L.gridCountry[it.id],
          value: `${fmtKg(annualKgOf(it.gPerKwh))} ${L.kg}`,
        })),
        note: L.fallbackNote,
      }}
    />
  )
}
