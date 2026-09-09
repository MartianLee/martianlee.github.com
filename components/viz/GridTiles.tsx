// components/viz/GridTiles.tsx
'use client'

import { useRef } from 'react'
import { grid, HOUSEHOLD_KWH_PER_YEAR, t, type Lang } from '@/data/charts/carbon-basics-2'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import VizFrame from './VizFrame'

const TILE_COLS = 36
const TILE_ROWS = 25
const TILE_COUNT = TILE_COLS * TILE_ROWS
const TILE_SIZE = 0.9
const TILE_GAP = 0.1
const TILE_PITCH = TILE_SIZE + TILE_GAP

// 기둥이 격자를 거의 덮으면 옆에서 볼 때 "바닥 슬래브"로 보인다. 타일 밭 한가운데
// 좁고 높게 세워야 사용량(바닥)은 그대로인데 배출(높이)만 오르내리는 것이 읽힌다.
const COLUMN_WIDTH = 7
const COLUMN_DEPTH = 7
const COLUMN_MAX_HEIGHT = 24

const CYCLE_MS = 4000
const TRANS_MS = 900

const countryRefs: (HTMLDivElement | null)[] = []
let gValueEl: HTMLSpanElement | null = null
let kgValueEl: HTMLSpanElement | null = null

/** 한국의 배출계수를 기준(기둥 높이 14)으로 잡고 다른 나라는 그 비율로 늘어난다 */
const koreaGPerKwh = grid.items.find((it) => it.id === 'korea')?.gPerKwh ?? grid.items[0].gPerKwh

function easeInOutCubic(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
}

const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1.6, 0.1, 200)
  const root = new THREE.Group()
  scene.add(root)

  // 카메라는 이 기준점 주위로 아주 살짝(좌우 3도)만 궤도를 돈다
  const basePos = new THREE.Vector3(24, 17, 31)
  const lookTarget = new THREE.Vector3(0, 7, 0)
  const camOffset = basePos.clone().sub(lookTarget)
  const camPos = new THREE.Vector3()

  // 바닥 kWh 타일: 36 x 25 = 900개, 나라가 바뀌어도 절대 움직이지 않는다
  const tileGeo = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE)
  tileGeo.rotateX(-Math.PI / 2)
  const tileMat = new THREE.MeshBasicMaterial({ color: '#4a3018' })
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, TILE_COUNT)
  const m4 = new THREE.Matrix4()
  let ti = 0
  for (let row = 0; row < TILE_ROWS; row++) {
    for (let col = 0; col < TILE_COLS; col++) {
      const x = (col - (TILE_COLS - 1) / 2) * TILE_PITCH
      const z = (row - (TILE_ROWS - 1) / 2) * TILE_PITCH
      m4.makeTranslation(x, 0, z)
      tiles.setMatrixAt(ti, m4)
      ti++
    }
  }
  tiles.instanceMatrix.needsUpdate = true
  root.add(tiles)

  // 배출 기둥: 타일 격자 중앙 위, 반투명 amber + 흰 모서리선. 이 장면에서 유일하게 움직이는 부분
  const columnGeo = new THREE.BoxGeometry(COLUMN_WIDTH, 1, COLUMN_DEPTH)
  const columnMat = new THREE.MeshBasicMaterial({
    color: '#e6a760',
    transparent: true,
    opacity: 0.22,
  })
  const columnMesh = new THREE.Mesh(columnGeo, columnMat)
  const edgeGeo = new THREE.EdgesGeometry(columnGeo)
  const edgeMat = new THREE.LineBasicMaterial({
    color: '#f4efe4',
    transparent: true,
    opacity: 0.55,
  })
  const columnEdges = new THREE.LineSegments(edgeGeo, edgeMat)
  const columnGroup = new THREE.Group()
  columnGroup.add(columnMesh, columnEdges)
  root.add(columnGroup)

  const disposables: { dispose: () => void }[] = [
    tileGeo,
    tileMat,
    tiles,
    columnGeo,
    columnMat,
    edgeGeo,
    edgeMat,
  ]

  const items = grid.items
  const n = items.length
  const heightFor = (gPerKwh: number) => (gPerKwh / koreaGPerKwh) * COLUMN_MAX_HEIGHT

  // 높이는 scale.y로만 바꾼다. geometry는 높이 1로 고정해 두고 늘렸다 줄였다 한다
  const setColumnHeight = (h: number) => {
    columnGroup.scale.y = h
    columnGroup.position.y = h / 2
  }
  setColumnHeight(heightFor(items[0].gPerKwh))

  let forceSettled = false

  return {
    // reduced-motion: 첫 나라(한국)의 최종 높이로 고정한다
    settle() {
      forceSettled = true
    },
    render(ts) {
      // 4초마다 다음 나라로. 나라가 바뀐 순간부터 900ms 동안만 높이(=gPerKwh)를 보간하고
      // 나머지 시간은 그대로 멈춰 있는다.
      const cycleIdx = forceSettled ? 0 : Math.floor(ts / CYCLE_MS)
      const currentIdx = cycleIdx % n
      const prevIdx = (currentIdx - 1 + n) % n
      const timeInCycle = forceSettled ? 0 : ts % CYCLE_MS
      const p = cycleIdx === 0 ? 1 : Math.min(1, timeInCycle / TRANS_MS)
      const eased = easeInOutCubic(p)

      const fromG = items[prevIdx].gPerKwh
      const toG = items[currentIdx].gPerKwh
      const gInterp = fromG + (toG - fromG) * eased
      setColumnHeight(heightFor(gInterp))

      // 오버레이 숫자는 기둥과 같은 보간값(gInterp)에서 나오므로 항상 같이 움직인다
      const annualKg = (gInterp * HOUSEHOLD_KWH_PER_YEAR) / 1000
      if (gValueEl) {
        gValueEl.textContent = gInterp.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      }
      if (kgValueEl) {
        kgValueEl.textContent = Math.round(annualKg).toLocaleString('en-US')
      }
      countryRefs.forEach((el, i) => {
        if (el) el.style.opacity = i === currentIdx ? '1' : '0'
      })

      // 아주 느린 궤도로 좌우 3도만 흔들린다(카메라 위치 자체는 고정에 가깝다)
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
  const items = grid.items
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
        <div
          className="absolute inset-0 flex flex-col items-center text-center text-[#f4efe4]"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
        >
          <div className="relative mt-6 h-[30px] w-full">
            {items.map((it, i) => (
              <div
                key={it.id}
                ref={(el) => {
                  countryRefs[i] = el
                }}
                className={`absolute inset-0 flex items-center justify-center text-[24px] font-semibold transition-opacity ${
                  i === 0 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {L.gridCountry[it.id]}
              </div>
            ))}
          </div>
          <div className="mt-1 font-mono text-[13px] opacity-85">
            <span
              ref={(el) => {
                gValueEl = el
              }}
              className="tabular-nums"
            >
              {items[0].gPerKwh.toFixed(2)}
            </span>{' '}
            g/kWh
          </div>
          <div className="mt-1 font-mono text-[34px] font-bold">
            <span
              ref={(el) => {
                kgValueEl = el
              }}
              className="tabular-nums"
            >
              {fmtKg((items[0].gPerKwh * HOUSEHOLD_KWH_PER_YEAR) / 1000)}
            </span>{' '}
            {L.kg}
          </div>
          <div className="mt-auto mb-4 font-mono text-[11px] opacity-70">{L.gridUsage}</div>
        </div>
      }
      fallback={{
        columns: [lang === 'ko' ? '국가' : 'Country', L.kg],
        rows: items.map((it) => ({
          label: L.gridCountry[it.id],
          value: `${fmtKg((it.gPerKwh * HOUSEHOLD_KWH_PER_YEAR) / 1000)} ${L.kg}`,
        })),
        note: L.fallbackNote,
      }}
    />
  )
}
