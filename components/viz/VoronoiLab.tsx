'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_N,
  DEFAULT_SEED,
  DIST_ORDER,
  PICTURE_ORDER,
  VIEW_ORDER,
  t,
  type DistId,
  type Lang,
  type PictureId,
  type ViewId,
} from '@/data/charts/voronoi-lab'

/**
 * Voronoi 실험실. 점 분포 → Bowyer–Watson Delaunay → 쌍대로 Voronoi 셀 → Lloyd 완화.
 * 외부 라이브러리 없이 모두 정확한 기하로 계산하고 SVG로 그린다(래스터 흉내 없음).
 */

const W = 960
const H = 540
const MAX_LLOYD = 10
const LLOYD_MS = 350
const WX = 480 // Worley 캔버스 해상도
const WY = 270

type Pt = readonly [number, number]

// ---------------------------------------------------------------- 난수

function makeRng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  let a = (h ^ (h >>> 16)) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let x = a
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------- 점 분포

function uniformPoints(n: number, rnd: () => number): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < n; i++) out.push([rnd() * W, rnd() * H])
  return out
}

/** FMG의 getJitteredPoints: 정사각형 격자 칸 중심에서 ±0.9 × spacing/2 만큼 흔든다. */
function jitterPoints(n: number, rnd: () => number): Pt[] {
  const s = Math.sqrt((W * H) / n)
  const cols = Math.max(1, Math.round(W / s))
  const rows = Math.max(1, Math.round(H / s))
  const cw = W / cols
  const ch = H / rows
  const amp = 0.9 * s
  const out: Pt[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = (i + 0.5) * cw + (rnd() - 0.5) * amp
      const y = (j + 0.5) * ch + (rnd() - 0.5) * amp
      out.push([Math.min(W - 0.01, Math.max(0.01, x)), Math.min(H - 0.01, Math.max(0.01, y))])
    }
  }
  return out
}

/** Bridson(2007) 빠른 푸아송 디스크 샘플링. 반지름은 N개 근처가 나오도록 맞춘 값. */
const POISSON_RADIUS_FACTOR = 0.82
function poissonPoints(n: number, rnd: () => number): Pt[] {
  const r = Math.sqrt((W * H) / n) * POISSON_RADIUS_FACTOR
  const k = 30
  const cs = r / Math.SQRT2
  const gw = Math.ceil(W / cs)
  const gh = Math.ceil(H / cs)
  const grid = new Int32Array(gw * gh).fill(-1)
  const pts: Pt[] = []
  const active: number[] = []
  const add = (p: Pt) => {
    pts.push(p)
    active.push(pts.length - 1)
    grid[Math.floor(p[1] / cs) * gw + Math.floor(p[0] / cs)] = pts.length - 1
  }
  const ok = (x: number, y: number) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return false
    const gx = Math.floor(x / cs)
    const gy = Math.floor(y / cs)
    for (let j = Math.max(0, gy - 2); j <= Math.min(gh - 1, gy + 2); j++) {
      for (let i = Math.max(0, gx - 2); i <= Math.min(gw - 1, gx + 2); i++) {
        const q = grid[j * gw + i]
        if (q < 0) continue
        const dx = pts[q][0] - x
        const dy = pts[q][1] - y
        if (dx * dx + dy * dy < r * r) return false
      }
    }
    return true
  }
  add([rnd() * W, rnd() * H])
  while (active.length) {
    const ai = Math.floor(rnd() * active.length)
    const [px, py] = pts[active[ai]]
    let found = false
    for (let t = 0; t < k; t++) {
      const ang = rnd() * Math.PI * 2
      const rad = r * (1 + rnd())
      const x = px + Math.cos(ang) * rad
      const y = py + Math.sin(ang) * rad
      if (ok(x, y)) {
        add([x, y])
        found = true
        break
      }
    }
    if (!found) {
      active[ai] = active[active.length - 1]
      active.pop()
    }
  }
  return pts
}

function makePoints(dist: DistId, n: number, seed: string): Pt[] {
  const rnd = makeRng(`${seed}|${dist}|${n}`)
  if (dist === 'jitter') return jitterPoints(n, rnd)
  if (dist === 'poisson') return poissonPoints(n, rnd)
  return uniformPoints(n, rnd)
}

// ---------------------------------------------------------------- Delaunay (Bowyer–Watson)

interface Tri {
  a: number
  b: number
  c: number
  cx: number
  cy: number
  r2: number
}

function circum(X: number[], Y: number[], a: number, b: number, c: number): Tri {
  const ax = X[a]
  const ay = Y[a]
  const bx = X[b] - ax
  const by = Y[b] - ay
  const cx = X[c] - ax
  const cy = Y[c] - ay
  const d = 2 * (bx * cy - by * cx)
  if (Math.abs(d) < 1e-12) return { a, b, c, cx: ax, cy: ay, r2: -1 } // 퇴화: 어떤 점도 "안"이 아니다
  const b2 = bx * bx + by * by
  const c2 = cx * cx + cy * cy
  const ux = (cy * b2 - by * c2) / d
  const uy = (bx * c2 - cx * b2) / d
  return { a, b, c, cx: ax + ux, cy: ay + uy, r2: ux * ux + uy * uy }
}

/** 점 목록 → 삼각형 [i,j,k][] (슈퍼 삼각형 쪽 삼각형은 제외, 같은 좌표의 점은 첫 번째만 쓴다). */
export function delaunay(points: ReadonlyArray<Pt>): [number, number, number][] {
  const n = points.length
  if (n < 3) return []
  const X = points.map((p) => p[0])
  const Y = points.map((p) => p[1])
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (let i = 0; i < n; i++) {
    x0 = Math.min(x0, X[i])
    x1 = Math.max(x1, X[i])
    y0 = Math.min(y0, Y[i])
    y1 = Math.max(y1, Y[i])
  }
  const d = Math.max(x1 - x0, y1 - y0, 1)
  const mx = (x0 + x1) / 2
  const my = (y0 + y1) / 2
  X.push(mx - 30 * d, mx, mx + 30 * d)
  Y.push(my - 20 * d, my + 40 * d, my - 20 * d)
  let tris: Tri[] = [circum(X, Y, n, n + 1, n + 2)]
  const seen = new Set<string>()
  for (let p = 0; p < n; p++) {
    const key = `${X[p].toFixed(6)},${Y[p].toFixed(6)}`
    if (seen.has(key)) continue
    seen.add(key)
    const px = X[p]
    const py = Y[p]
    const keep: Tri[] = []
    const edges = new Map<number, [number, number, number]>() // key → [a, b, 개수]
    const M = n + 3
    const addEdge = (u: number, v: number) => {
      const k = u < v ? u * M + v : v * M + u
      const e = edges.get(k)
      if (e) e[2]++
      else edges.set(k, [u, v, 1])
    }
    for (const tr of tris) {
      const dx = px - tr.cx
      const dy = py - tr.cy
      if (dx * dx + dy * dy < tr.r2 * (1 - 1e-12)) {
        addEdge(tr.a, tr.b)
        addEdge(tr.b, tr.c)
        addEdge(tr.c, tr.a)
      } else keep.push(tr)
    }
    for (const [u, v, c] of edges.values()) if (c === 1) keep.push(circum(X, Y, u, v, p))
    tris = keep
  }
  const out: [number, number, number][] = []
  for (const tr of tris) if (tr.a < n && tr.b < n && tr.c < n) out.push([tr.a, tr.b, tr.c])
  return out
}

// ---------------------------------------------------------------- Voronoi (쌍대) + 클리핑

function clipPolygon(poly: Pt[]): Pt[] {
  // Sutherland–Hodgman: 0..W × 0..H 사각형에 대해 네 변을 차례로 자른다
  const edges: [(p: Pt) => number][] = [
    [(p) => p[0]],
    [(p) => W - p[0]],
    [(p) => p[1]],
    [(p) => H - p[1]],
  ]
  let cur = poly
  for (const [f] of edges) {
    if (!cur.length) break
    const next: Pt[] = []
    for (let i = 0; i < cur.length; i++) {
      const a = cur[i]
      const b = cur[(i + 1) % cur.length]
      const fa = f(a)
      const fb = f(b)
      if (fa >= 0) next.push(a)
      if (fa >= 0 !== fb >= 0) {
        const s = fa / (fa - fb)
        next.push([a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s])
      }
    }
    cur = next
  }
  return cur
}

function areaCentroid(poly: Pt[]): { area: number; cx: number; cy: number } {
  let a2 = 0
  let sx = 0
  let sy = 0
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i]
    const [x1, y1] = poly[(i + 1) % poly.length]
    const cr = x0 * y1 - x1 * y0
    a2 += cr
    sx += (x0 + x1) * cr
    sy += (y0 + y1) * cr
  }
  if (Math.abs(a2) < 1e-9) {
    const m = poly.length || 1
    return {
      area: 0,
      cx: poly.reduce((s, p) => s + p[0], 0) / m,
      cy: poly.reduce((s, p) => s + p[1], 0) / m,
    }
  }
  return { area: Math.abs(a2) / 2, cx: sx / (3 * a2), cy: sy / (3 * a2) }
}

interface Circle {
  cx: number
  cy: number
  r: number
}

interface Geo {
  n: number
  cells: Pt[][] // 사각형으로 잘린 Voronoi 셀(점 순서와 같음)
  area: Float64Array
  centroid: Pt[]
  neighbours: number[][]
  circles: Circle[][] // 각 점을 꼭짓점으로 갖는 삼각형의 외접원
  delEdges: [number, number][]
  urqEdges: [number, number][]
  cv: number
  meanNb: number
  minGap: number
}

/**
 * 실제 점 n개 + 사각형 바깥 경계 가짜 점(FMG처럼)을 함께 삼각분할한다.
 * 가짜 점은 셀이 없고, 실제 셀이 유한해지도록 해 줄 뿐이다.
 * 통계(CV 등)는 사각형으로 잘린 모든 셀을 포함한다(경계 셀도 포함).
 * Delaunay/Urquhart 변은 세 꼭짓점이 모두 실제 점인 삼각형에서만 만든다.
 */
function buildGeo(pts: ReadonlyArray<Pt>): Geo {
  const n = pts.length
  const s = Math.sqrt((W * H) / Math.max(1, n))
  const all: Pt[] = pts.slice()
  const off = 3 * s // 가짜 점이 안쪽 셀을 깎지 않도록 FMG(−1 spacing)보다 멀리 둔다
  const step = 2 * s
  for (let x = -off; x <= W + off + 1e-6; x += step) {
    all.push([x, -off], [x, H + off])
  }
  for (let y = -off + step; y < H + off - 1e-6; y += step) {
    all.push([-off, y], [W + off, y])
  }
  const tris = delaunay(all)
  const around: Circle[][] = Array.from({ length: n }, () => [])
  const nbSet: Set<number>[] = Array.from({ length: n }, () => new Set())
  const delSet = new Map<number, [number, number]>()
  const longest = new Set<number>()
  const key = (u: number, v: number) => (u < v ? u * 100000 + v : v * 100000 + u)
  const dist2 = (u: number, v: number) =>
    (all[u][0] - all[v][0]) ** 2 + (all[u][1] - all[v][1]) ** 2
  const X = all.map((p) => p[0])
  const border = new Uint8Array(n)
  const Y = all.map((p) => p[1])
  for (const [a, b, c] of tris) {
    const tr = circum(X, Y, a, b, c)
    const r = Math.sqrt(Math.max(0, tr.r2))
    const vs = [a, b, c]
    for (const v of vs) if (v < n) around[v].push({ cx: tr.cx, cy: tr.cy, r })
    // 가장자리 링 점과 삼각형을 이루는 셀은 테두리 셀로 본다
    if (a >= n || b >= n || c >= n) for (const v of vs) if (v < n) border[v] = 1
    const pairs: [number, number][] = [
      [a, b],
      [b, c],
      [c, a],
    ]
    for (const [u, v] of pairs) {
      if (u < n && v < n) {
        nbSet[u].add(v)
        nbSet[v].add(u)
      }
    }
    if (a < n && b < n && c < n) {
      let best = -1
      let bk = 0
      for (const [u, v] of pairs) {
        const k = key(u, v)
        if (!delSet.has(k)) delSet.set(k, u < v ? [u, v] : [v, u])
        const d = dist2(u, v)
        if (d > best) {
          best = d
          bk = k
        }
      }
      longest.add(bk)
    }
  }
  const cells: Pt[][] = []
  const area = new Float64Array(n)
  const centroid: Pt[] = []
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[i]
    const verts = around[i]
      .map((c) => [c.cx, c.cy] as Pt)
      .sort((p, q) => Math.atan2(p[1] - py, p[0] - px) - Math.atan2(q[1] - py, q[0] - px))
    const poly = clipPolygon(verts)
    cells.push(poly)
    const ac = areaCentroid(poly)
    area[i] = ac.area
    centroid.push(poly.length >= 3 ? [ac.cx, ac.cy] : [px, py])
  }
  const delEdges = [...delSet.values()]
  const urqEdges = [...delSet.entries()].filter(([k]) => !longest.has(k)).map(([, e]) => e)
  const neighbours = nbSet.map((st) => [...st])
  let sum = 0
  for (let i = 0; i < n; i++) sum += area[i]
  const mean = sum / Math.max(1, n)
  let varSum = 0
  for (let i = 0; i < n; i++) varSum += (area[i] - mean) ** 2
  const cv = mean > 0 ? Math.sqrt(varSum / Math.max(1, n)) / mean : 0
  // 평균 이웃 수는 내부 셀만 센다(오일러 공식에 따라 6에 가까워진다)
  let nbTotal = 0
  let interior = 0
  for (let i = 0; i < n; i++) {
    if (border[i]) continue
    nbTotal += neighbours[i].length
    interior++
  }
  let minGap = Infinity
  for (let i = 0; i < n; i++) {
    for (const j of neighbours[i]) {
      if (j > i) minGap = Math.min(minGap, Math.sqrt(dist2(i, j)))
    }
  }
  return {
    n,
    cells,
    area,
    centroid,
    neighbours,
    circles: around,
    delEdges,
    urqEdges,
    cv,
    meanNb: nbTotal / Math.max(1, interior),
    minGap: Number.isFinite(minGap) ? minGap : 0,
  }
}

// ---------------------------------------------------------------- Worley 노이즈

function worleyUrl(pts: ReadonlyArray<Pt>, mode: 'worleyF1' | 'worleyF2F1'): string {
  const n = pts.length
  const cs = Math.sqrt((W * H) / Math.max(1, n))
  const gw = Math.ceil(W / cs)
  const gh = Math.ceil(H / cs)
  const buckets: number[][] = Array.from({ length: gw * gh }, () => [])
  for (let i = 0; i < n; i++) {
    const gx = Math.min(gw - 1, Math.floor(pts[i][0] / cs))
    const gy = Math.min(gh - 1, Math.floor(pts[i][1] / cs))
    buckets[gy * gw + gx].push(i)
  }
  const canvas = document.createElement('canvas')
  canvas.width = WX
  canvas.height = WY
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(WX, WY)
  const sx = W / WX
  const sy = H / WY
  // 어두운 잉크 → 러스트 → 크림
  const stops: [number, number, number][] = [
    [38, 50, 61],
    [168, 56, 26],
    [226, 140, 70],
    [248, 236, 214],
  ]
  const scale = mode === 'worleyF1' ? cs * 0.9 : cs * 0.55
  for (let py = 0; py < WY; py++) {
    for (let px = 0; px < WX; px++) {
      const x = (px + 0.5) * sx
      const y = (py + 0.5) * sy
      const gx = Math.min(gw - 1, Math.floor(x / cs))
      const gy = Math.min(gh - 1, Math.floor(y / cs))
      let d1 = Infinity
      let d2 = Infinity
      for (let ring = 0; ring < Math.max(gw, gh); ring++) {
        if (ring > 0 && (ring - 1) * cs > Math.sqrt(d2)) break
        for (let j = gy - ring; j <= gy + ring; j++) {
          if (j < 0 || j >= gh) continue
          const edgeRow = j === gy - ring || j === gy + ring
          for (let i = gx - ring; i <= gx + ring; i += edgeRow ? 1 : 2 * ring || 1) {
            if (i < 0 || i >= gw) continue
            for (const q of buckets[j * gw + i]) {
              const dd = (pts[q][0] - x) ** 2 + (pts[q][1] - y) ** 2
              if (dd < d1) {
                d2 = d1
                d1 = dd
              } else if (dd < d2) d2 = dd
            }
          }
        }
      }
      const f1 = Math.sqrt(d1)
      const v = Math.min(1, (mode === 'worleyF1' ? f1 : Math.sqrt(d2) - f1) / scale)
      const pos = v * (stops.length - 1)
      const lo = Math.min(stops.length - 2, Math.floor(pos))
      const f = pos - lo
      const o = (py * WX + px) * 4
      for (let ch = 0; ch < 3; ch++) {
        img.data[o + ch] = stops[lo][ch] * (1 - f) + stops[lo + 1][ch] * f
      }
      img.data[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}

// ---------------------------------------------------------------- 그리기 보조

const INK = '#26323d'
const ACCENT = '#d9622b'
const PAPER = '#f1eadb'
const RAMP_LO = [247, 236, 214]
const RAMP_HI = [158, 52, 22]

function rampColor(ratio: number) {
  const f = Math.min(1, Math.max(0, ratio / 2))
  const c = RAMP_LO.map((lo, i) => Math.round(lo + (RAMP_HI[i] - lo) * f))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

const polyPath = (poly: Pt[]) =>
  poly.length ? `M${poly.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z` : ''

function edgesPath(pts: ReadonlyArray<Pt>, edges: [number, number][]) {
  return edges
    .map(([a, b]) => {
      const p = pts[a]
      const q = pts[b]
      return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`
    })
    .join('')
}

const newSeed = () => String(10000 + Math.floor(Math.random() * 90000))

const chipCls = (on: boolean) =>
  `text-ink focus-visible:outline-accent inline-flex cursor-pointer items-center rounded-full border px-3.5 py-1.5 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${
    on ? 'border-accent bg-accent/10' : 'border-line bg-surface'
  }`
const smallBtn =
  'text-ink border-line bg-surface focus-visible:outline-accent cursor-pointer rounded-full border px-3 py-1 text-[12.5px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-40'

interface Relaxed {
  base: Pt[]
  pts: Pt[]
  iter: number
}

export default function VoronoiLab({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang]
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const [n, setN] = useState(DEFAULT_N)
  const [dist, setDist] = useState<DistId>('uniform')
  const [views, setViews] = useState<Set<ViewId>>(new Set<ViewId>(['points', 'voronoi']))
  const [picture, setPicture] = useState<PictureId>('geometry')
  const [relaxed, setRelaxed] = useState<Relaxed | null>(null)
  const [playing, setPlaying] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [sel, setSel] = useState<number | null>(null)
  const [worley, setWorley] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReduced(mq.matches)
    onMq()
    mq.addEventListener('change', onMq)
    return () => mq.removeEventListener('change', onMq)
  }, [])

  const base = useMemo(() => makePoints(dist, n, seed.trim() || DEFAULT_SEED), [dist, n, seed])
  const cur: Relaxed = relaxed && relaxed.base === base ? relaxed : { base, pts: base, iter: 0 }
  const geo = useMemo(() => buildGeo(cur.pts), [cur.pts])
  const meanArea = (W * H) / Math.max(1, geo.n)

  const step = useCallback(() => {
    setRelaxed((r) => {
      const c = r && r.base === base ? r : { base, pts: base, iter: 0 }
      if (c.iter >= MAX_LLOYD) return c
      const g = buildGeo(c.pts)
      return { base, pts: g.centroid, iter: c.iter + 1 }
    })
  }, [base])

  // 분포·점 수·시드가 바뀌면 재생을 멈추고 선택을 푼다
  useEffect(() => {
    setPlaying(false)
    setSel(null)
  }, [base])

  useEffect(() => {
    if (!playing) return
    if (cur.iter >= MAX_LLOYD) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(step, LLOYD_MS)
    return () => window.clearTimeout(id)
  }, [playing, cur.iter, step])

  useEffect(() => {
    if (picture === 'geometry') return
    setWorley(worleyUrl(cur.pts, picture))
  }, [picture, cur.pts])

  const toggleView = (v: ViewId) =>
    setViews((s) => {
      const nx = new Set(s)
      if (nx.has(v)) nx.delete(v)
      else nx.add(v)
      return nx
    })

  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = ((e.clientY - r.top) / r.height) * H
    let best = -1
    let bd = Infinity
    for (let i = 0; i < cur.pts.length; i++) {
      const d = (cur.pts[i][0] - x) ** 2 + (cur.pts[i][1] - y) ** 2
      if (d < bd) {
        bd = d
        best = i
      }
    }
    setSel(best >= 0 ? best : null)
  }

  const isGeo = picture === 'geometry'
  const viewLabels = VIEW_ORDER.filter((v) => views.has(v)).map((v) => l.views[v])
  const alt = l.alt(l.dists[dist].label, viewLabels.join(', ') || '-', l.pictures[picture], geo.n)
  const selOk = sel !== null && sel < geo.n
  const dotW = geo.n > 400 ? 3.5 : 5

  const delPath = useMemo(
    () => (views.has('delaunay') ? edgesPath(cur.pts, geo.delEdges) : ''),
    [geo, views, cur.pts]
  )
  const urqPath = useMemo(
    () => (views.has('urquhart') ? edgesPath(cur.pts, geo.urqEdges) : ''),
    [geo, views, cur.pts]
  )
  const vorPath = useMemo(
    () => (views.has('voronoi') ? geo.cells.map(polyPath).join('') : ''),
    [geo, views]
  )
  const dotPath = useMemo(
    () =>
      views.has('points')
        ? cur.pts.map((p) => `M${p[0].toFixed(1)} ${p[1].toFixed(1)}h0`).join('')
        : '',
    [cur.pts, views]
  )

  return (
    <figure className="my-8 grid grid-cols-[minmax(0,1fr)] gap-3">
      <div className="grid gap-2">
        <div role="group" aria-label={l.distGroup} className="flex flex-wrap gap-2">
          {DIST_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={dist === id}
              onClick={() => setDist(id)}
              className={chipCls(dist === id)}
            >
              {l.dists[id].label}
            </button>
          ))}
        </div>
        <div role="group" aria-label={l.viewGroup} className="flex flex-wrap gap-2">
          {VIEW_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={views.has(id)}
              onClick={() => toggleView(id)}
              className={chipCls(views.has(id))}
            >
              {l.views[id]}
            </button>
          ))}
        </div>
        <div role="group" aria-label={l.pictureGroup} className="flex flex-wrap gap-2">
          {PICTURE_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={picture === id}
              onClick={() => setPicture(id)}
              className={chipCls(picture === id)}
            >
              {l.pictures[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="border-line overflow-hidden rounded-2xl border" style={{ background: PAPER }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={alt}
          className="block h-auto w-full"
          style={{ aspectRatio: '16 / 9', touchAction: 'pan-y' }}
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={(e) => {
            if (e.pointerType !== 'touch') setSel(null)
          }}
        >
          {isGeo &&
            views.has('fill') &&
            geo.cells.map((poly, i) => (
              <path key={i} d={polyPath(poly)} fill={rampColor(geo.area[i] / meanArea)} />
            ))}
          {!isGeo && worley && <image href={worley} x={0} y={0} width={W} height={H} />}

          {selOk && sel !== null && (
            <g>
              <path d={polyPath(geo.cells[sel])} fill={ACCENT} fillOpacity={0.3} />
              {geo.neighbours[sel].map((j) => (
                <path
                  key={j}
                  d={polyPath(geo.cells[j])}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={1.6}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          )}

          {vorPath && (
            <path
              d={vorPath}
              fill="none"
              stroke={isGeo ? 'rgba(38,50,61,.6)' : 'rgba(255,255,255,.55)'}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {delPath && (
            <path
              d={delPath}
              fill="none"
              stroke={ACCENT}
              strokeWidth={1.2}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {urqPath && (
            <path
              d={urqPath}
              fill="none"
              stroke={INK}
              strokeWidth={2.6}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {selOk &&
            sel !== null &&
            geo.circles[sel]
              .filter((c) => c.r < 1500)
              .map((c, i) => (
                <circle
                  key={i}
                  cx={c.cx}
                  cy={c.cy}
                  r={c.r}
                  fill="none"
                  stroke={INK}
                  strokeWidth={1.2}
                  strokeDasharray="5 4"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

          {dotPath && (
            <path
              d={dotPath}
              fill="none"
              stroke={isGeo ? INK : '#ffffff'}
              strokeWidth={dotW}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {selOk && sel !== null && (
            <path
              d={`M${cur.pts[sel][0]} ${cur.pts[sel][1]}h0`}
              stroke={ACCENT}
              strokeWidth={9}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>

      <div className="grid gap-1.5">
        <div className="text-muted font-mono text-[12px] leading-relaxed">
          {l.readout(
            geo.n,
            geo.cv.toFixed(2),
            geo.meanNb.toFixed(2),
            geo.minGap.toFixed(1),
            cur.iter
          )}
        </div>
        <div className="text-muted min-h-[1.25rem] font-mono text-[11.5px] leading-relaxed">
          {selOk && sel !== null ? l.hover(geo.neighbours[sel].length) : l.hoverHint}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button type="button" className={smallBtn} disabled={cur.iter >= MAX_LLOYD} onClick={step}>
          {l.relax}
        </button>
        {!reduced && (
          <button
            type="button"
            className={smallBtn}
            aria-pressed={playing}
            disabled={!playing && cur.iter >= MAX_LLOYD}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? l.stop : l.auto}
          </button>
        )}
        <button
          type="button"
          className={smallBtn}
          disabled={cur.iter === 0}
          onClick={() => {
            setPlaying(false)
            setRelaxed(null)
          }}
        >
          {l.reset}
        </button>
        <label className="text-muted flex items-center gap-2 font-mono text-[12px]">
          {l.count} {n}
          <input
            type="range"
            min={60}
            max={600}
            step={20}
            value={n}
            aria-label={l.count}
            onChange={(e) => setN(Number(e.target.value))}
            className="accent-accent w-28"
          />
        </label>
        <label className="text-muted flex items-center gap-2 font-mono text-[12px]">
          {l.seed}
          <input
            type="text"
            value={seed}
            maxLength={12}
            onChange={(e) => setSeed(e.target.value)}
            className="text-ink border-line bg-surface focus-visible:outline-accent w-24 rounded-md border px-2 py-1 font-mono text-[12px] focus-visible:outline-2"
          />
        </label>
        <button type="button" className={smallBtn} onClick={() => setSeed(newSeed())}>
          {l.newSeed}
        </button>
      </div>

      <div className="border-line bg-surface grid gap-1.5 rounded-xl border p-3.5">
        <p className="text-ink m-0 text-[14px] leading-relaxed">{l.dists[dist].body}</p>
        {cur.iter > 0 && <p className="text-ink m-0 text-[14px] leading-relaxed">{l.lloydNote}</p>}
        {isGeo && views.has('urquhart') && (
          <p className="text-ink m-0 text-[14px] leading-relaxed">{l.urquhartNote}</p>
        )}
        {isGeo && views.has('fill') && (
          <p className="text-muted m-0 text-[13px] leading-relaxed">{l.fillNote}</p>
        )}
        {!isGeo && <p className="text-ink m-0 text-[14px] leading-relaxed">{l.worleyNote}</p>}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {l.announce(l.dists[dist].label, geo.n, cur.iter)}
      </p>

      <figcaption className="text-ink/75 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}</span> {l.caption}
      </figcaption>
    </figure>
  )
}
