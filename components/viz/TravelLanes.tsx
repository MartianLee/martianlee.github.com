// components/viz/TravelLanes.tsx
'use client'

import { useRef } from 'react'
import { travel, t, type Lang } from '@/data/charts/carbon-basics-2'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { discSprite, makePoints, disposePoints } from './three-utils'
import VizFrame from './VizFrame'

const LANE_GAP = 3.4
// 이동 폭을 좁게 잡아야 가장 긴 꼬리(항공 22m)까지 화면 안에 다 들어온다. 꼬리가 잘리면
// 길이 비교라는 이 장면의 요지가 무너진다.
const MOVER_MIN_X = 4
const MOVER_MAX_X = 16
const MOVER_RANGE = MOVER_MAX_X - MOVER_MIN_X
const PERIOD_MS = 12000
const SETTLED_X = 12
const MOVER_HEIGHT = 0.5
const TAIL_REF_G_PER_PKM = 246
const TAIL_REF_LEN = 22
const TAIL_Y_MAX = 0.8
const TAIL_Z_JITTER = 0.4

/** 레인 i의 z좌표. 수단이 7개이므로 가운데 레인이 z=0에 오도록 대칭 배치한다. */
function laneZ(i: number): number {
  return (i - (travel.items.length - 1) / 2) * LANE_GAP
}

const Z_MIN = laneZ(0)
const Z_MAX = laneZ(travel.items.length - 1)

/** 라벨은 레인의 실제 투영 위치에 붙인다. 근사 매핑은 원근 압축 때문에 줄이 어긋난다. */
const labelRefs: (HTMLDivElement | null)[] = []
const LABEL_ANCHOR_X = -21.5

const build: SceneBuilder = (THREE, canvas, renderer) => {
  const scene = new THREE.Scene()
  // 레인을 옆에서 보면 일곱 줄이 한 점으로 몰려 꼬리 길이가 안 보인다. 위에서 내려다봐야
  // 레인이 나란한 가로 띠가 되고 꼬리 길이 차이가 그대로 막대처럼 읽힌다.
  const camera = new THREE.PerspectiveCamera(38, 1.6, 0.1, 200)
  camera.position.set(0, 24, 30)
  camera.lookAt(0, 0, 0)

  const root = new THREE.Group()
  scene.add(root)

  const sprite = discSprite(THREE)
  const laneGeo = new THREE.PlaneGeometry(46, 0.06)
  const laneMat = new THREE.MeshBasicMaterial({ color: '#5b3a1c', side: THREE.DoubleSide })
  const moverGeo = new THREE.BoxGeometry(0.9, MOVER_HEIGHT, 0.6)
  const moverMat = new THREE.MeshBasicMaterial({ color: '#f4efe4' })
  const moverMatCar4 = new THREE.MeshBasicMaterial({ color: '#a8bd74' })

  const lanes: {
    mover: InstanceType<typeof THREE.Mesh>
    points: ReturnType<typeof makePoints>
    attr: InstanceType<typeof THREE.BufferAttribute>
    dx: Float32Array
    dy: Float32Array
    dz: Float32Array
    z: number
  }[] = []

  travel.items.forEach((item, i) => {
    const z = laneZ(i)

    const line = new THREE.Mesh(laneGeo, laneMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(0, 0, z)
    root.add(line)

    // car4(자체 계산)만 moss로 칠해 나머지 레인과 구분한다
    const mover = new THREE.Mesh(moverGeo, item.id === 'car4' ? moverMatCar4 : moverMat)
    mover.position.set(MOVER_MIN_X, MOVER_HEIGHT / 2, z)
    root.add(mover)

    // 입자 수와 꼬리 길이가 gPerPkm에 비례한다. 속도는 모든 레인이 같으므로
    // 꼬리 길이만이 배출량 차이를 나타낸다(이 장면의 핵심).
    const count = Math.round(item.gPerPkm / 2)
    const tailLen = (item.gPerPkm / TAIL_REF_G_PER_PKM) * TAIL_REF_LEN
    const dx = new Float32Array(count)
    const dy = new Float32Array(count)
    const dz = new Float32Array(count)
    const positions = new Float32Array(count * 3)
    for (let j = 0; j < count; j++) {
      // 이동체 뒤쪽(x가 작은 쪽)으로만 흩뿌린다
      dx[j] = -Math.random() * tailLen
      dy[j] = Math.random() * TAIL_Y_MAX
      dz[j] = (Math.random() * 2 - 1) * TAIL_Z_JITTER
    }
    const points = makePoints(THREE, positions, {
      size: 1.1,
      color: '#e6a760',
      opacity: 0.8,
      sprite,
      additive: true,
    })
    root.add(points)
    const attr = points.geometry.getAttribute('position') as InstanceType<
      typeof THREE.BufferAttribute
    >
    lanes.push({ mover, points, attr, dx, dy, dz, z })
  })

  // 이동체를 x에 두고 모든 레인의 이동체·꼬리 입자를 그 x 기준으로 다시 계산한다
  function place(x: number) {
    for (const lane of lanes) {
      lane.mover.position.x = x
      const arr = lane.attr.array as Float32Array
      for (let j = 0; j < lane.dx.length; j++) {
        arr[j * 3] = x + lane.dx[j]
        arr[j * 3 + 1] = lane.dy[j]
        arr[j * 3 + 2] = lane.z + lane.dz[j]
      }
      lane.attr.needsUpdate = true
    }
  }
  place(MOVER_MIN_X)

  // 카메라가 고정이라 레인 라벨 위치는 리사이즈 때만 다시 계산하면 된다
  const v = new THREE.Vector3()
  const projectLabels = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    lanes.forEach((lane, i) => {
      const el = labelRefs[i]
      if (!el) return
      v.set(LABEL_ANCHOR_X, 0, lane.z).project(camera)
      const sx = (v.x * 0.5 + 0.5) * w
      const sy = (-v.y * 0.5 + 0.5) * h
      el.style.transform = `translate(0, -50%) translate(${Math.max(sx, 10)}px, ${sy}px)`
      el.style.opacity = '1'
    })
  }

  // null이 아니면 reduced-motion으로 고정된 상태이므로 render()가 더 이상 x를 계산하지 않는다
  let frozenX: number | null = null

  return {
    // reduced-motion: 이동체를 중간 지점에 두고 꼬리를 한 번만 계산한 상태로 고정한다
    settle() {
      frozenX = SETTLED_X
      place(SETTLED_X)
    },
    render(ts) {
      if (frozenX === null) {
        const p = (ts % PERIOD_MS) / PERIOD_MS
        place(MOVER_MIN_X + p * MOVER_RANGE)
      }
      renderer.render(scene, camera)
      projectLabels()
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      projectLabels()
    },
    dispose() {
      laneGeo.dispose()
      laneMat.dispose()
      moverGeo.dispose()
      moverMat.dispose()
      moverMatCar4.dispose()
      lanes.forEach((lane) => disposePoints(lane.points))
      sprite.dispose()
    },
  }
}

export default function TravelLanes({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  return (
    <VizFrame
      title={L.travelTitle}
      caption={L.travelCaption}
      sourceLabel={L.source}
      sourceName={travel.source.name}
      sourceUrl={travel.source.url}
      status={status}
      canvasRef={canvasRef}
      aspect="16 / 9"
      overlay={
        <>
          {travel.items.map((item, i) => (
            <div
              key={item.id}
              ref={(el) => {
                labelRefs[i] = el
              }}
              className="absolute top-0 left-0 font-mono text-[10.5px] leading-tight whitespace-nowrap text-[#f4efe4] opacity-0"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
            >
              <div>{L.travel[item.id]}</div>
              <div className="tabular-nums opacity-80">{item.gPerPkm} g</div>
            </div>
          ))}
        </>
      }
      fallback={{
        columns: [lang === 'ko' ? '이동 수단' : 'Mode', L.gPerKm],
        rows: travel.items.map((item) => ({
          label: L.travel[item.id],
          value: `${item.gPerPkm} ${L.gPerKm}`,
        })),
        note: L.fallbackNote,
      }}
    />
  )
}
