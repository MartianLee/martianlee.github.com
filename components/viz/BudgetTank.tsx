// components/viz/BudgetTank.tsx
'use client'

import { useRef } from 'react'
import { carbonBudget, t, type Lang } from '@/data/charts/carbon-basics-1'
import { useThreeScene, type SceneBuilder } from './useThreeScene'
import { discSprite, makePoints, disposePoints } from './three-utils'
import VizFrame from './VizFrame'

const USED = 3000
const FREE = 500
const R = 1.0
const H = 2.4
const FILL_MS = 3000

const total = carbonBudget.usedGt + carbonBudget.remainingGt
const usedRatio = carbonBudget.usedGt / total
const yearsLeft = Math.max(1, Math.round(carbonBudget.remainingGt / carbonBudget.annualGt))

function cylinderPoints(n: number, yMin: number, yMax: number): Float32Array {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * (R - 0.04)
    out[i * 3] = Math.cos(a) * r
    out[i * 3 + 1] = yMin + Math.random() * (yMax - yMin)
    out[i * 3 + 2] = Math.sin(a) * r
  }
  return out
}

const build: SceneBuilder = (THREE, _canvas, renderer) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1.6, 0.1, 100)
  camera.position.set(0, 1.1, 5.2)
  camera.lookAt(0, 0.1, 0)
  const sprite = discSprite(THREE)
  const root = new THREE.Group()
  scene.add(root)

  const tank = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.CylinderGeometry(R, R, H, 48, 1, true), 30),
    new THREE.LineBasicMaterial({ color: '#f4efe4', transparent: true, opacity: 0.35 })
  )
  root.add(tank)

  const fillTop = -H / 2 + H * usedRatio
  const usedPts = makePoints(THREE, cylinderPoints(USED, -H / 2, fillTop), {
    size: 0.05,
    sprite,
    color: '#cf7a3d',
    opacity: 0.85,
    additive: true,
  })
  const freePts = makePoints(THREE, cylinderPoints(FREE, fillTop, H / 2), {
    size: 0.045,
    sprite,
    color: '#a8bd74',
    opacity: 0.55,
    additive: true,
  })
  root.add(usedPts, freePts)
  usedPts.geometry.setDrawRange(0, 0)

  // 차오르는 순서: y 오름차순으로 정렬해 두면 drawRange만 늘려도 아래부터 찬다
  const arr = usedPts.geometry.getAttribute('position') as InstanceType<
    typeof THREE.BufferAttribute
  >
  const pts: number[][] = []
  for (let i = 0; i < USED; i++) pts.push([arr.getX(i), arr.getY(i), arr.getZ(i)])
  pts.sort((a, b) => a[1] - b[1])
  pts.forEach((p, i) => arr.setXYZ(i, p[0], p[1], p[2]))
  arr.needsUpdate = true

  let t0 = 0
  return {
    render(ts) {
      if (!t0) t0 = ts
      const p = Math.min(1, (ts - t0) / FILL_MS)
      const eased = 1 - Math.pow(1 - p, 3)
      usedPts.geometry.setDrawRange(0, Math.round(USED * eased))
      root.rotation.y = ts * 0.00015
      renderer.render(scene, camera)
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposePoints(usedPts)
      disposePoints(freePts)
      tank.geometry.dispose()
      ;(tank.material as InstanceType<typeof THREE.LineBasicMaterial>).dispose()
      sprite.dispose()
    },
  }
}

export default function BudgetTank({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const status = useThreeScene(canvasRef, build)
  const L = t[lang]
  const pct = Math.round(usedRatio * 100)
  return (
    <VizFrame
      title={L.budgetTitle}
      caption={L.budgetCaption}
      sourceLabel={L.source}
      sourceName={`${carbonBudget.source.name}, ${carbonBudget.source.year}`}
      sourceUrl={carbonBudget.source.url}
      status={status}
      canvasRef={canvasRef}
      overlay={
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 font-mono text-[12px] text-[#f4efe4]">
          <div>
            <span className="text-2xl font-bold tabular-nums">{pct}%</span>{' '}
            <span className="opacity-80">{L.used}</span>
          </div>
          <div className="tabular-nums opacity-90">
            {carbonBudget.remainingGt} Gt {L.remaining}
          </div>
          <div className="opacity-75">{L.yearsLeft(yearsLeft)}</div>
        </div>
      }
      fallback={{
        columns: [L.year === 'Year' ? 'Budget' : '예산', 'Gt CO₂'],
        rows: [
          { label: L.used, value: String(carbonBudget.usedGt) },
          { label: L.remaining, value: String(carbonBudget.remainingGt) },
          { label: L.yearsLeft(yearsLeft), value: `${carbonBudget.annualGt} Gt/yr` },
        ],
        note: L.fallbackNote,
      }}
    />
  )
}
