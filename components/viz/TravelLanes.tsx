// components/viz/TravelLanes.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { travel, t, type Lang } from '@/data/charts/carbon-basics-2'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { discSprite, makePoints, disposePoints } from './three-utils'
import VizFrame from './VizFrame'
import VizScrubber from './VizScrubber'

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
// 꼬리 끝 입자일수록(reach가 클수록) 전체 길이까지 자라는 데 진행도가 더 필요하다.
// 0.4로 두면 한 바퀴의 앞 40%에서 꼬리가 펼쳐지고 나머지 60%는 다 자란 채로 유지된다.
const TAIL_LAG_SPAN = 0.4
// 꼬리 끝은 이 비율까지만 어두워진다(0이면 완전히 사라져 버려서 바닥을 둔다)
const TAIL_FADE_FLOOR = 0.35
const SETTLED_P = (SETTLED_X - MOVER_MIN_X) / MOVER_RANGE

/**
 * 렌더 루프와 React가 공유하는 상태(리렌더 없이 매 프레임 읽는다).
 * p는 한 바퀴 안에서의 진행도(0에서 1). 모듈 싱글턴이라 마운트마다 초기화한다.
 */
interface Shared {
  p: number
  playing: boolean
  t0: number
  onP?: (p: number) => void
}
const shared: Shared = { p: 0, playing: true, t0: 0 }

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
    // reach: 이동체에서 얼마나 뒤쪽인지(0=이동체 바로 뒤, 1=꼬리 끝). 길이·자라는 속도·
    // 위로 뜨는 정도·색 바램이 모두 이 하나의 값에서 파생된다.
    reach: Float32Array
    // 이 진행도(threshold)에 도달해야 해당 입자가 완전히 펼쳐진다(threshold = reach * LAG_SPAN)
    threshold: Float32Array
    yMax: Float32Array
    dz: Float32Array
    tailLen: number
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
    const reach = new Float32Array(count)
    const threshold = new Float32Array(count)
    const yMax = new Float32Array(count)
    const dz = new Float32Array(count)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let j = 0; j < count; j++) {
      reach[j] = Math.random()
      threshold[j] = reach[j] * TAIL_LAG_SPAN
      // 뒤로 갈수록 더 뜬다. 무작위 계수를 곱해 줄 세운 듯 나란하지 않게 흩뜬다.
      yMax[j] = reach[j] * TAIL_Y_MAX * (0.4 + Math.random() * 0.6)
      dz[j] = (Math.random() * 2 - 1) * TAIL_Z_JITTER
      // 꼬리 끝일수록 어둡게(추가 블렌딩이라 어두워질수록 옅어져 보인다)
      const fade = 1 - reach[j] * (1 - TAIL_FADE_FLOOR)
      colors[j * 3] = fade
      colors[j * 3 + 1] = fade
      colors[j * 3 + 2] = fade
    }
    // 항공만 살짝 더 밝은 재질을 따로 둔다. 가장 긴 꼬리가 이 장면의 요지라서다.
    const points = makePoints(THREE, positions, {
      size: item.id === 'flight' ? 1.3 : 1.1,
      color: item.id === 'flight' ? '#ffd9a3' : '#e6a760',
      vertexColors: colors,
      opacity: item.id === 'flight' ? 0.95 : 0.8,
      sprite,
      additive: true,
    })
    root.add(points)
    const attr = points.geometry.getAttribute('position') as InstanceType<
      typeof THREE.BufferAttribute
    >
    lanes.push({ mover, points, attr, reach, threshold, yMax, dz, tailLen, z })
  })

  // p(0~1)는 이동체가 레인을 한 번 지나가는 진행도. 입자마다 threshold가 달라 뒤쪽
  // 입자일수록 늦게 완전히 펼쳐지므로(느리게 따라붙으므로) 꼬리가 덩어리째 끌려가는
  // 대신 서서히 풀려나가는 것처럼 보인다. 다 펼쳐진 뒤의 최대 길이는 growth가 1로
  // 수렴하는 reach * tailLen이라 기존과 같은 배출량 순서를 그대로 지킨다.
  function place(p: number) {
    const moverX = MOVER_MIN_X + p * MOVER_RANGE
    for (const lane of lanes) {
      lane.mover.position.x = moverX
      const arr = lane.attr.array as Float32Array
      for (let j = 0; j < lane.reach.length; j++) {
        const th = lane.threshold[j]
        const raw = th <= 1e-6 ? 1 : Math.min(p / th, 1)
        const growth = raw * raw * (3 - 2 * raw) // smoothstep
        const back = lane.reach[j] * lane.tailLen * growth
        arr[j * 3] = moverX - back
        arr[j * 3 + 1] = lane.yMax[j] * growth
        arr[j * 3 + 2] = lane.z + lane.dz[j]
      }
      lane.attr.needsUpdate = true
    }
  }
  place(0)

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

  // 슬라이더는 100단계로만 알린다. 매 프레임 setState하면 초당 60번 리렌더된다.
  let lastQ = -1

  return {
    // reduced-motion: 이동체를 중간 지점에 두고 꼬리가 다 자란 상태로 고정한다
    settle() {
      shared.playing = false
      shared.p = SETTLED_P
    },
    render(ts) {
      if (shared.playing) {
        if (!shared.t0) shared.t0 = ts - shared.p * PERIOD_MS
        shared.p = ((ts - shared.t0) % PERIOD_MS) / PERIOD_MS
        const q = Math.round(shared.p * 100)
        if (q !== lastQ) {
          lastQ = q
          shared.onP?.(shared.p)
        }
      }
      place(shared.p)
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
          <VizScrubber
            playing={playing}
            onToggle={toggle}
            value={progress}
            onScrub={scrub}
            playLabel={L.play}
            pauseLabel={L.pause}
            ariaLabel={L.progress}
          />
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
