// components/viz/CarbonDay.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  dayItems,
  dayTotalKg,
  KOREA_PER_CAPITA_DAILY_KG,
  CO2_M3_PER_KG,
  t,
  type Lang,
} from '@/data/charts/carbon-basics-2'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import VizFrame from './VizFrame'
import VizScrubber from './VizScrubber'

const STEP_MS = 1400
const RISE_MS = 900
const PAUSE_MS = 2000
// 가장 큰 항목(점심)이 다 올라온 뒤 테두리 강조가 지속되는 시간과 라벨이 뜨는 높이
const HILITE_MS = 1200
const HILITE_LIFT_PX = 6
const labelRefs: (HTMLDivElement | null)[] = []
let totalNumEl: HTMLSpanElement | null = null

/**
 * 렌더 루프와 React가 공유하는 상태(리렌더 없이 매 프레임 읽는다).
 * p는 한 사이클 안에서의 진행도(0에서 1). 모듈 싱글턴이라 마운트마다 초기화한다.
 */
interface Shared {
  p: number
  playing: boolean
  t0: number
  onP?: (p: number) => void
}
const shared: Shared = { p: 0, playing: true, t0: 0 }

interface Placed {
  id: string
  size: number
  x: number
  kg: number
}

const GAP = 1.6

// 시각(hour) 간격으로 x를 잡으면 트랙이 48m가 되어 2m짜리 큐브가 점처럼 보인다.
// 하루의 순서만 유지하고 큐브 크기에 맞춰 촘촘히 세운다(시각은 라벨 문구가 알려 준다).
function place(): Placed[] {
  const out: Placed[] = []
  let x = 0
  for (const item of dayItems) {
    const size = Math.cbrt(item.kg * CO2_M3_PER_KG)
    x += size / 2
    out.push({ id: item.id, size, x, kg: item.kg })
    x += size / 2 + GAP
  }
  return out
}
const placed = place()
const trackWidth = placed[placed.length - 1].x + placed[placed.length - 1].size / 2
const trackCenterX = trackWidth / 2
const CYCLE_MS = (placed.length - 1) * STEP_MS + RISE_MS + PAUSE_MS
// 하이라이트 대상은 데이터에서 가장 큰 kg 항목을 찾아 정한다(인덱스를 하드코딩하지 않는다)
const hiliteIndex = placed.reduce((maxI, p, i) => (p.kg > placed[maxI].kg ? i : maxI), 0)

const build: SceneBuilder = (THREE, canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1.6, 0.1, 400)
  const root = new THREE.Group()
  scene.add(root)

  const grid = new THREE.GridHelper(60, 30, '#5b3a1c', '#3a2413')
  grid.position.set(trackCenterX, 0, 0)
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
  // 등장 애니메이션 중인 큐브 하나만 잠깐 빌려 쓰는 재질(투명도를 프레임마다 갱신한다).
  // 항목 간격(1400ms)이 상승 시간(900ms)보다 길어 두 큐브가 동시에 이 재질을 쓰는 일은 없다.
  const cubeMatFade = new THREE.MeshBasicMaterial({
    color: '#e6a760',
    transparent: true,
    opacity: 0,
  })
  const edgeMatFade = new THREE.LineBasicMaterial({
    color: '#f4efe4',
    transparent: true,
    opacity: 0,
  })
  // 가장 큰 항목(점심)이 다 올라온 순간에만 잠깐 빌려 쓰는 테두리 강조 재질.
  // 강조 대상이 한 큐브뿐이라 cubeMatFade/edgeMatFade와 같은 이유로 큐브마다 만들지 않는다.
  const edgeMatHilite = new THREE.LineBasicMaterial({
    color: '#cf7a3d',
    transparent: true,
    opacity: 0.55,
  })
  const hiliteRust = new THREE.Color('#cf7a3d')
  const hiliteWhite = new THREE.Color('#f4efe4')
  const disposables: { dispose: () => void }[] = [
    cubeMat,
    edgeMat,
    cubeMatFade,
    edgeMatFade,
    edgeMatHilite,
  ]

  const cubes: {
    group: InstanceType<typeof THREE.Group>
    mesh: InstanceType<typeof THREE.Mesh>
    edges: InstanceType<typeof THREE.LineSegments>
    kg: number
  }[] = []
  const anchors: { obj: InstanceType<typeof THREE.Object3D>; y: number }[] = []

  for (const p of placed) {
    const geo = new THREE.BoxGeometry(p.size, p.size, p.size)
    const edgesGeo = new THREE.EdgesGeometry(geo)
    disposables.push(geo, edgesGeo)
    const mesh = new THREE.Mesh(geo, cubeMat)
    mesh.position.y = p.size / 2
    const edges = new THREE.LineSegments(edgesGeo, edgeMat)
    edges.position.y = p.size / 2
    const group = new THREE.Group()
    // 그룹은 바닥(y=0)에 두고 mesh/edges를 절반 높이만큼 올린다. 그래서 group.scale.y를
    // 0에서 1로 바꾸면 큐브의 바닥이 고정된 채로 위로 솟아오른다(중심 고정이 아니다).
    group.position.set(p.x, 0, 0)
    group.scale.y = 0
    group.add(mesh, edges)
    root.add(group)
    cubes.push({ group, mesh, edges, kg: p.kg })
    anchors.push({ obj: group, y: p.size + 0.8 })
  }

  let lastQ = -1

  // 상승 구간 안에서의 선형 진행도(0에서 1). progressFor(재질 페이드용)와
  // scaleFor(큐브 높이용)가 이 값을 각자 다르게 이징한다.
  const localP = (i: number, cycleTs: number): number => {
    const t0 = i * STEP_MS
    if (cycleTs < t0) return 0
    return Math.min((cycleTs - t0) / RISE_MS, 1)
  }
  const progressFor = (i: number, cycleTs: number): number => {
    const p = localP(i, cycleTs)
    return 1 - Math.pow(1 - p, 3)
  }
  // 큐브 높이(group.scale.y)에는 살짝 튕기는 오버슈트를 얹는다: 1.0을 넘어 ~1.03까지
  // 갔다가 제자리로 돌아와 끝에서 뚝 멈추지 않고 자리를 잡는다. p=0/1에서는 정확히
  // 0/1로 돌아오므로 reduced-motion의 settle()이나 스크러버로 멈춰도 튀는 프레임에 걸리지 않는다.
  const scaleFor = (i: number, cycleTs: number): number => {
    const p = localP(i, cycleTs)
    const c1 = 0.9
    const c3 = c1 + 1
    const u = p - 1
    return 1 + c3 * u * u * u + c1 * u * u
  }

  const v = new THREE.Vector3()
  // hiliteLiftPx: 강조 중인 라벨만 위로 들어 올리는 오프셋(px). 두 번째 transform을 얹는
  // 대신 같은 translate() 문자열 안에 접어 넣는다.
  const project = (progresses: number[], hiliteLiftPx: number) => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    anchors.forEach((a, i) => {
      const el = labelRefs[i]
      if (!el) return
      v.set(a.obj.position.x, a.obj.position.y + a.y, a.obj.position.z).project(camera)
      const sx = (v.x * 0.5 + 0.5) * w
      const lift = i === hiliteIndex ? hiliteLiftPx : 0
      const sy = (-v.y * 0.5 + 0.5) * h - lift
      const onScreen = v.z < 1 && sx > -80 && sx < w + 80
      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`
      el.style.opacity = onScreen ? String(progresses[i]) : '0'
    })
  }

  return {
    render(ts) {
      if (shared.playing) {
        if (!shared.t0) shared.t0 = ts - shared.p * CYCLE_MS
        shared.p = ((ts - shared.t0) % CYCLE_MS) / CYCLE_MS
        // 슬라이더는 100단계로만 알린다. 매 프레임 setState하면 초당 60번 리렌더된다.
        const q = Math.round(shared.p * 100)
        if (q !== lastQ) {
          lastQ = q
          shared.onP?.(shared.p)
        }
      }
      const cycleTs = shared.p * CYCLE_MS
      const progresses: number[] = []
      for (let i = 0; i < placed.length; i++) progresses.push(progressFor(i, cycleTs))

      cubes.forEach((c, i) => {
        const prog = progresses[i]
        c.group.visible = prog > 0
        c.group.scale.y = scaleFor(i, cycleTs)
        if (prog >= 1) {
          c.mesh.material = cubeMat
          c.edges.material = edgeMat
        } else if (prog > 0) {
          cubeMatFade.opacity = prog * 0.22
          edgeMatFade.opacity = prog * 0.55
          c.mesh.material = cubeMatFade
          c.edges.material = edgeMatFade
        }
      })

      // 가장 큰 항목이 다 올라온 순간부터 HILITE_MS 동안 테두리를 러스트에서 흰색으로
      // 되돌린다. cycleTs는 매 프레임 progress(shared.p)로 다시 계산되므로 경과 시간을
      // 따로 적산하지 않는다. 스크러버로 앞뒤로 움직여도 그 시점의 진행도만으로 항상
      // 같은 결과가 나온다.
      const hiliteElapsed = cycleTs - (hiliteIndex * STEP_MS + RISE_MS)
      let hiliteK = -1
      if (hiliteElapsed >= 0 && hiliteElapsed < HILITE_MS) {
        hiliteK = hiliteElapsed / HILITE_MS
        edgeMatHilite.color.copy(hiliteRust).lerp(hiliteWhite, hiliteK)
        cubes[hiliteIndex].edges.material = edgeMatHilite
      }
      // 라벨도 같은 진행도로 살짝 들렸다가 되돌아온다(강조 구간의 중간에서 최대)
      const hiliteLiftPx = hiliteK >= 0 ? HILITE_LIFT_PX * Math.sin(hiliteK * Math.PI) : 0

      // 카메라는 하루 전체를 한 프레임에 담은 채 고정한다. 항목을 따라다니면 점심 큐브가
      // 화면 밖으로 밀려나 "점심이 압도적으로 크다"는 이 장면의 요지가 보이지 않는다.
      const sway = shared.playing ? Math.sin(ts * 0.00004) * 0.9 : 0
      camera.position.set(trackCenterX + 5.5 + sway, 5.2, 15)
      camera.lookAt(trackCenterX, 1.5, 0)

      renderer.render(scene, camera)
      project(progresses, hiliteLiftPx)

      if (totalNumEl) {
        const allDone = progresses.every((p) => p >= 1)
        const total = allDone
          ? dayTotalKg
          : cubes.reduce((sum, c, i) => sum + c.kg * progresses[i], 0)
        totalNumEl.textContent = total.toFixed(2)
      }
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    // reduced-motion: 다섯 큐브가 모두 올라온 마지막 상태로 고정한다
    settle() {
      shared.playing = false
      shared.p = 1
    },
    dispose() {
      disposables.forEach((d) => d.dispose())
      grid.geometry.dispose()
      ;(grid.material as InstanceType<typeof THREE.Material>).dispose()
    },
  }
}

export default function CarbonDay({ lang }: { lang: Lang }) {
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
      title={L.dayTitle}
      caption={L.dayCaption}
      sourceLabel={L.source}
      sourceName={dayItems
        .map((d) => d.source.name)
        .filter((n, i, a) => n && a.indexOf(n) === i)
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
              <div>{L.day[p.id as keyof typeof L.day]}</div>
              <div className="tabular-nums opacity-80">
                {p.kg.toFixed(2)} {L.kg}
              </div>
            </div>
          ))}
          <div
            className="pointer-events-none absolute top-3 right-3 text-right font-mono text-[#f4efe4]"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
          >
            <div className="text-[11px] opacity-80">{L.dayTotal}</div>
            <div className="text-2xl tabular-nums">
              <span
                ref={(el) => {
                  totalNumEl = el
                }}
              >
                0.00
              </span>{' '}
              {L.kg}
            </div>
            <div className="mt-0.5 text-[10.5px] opacity-70">
              {L.dayCompare} {KOREA_PER_CAPITA_DAILY_KG} {L.kg}
            </div>
          </div>
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
        columns: [lang === 'ko' ? '항목' : 'Item', L.kg],
        rows: dayItems.map((d) => ({
          label: L.day[d.id],
          value: `${d.kg.toFixed(2)} ${L.kg}`,
        })),
        note: L.fallbackNote,
      }}
    />
  )
}
