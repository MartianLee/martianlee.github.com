// components/viz/GridTiles.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { grid, HOUSEHOLD_KWH_PER_YEAR, t, type Lang } from '@/data/charts/carbon-basics-2'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import VizFrame from './VizFrame'
import VizScrubber from './VizScrubber'

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

// 등장 애니메이션: 한국부터 0.1초씩 늦게 솟아오르고, 각 기둥은 1초 안에 ease-out으로
// 멈춰 선다. 전체 사이클은 약 2초.
const STAGGER_MS = 100
const RISE_MS = 850
const CYCLE_MS = 2000

const items = grid.items
const labelRefs: (HTMLDivElement | null)[] = []
const numRefs: (HTMLSpanElement | null)[] = []

/** 한국을 기준 높이로 잡고 나머지는 그 비율로 낮아진다 */
const koreaGPerKwh = items.find((it) => it.id === 'korea')?.gPerKwh ?? items[0].gPerKwh
const heightFor = (gPerKwh: number) => (gPerKwh / koreaGPerKwh) * COLUMN_MAX_HEIGHT
/** 네 기둥을 x축에 나란히, 전체를 원점 기준으로 가운데 정렬한다 */
const columnX = (i: number) => (i - (items.length - 1) / 2) * COLUMN_GAP

export const annualKgOf = (gPerKwh: number) => (gPerKwh * HOUSEHOLD_KWH_PER_YEAR) / 1000
const fmtKg = (n: number) => Math.round(n).toLocaleString('en-US')

/**
 * 렌더 루프와 React가 공유하는 상태(리렌더 없이 매 프레임 읽는다).
 * p는 0에서 1로 한 번만 오르고 끝에서 멈춘다(반복하지 않는다). 모듈 싱글턴이라
 * 마운트마다 초기화한다.
 */
interface Shared {
  p: number
  playing: boolean
  t0: number
  onP?: (p: number) => void
}
const shared: Shared = { p: 0, playing: true, t0: 0 }

/** 기둥 i가 사이클 시간 cycleTs에서 얼마나 올라와 있는지(0~1, ease-out) */
const progressFor = (i: number, cycleTs: number): number => {
  const start = i * STAGGER_MS
  if (cycleTs < start) return 0
  const p = Math.min((cycleTs - start) / RISE_MS, 1)
  return 1 - Math.pow(1 - p, 3)
}

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

  // 기둥 geometry는 높이 1로 고정이고 scale.y로만 키를 바꾼다. geometry가 원점 중심이라
  // mesh/edges를 로컬 y=0.5만큼 올려 두면, group.scale.y를 0에서 최종 높이로 바꿔도
  // 바닥(y=0)은 그대로고 꼭대기만 위로 자란다. 바닥 타일은 이 계산과 무관하다.
  const columns: { group: InstanceType<typeof THREE.Group>; h: number; kg: number }[] = []
  items.forEach((item, i) => {
    const h = heightFor(item.gPerKwh)
    const group = new THREE.Group()
    group.position.set(columnX(i), 0, 0)
    group.scale.y = 0
    const mesh = new THREE.Mesh(columnGeo, columnMat)
    mesh.position.y = 0.5
    const edges = new THREE.LineSegments(edgeGeo, item.id === 'korea' ? koreaEdgeMat : edgeMat)
    edges.position.y = 0.5
    group.add(mesh, edges)
    root.add(group)
    columns.push({ group, h, kg: annualKgOf(item.gPerKwh) })
  })

  let lastQ = -1

  const v = new THREE.Vector3()
  const project = (progresses: number[]) => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    columns.forEach((c, i) => {
      const prog = progresses[i]
      const num = numRefs[i]
      // 숫자는 기둥과 같은 progress에서 나오므로 항상 같이 움직이고 1에서 정확히 만난다
      if (num) num.textContent = fmtKg(c.kg * prog)
      const el = labelRefs[i]
      if (!el) return
      // 라벨 앵커는 최종 높이가 아니라 지금 자라고 있는 꼭대기를 따라간다
      v.set(c.group.position.x, c.h * prog + 0.9, 0).project(camera)
      const sx = (v.x * 0.5 + 0.5) * w
      const sy = (-v.y * 0.5 + 0.5) * h
      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`
      el.style.opacity = v.z < 1 ? '1' : '0'
    })
  }

  return {
    render(ts) {
      if (shared.playing) {
        if (!shared.t0) shared.t0 = ts - shared.p * CYCLE_MS
        shared.p = Math.min((ts - shared.t0) / CYCLE_MS, 1)
        // 슬라이더는 100단계로만 알린다. 매 프레임 setState하면 초당 60번 리렌더된다.
        const q = Math.round(shared.p * 100)
        if (q !== lastQ) {
          lastQ = q
          shared.onP?.(shared.p)
        }
      }
      const cycleTs = shared.p * CYCLE_MS
      const progresses = columns.map((_, i) => progressFor(i, cycleTs))
      columns.forEach((c, i) => {
        c.group.scale.y = c.h * progresses[i]
      })

      // 재생 중일 때만 살짝 궤도를 돈다. 멈추면 카메라도 완전히 정지한다.
      const sway = shared.playing ? Math.sin(ts * 0.00003) * ((3 * Math.PI) / 180) : 0
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
      project(progresses)
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    // reduced-motion: 네 기둥이 모두 최종 높이까지 올라온 상태로 고정한다
    settle() {
      shared.playing = false
      shared.p = 1
    },
    dispose() {
      disposables.forEach((d) => d.dispose())
    },
  }
}

export default function GridTiles({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // 아래 라벨 map이 인자 이름으로 p를 쓰므로 상태는 progress로 둔다
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(true)
  useEffect(() => {
    shared.p = 0
    shared.playing = true
    shared.t0 = 0
    shared.onP = setProgress
    return () => {
      shared.onP = undefined
    }
  }, [])
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]

  const scrub = (v: number) => {
    shared.playing = false
    shared.p = v
    setPlaying(false)
    setProgress(v)
  }
  const toggle = () => {
    const next = !playing
    shared.playing = next
    if (next) shared.t0 = 0
    setPlaying(next)
  }

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
                <span
                  ref={(el) => {
                    numRefs[i] = el
                  }}
                >
                  0
                </span>{' '}
                <span className="text-[12px]">{L.kg}</span>
              </div>
              <div className="font-mono text-[10.5px] tabular-nums opacity-70">
                {it.gPerKwh.toFixed(0)} g/kWh
              </div>
            </div>
          ))}
          <VizScrubber
            playing={playing}
            onToggle={toggle}
            value={progress}
            onScrub={scrub}
            playLabel={L.play}
            pauseLabel={L.pause}
            ariaLabel={L.progress}
            readout={
              <div
                className="text-center font-mono text-[11px] opacity-70"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
              >
                {L.gridUsage}
              </div>
            }
          />
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
