'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SEED,
  STAGE_ORDER,
  t,
  type Lang,
  type StageId,
} from '@/data/charts/fmg-world-builder'

/**
 * Azgaar's Fantasy Map Generator 파이프라인의 장난감 재구현.
 * 점 뿌리기 → 보로노이 → 높이 → 해안 → 강 → 국가 확장을 같은 알고리즘(단순화)으로 돌린다.
 * 셀 ID 래스터로 보로노이를 흉내 내므로 외부 라이브러리가 없다.
 */

const W = 960
const H = 540
const RS = 2 // 래스터 축소 비율
const RW = W / RS
const RH = H / RS
const SEA = 20
const CELLS_DESIRED = 1400
const STATE_COUNT = 7
const EXPAND_MS = 4200
const FRONTIER = 25

// ---------------------------------------------------------------- 생성 시작

/** 문자열 시드 → mulberry32 */
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

// 0xAABBGGRR (리틀 엔디안 ImageData용)
const pack = (r: number, g: number, b: number) => (0xff000000 | (b << 16) | (g << 8) | r) >>> 0
const hex = (s: string) =>
  pack(parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16))
function mix(a: number, b: number, t: number) {
  const r = (a & 255) * (1 - t) + (b & 255) * t
  const g = ((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t
  const bl = ((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t
  return pack(r | 0, g | 0, bl | 0)
}

// 높이 → 색. 물은 깊을수록 어둡고 육지는 초록-노랑-주황-갈색-흰색
const LAND_STOPS: [number, string][] = [
  [20, '#5f9e5a'],
  [35, '#b3cc6a'],
  [50, '#f0dc7c'],
  [70, '#d98a45'],
  [88, '#8f6845'],
  [100, '#f4f1ee'],
]
const LAND_PACKED = LAND_STOPS.map(([h, c]) => [h, hex(c)] as [number, number])
function heightColor(h: number) {
  if (h < SEA) return mix(hex('#1c4a78'), hex('#62a8d0'), Math.max(0, h) / SEA)
  for (let i = 1; i < LAND_PACKED.length; i++) {
    if (h <= LAND_PACKED[i][0]) {
      const [h0, c0] = LAND_PACKED[i - 1]
      const [h1, c1] = LAND_PACKED[i]
      return mix(c0, c1, (h - h0) / (h1 - h0))
    }
  }
  return LAND_PACKED[LAND_PACKED.length - 1][1]
}

const BAND = [hex('#b9deec'), hex('#93c6de'), hex('#6dabcb'), hex('#4b8bb2')]
const LAND_FLAT = hex('#e4dcb4')
const PAPER = hex('#f1eadb')
const INK = hex('#26323d')
const STATE_COLORS = [
  '#e4807a',
  '#eaa95e',
  '#dccb5c',
  '#7fc080',
  '#5db6b4',
  '#7f97dc',
  '#bb8ad8',
].map(hex)

class MinHeap {
  keys: number[] = []
  vals: number[] = []
  get size() {
    return this.keys.length
  }
  push(k: number, v: number) {
    const ks = this.keys
    const vs = this.vals
    let i = ks.length
    ks.push(k)
    vs.push(v)
    while (i > 0) {
      const p = (i - 1) >> 1
      if (ks[p] <= k) break
      ks[i] = ks[p]
      vs[i] = vs[p]
      i = p
    }
    ks[i] = k
    vs[i] = v
  }
  pop(): [number, number] {
    const ks = this.keys
    const vs = this.vals
    const top: [number, number] = [ks[0], vs[0]]
    const k = ks.pop() as number
    const v = vs.pop() as number
    const n = ks.length
    if (n > 0) {
      let i = 0
      for (;;) {
        let c = 2 * i + 1
        if (c >= n) break
        if (c + 1 < n && ks[c + 1] < ks[c]) c++
        if (ks[c] >= k) break
        ks[i] = ks[c]
        vs[i] = vs[c]
        i = c
      }
      ks[i] = k
      vs[i] = v
    }
    return top
  }
}

interface World {
  n: number
  spacing: number
  cellsX: number
  cellsY: number
  ox: number
  oy: number
  px: Float32Array
  py: Float32Array
  cid: Uint16Array
  edge: Uint8Array
  h: Float32Array
  isLand: Uint8Array
  river: Uint8Array
  flux: Float32Array
  down: Int32Array
  riverCount: number
  owner: Int16Array
  order: Int32Array
  costAt: Float32Array
  rank: Int32Array
  capitals: number[]
  maxCost: number
  landPct: number
  ms: number
  vCol: Uint32Array
  hCol: Uint32Array
  cCol: Uint32Array
  mutCol: Uint32Array
  revCol: Uint32Array
  frontCol: Uint32Array
}

function generate(seed: string): World {
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0
  const rnd = makeRng(seed)
  const rr = (a: number, b: number) => a + rnd() * (b - a)

  // 1. 흔들린 격자점 (FMG getJitteredPoints)
  const spacing = Math.sqrt((W * H) / CELLS_DESIRED)
  const cellsX = Math.floor(W / spacing)
  const cellsY = Math.floor(H / spacing)
  const n = cellsX * cellsY
  const ox = (W - cellsX * spacing) / 2
  const oy = (H - cellsY * spacing) / 2
  const px = new Float32Array(n)
  const py = new Float32Array(n)
  for (let gy = 0; gy < cellsY; gy++) {
    for (let gx = 0; gx < cellsX; gx++) {
      const i = gy * cellsX + gx
      px[i] = ox + (gx + 0.5) * spacing + (rnd() - 0.5) * 0.9 * spacing
      py[i] = oy + (gy + 0.5) * spacing + (rnd() - 0.5) * 0.9 * spacing
    }
  }

  // 2. 보로노이: 5x5 이웃 격자 칸에서 가장 가까운 점을 래스터에 기록
  const nearest = (x: number, y: number) => {
    const gx = Math.floor((x - ox) / spacing)
    const gy = Math.floor((y - oy) / spacing)
    let best = 0
    let bd = Infinity
    for (let j = Math.max(0, gy - 2); j <= Math.min(cellsY - 1, gy + 2); j++) {
      for (let i = Math.max(0, gx - 2); i <= Math.min(cellsX - 1, gx + 2); i++) {
        const c = j * cellsX + i
        const dx = px[c] - x
        const dy = py[c] - y
        const d = dx * dx + dy * dy
        if (d < bd) {
          bd = d
          best = c
        }
      }
    }
    return best
  }
  const cid = new Uint16Array(RW * RH)
  for (let ry = 0; ry < RH; ry++) {
    for (let rx = 0; rx < RW; rx++) {
      cid[ry * RW + rx] = nearest((rx + 0.5) * RS, (ry + 0.5) * RS)
    }
  }
  const edge = new Uint8Array(RW * RH)
  const pairs = new Set<number>()
  for (let ry = 0; ry < RH; ry++) {
    for (let rx = 0; rx < RW; rx++) {
      const p = ry * RW + rx
      const a = cid[p]
      if (rx < RW - 1 && cid[p + 1] !== a) {
        edge[p] = 1
        const b = cid[p + 1]
        pairs.add(a < b ? a * n + b : b * n + a)
      }
      if (ry < RH - 1 && cid[p + RW] !== a) {
        edge[p] = 1
        const b = cid[p + RW]
        pairs.add(a < b ? a * n + b : b * n + a)
      }
    }
  }
  const nb: number[][] = Array.from({ length: n }, () => [])
  pairs.forEach((key) => {
    const a = Math.floor(key / n)
    const b = key % n
    nb[a].push(b)
    nb[b].push(a)
  })

  // 3. 높이 지도 (FMG 템플릿 명령 단순화)
  const lim = (v: number) => (v < 0 ? 0 : v > 100 ? 100 : v)
  const blob = (start: number, height: number, power: number) => {
    const ch = new Float32Array(n)
    ch[start] = height
    const q = [start]
    for (let qi = 0; qi < q.length; qi++) {
      const c = q[qi]
      for (const e of nb[c]) {
        if (ch[e]) continue
        ch[e] = ch[c] ** power * (rnd() * 0.2 + 0.9)
        if (ch[e] > 1) q.push(e)
      }
    }
    return ch
  }
  const BLOB_POWER = 0.9 // 셀이 적을수록 언덕이 빨리 사그라든다
  const LINE_POWER = 0.81
  const makeHeights = (retry: boolean) => {
    const h = new Float32Array(n)
    const addHill = (x: number, y: number, height: number, sign = 1) => {
      const ch = blob(nearest(x, y), height, BLOB_POWER)
      for (let i = 0; i < n; i++) h[i] = lim(h[i] + sign * ch[i])
    }
    const addRange = (height: number) => {
      const sx = rr(0.2, 0.8) * W
      const sy = rr(0.25, 0.75) * H
      let ex = sx
      let ey = sy
      for (let tries = 0; tries < 12 && Math.hypot(ex - sx, ey - sy) < 0.25 * W; tries++) {
        ex = rr(0.15, 0.85) * W
        ey = rr(0.2, 0.8) * H
      }
      const start = nearest(sx, sy)
      const end = nearest(ex, ey)
      const used = new Uint8Array(n)
      used[start] = 1
      const ridge = [start]
      let cur = start
      while (cur !== end && ridge.length < 300) {
        let best = -1
        let bd = Infinity
        for (const e of nb[cur]) {
          if (used[e]) continue
          let d = (px[e] - px[end]) ** 2 + (py[e] - py[end]) ** 2
          if (rnd() > 0.85) d /= 2 // 15% 확률로 능선이 꿈틀댄다
          if (d < bd) {
            bd = d
            best = e
          }
        }
        if (best < 0) break
        used[best] = 1
        ridge.push(best)
        cur = best
      }
      let hh = height
      let queue = ridge
      while (queue.length) {
        const frontier = queue
        queue = []
        for (const c of frontier) h[c] = lim(h[c] + hh * (rnd() * 0.3 + 0.85))
        hh = hh ** LINE_POWER - 1
        if (hh < 2) break
        for (const c of frontier) {
          for (const e of nb[c]) {
            if (!used[e]) {
              used[e] = 1
              queue.push(e)
            }
          }
        }
      }
    }
    const smooth = (fr = 2) => {
      const next = new Float32Array(n)
      for (let i = 0; i < n; i++) {
        let s = h[i]
        for (const e of nb[i]) s += h[e]
        next[i] = lim((h[i] * (fr - 1) + s / (nb[i].length + 1)) / fr)
      }
      h.set(next)
    }
    const mask = (power = 3) => {
      for (let i = 0; i < n; i++) {
        const nx = (2 * px[i]) / W - 1
        const ny = (2 * py[i]) / H - 1
        const distance = (1 - nx * nx) * (1 - ny * ny)
        h[i] = lim((h[i] * (power - 1) + h[i] * distance) / power)
      }
    }
    const rx = () => rr(0.2, 0.8) * W
    const ry = () => rr(0.25, 0.75) * H

    addHill(rr(0.55, 0.65) * W, rr(0.45, 0.55) * H, rr(85, 95))
    if (retry) addHill(0.5 * W, 0.5 * H, 92)
    const hills = 4 + Math.floor(rnd() * 3)
    for (let i = 0; i < hills; i++) addHill(rx(), ry(), rr(25, 40))
    const ranges = 1 + Math.floor(rnd() * 2)
    for (let i = 0; i < ranges; i++) addRange(rr(40, 55))
    smooth()
    smooth()
    for (let i = 0; i < 3; i++) addHill(rx(), ry(), rr(15, 25))
    for (let i = 0; i < 2; i++) addHill(rx(), ry(), rr(15, 25), -1)
    mask(3)
    smooth()
    return h
  }
  const landShare = (h: Float32Array) => {
    let c = 0
    for (let i = 0; i < n; i++) if (h[i] >= SEA) c++
    return c / n
  }
  let h = makeHeights(false)
  for (let attempt = 0; attempt < 3; attempt++) {
    const s = landShare(h)
    if (s >= 0.22 && s <= 0.62) break
    h = makeHeights(s < 0.22)
  }
  if (landShare(h) < 0.15) h = makeHeights(true)

  // 4. 지형 요소: 육지/물 연결 성분, 해안, 해안에서의 거리
  const isLand = new Uint8Array(n)
  let landCount = 0
  for (let i = 0; i < n; i++) {
    if (h[i] >= SEA) {
      isLand[i] = 1
      landCount++
    }
  }
  const comp = new Int32Array(n).fill(-1)
  const compSize: number[] = []
  for (let i = 0; i < n; i++) {
    if (comp[i] >= 0) continue
    const id = compSize.length
    comp[i] = id
    const q = [i]
    for (let qi = 0; qi < q.length; qi++) {
      for (const e of nb[q[qi]]) {
        if (comp[e] < 0 && isLand[e] === isLand[i]) {
          comp[e] = id
          q.push(e)
        }
      }
    }
    compSize.push(q.length)
  }
  const isCoast = new Uint8Array(n)
  const depth = new Int8Array(n) // 물: -1, -2, ...
  let ring: number[] = []
  for (let i = 0; i < n; i++) {
    if (!isLand[i]) continue
    for (const e of nb[i]) {
      if (!isLand[e]) {
        isCoast[i] = 1
        if (!depth[e]) {
          depth[e] = -1
          ring.push(e)
        }
      }
    }
  }
  for (let d = 2; ring.length && d < 100; d++) {
    const next: number[] = []
    for (const c of ring) {
      for (const e of nb[c]) {
        if (!isLand[e] && !depth[e]) {
          depth[e] = -d
          next.push(e)
        }
      }
    }
    ring = next
  }

  // 5. 강: 강수 → 웅덩이 메우기 → 높은 셀부터 흘려보내기
  const prec = new Float32Array(n)
  const landIdx: number[] = []
  for (let i = 0; i < n; i++) {
    if (!isLand[i]) continue
    landIdx.push(i)
    let mx = 0
    for (const e of nb[i]) if (px[e] > px[i] + spacing * 0.4) mx = Math.max(mx, h[e])
    prec[i] = 8 + rnd() * 6 + (mx >= 40 ? 4 : mx >= 30 ? 2 : 0) // 바람받이 쪽에 비가 더 온다
  }
  const hf = Float32Array.from(h)
  const onEdge = (i: number) =>
    px[i] < spacing || px[i] > W - spacing || py[i] < spacing || py[i] > H - spacing
  landIdx.sort((a, b) => hf[a] - hf[b])
  for (let it = 0; it < 40; it++) {
    let changed = false
    for (const i of landIdx) {
      if (onEdge(i)) continue
      let mn = Infinity
      for (const e of nb[i]) if (hf[e] < mn) mn = hf[e]
      if (hf[i] <= mn) {
        hf[i] = mn + 0.1
        changed = true
      }
    }
    if (!changed) break
  }
  const flux = new Float32Array(n)
  const down = new Int32Array(n).fill(-1)
  const byHigh = landIdx.slice().sort((a, b) => hf[b] - hf[a])
  for (const i of byHigh) {
    let best = -1
    let bv = hf[i]
    for (const e of nb[i]) {
      const v = isLand[e] ? hf[e] : h[e]
      if (v < bv) {
        bv = v
        best = e
      }
    }
    down[i] = best
    flux[i] += prec[i]
    if (best >= 0) flux[best] += flux[i]
  }
  const mouthsAt = (th: number) => {
    let m = 0
    for (const i of landIdx) {
      if (flux[i] > th && (down[i] < 0 || !isLand[down[i]])) m++
    }
    return m
  }
  let threshold = 400
  for (const th of [14, 18, 22, 27, 33, 40, 55, 70, 90, 115, 145, 180, 230, 300, 400]) {
    if (mouthsAt(th) <= 16) {
      threshold = th
      break
    }
  }
  const river = new Uint8Array(n)
  for (const i of landIdx) if (flux[i] > threshold) river[i] = 1
  const riverCount = mouthsAt(threshold)

  // 6. 국가: 수도 배치 → 다중 시작점 다익스트라
  const suit = new Float32Array(n)
  for (const i of landIdx) {
    suit[i] = 100 - (h[i] - SEA) * 0.8 + (river[i] ? 30 : 0) + (isCoast[i] ? 15 : 0)
  }
  const wanted = Math.min(STATE_COUNT, Math.floor(landCount / 50))
  const cand = landIdx
    .filter((i) => compSize[comp[i]] >= 15)
    .map((i) => ({ i, s: suit[i] * (0.5 + rnd() * 0.5) }))
    .sort((a, b) => b.s - a.s)
  const capitals: number[] = []
  let gap = (W + H) / 2 / Math.max(1, wanted)
  for (let guard = 0; capitals.length < wanted && guard < 12; guard++) {
    for (const { i } of cand) {
      if (capitals.length >= wanted) break
      if (capitals.includes(i)) continue
      if (capitals.every((c) => Math.hypot(px[c] - px[i], py[c] - py[i]) >= gap)) capitals.push(i)
    }
    gap /= 1.2
  }
  const expansion = capitals.map(() => Math.round((1 + rnd() * 1.5) * 10) / 10)
  const maxCost = Math.round((landCount / 2) * 1.6)
  const cost = new Float32Array(n).fill(Infinity)
  const owner = new Int16Array(n).fill(-1)
  const done = new Uint8Array(n)
  const heap = new MinHeap()
  capitals.forEach((c, s) => {
    cost[c] = 0
    owner[c] = s
    heap.push(0, c)
  })
  const orderArr: number[] = []
  const costArr: number[] = []
  while (heap.size) {
    const [p, cell] = heap.pop()
    if (done[cell]) continue
    done[cell] = 1
    if (isLand[cell]) {
      orderArr.push(cell)
      costArr.push(p)
    }
    const s = owner[cell]
    for (const e of nb[cell]) {
      if (done[e]) continue
      let total: number
      if (!isLand[e]) {
        total = p + 1000 // 바다는 사실상 건너지 못한다
      } else {
        const hc = h[e] >= 67 ? 200 : h[e] >= 44 ? 30 : 0
        total = p + 10 + (10 + hc + (river[e] ? 20 : 0)) / expansion[s]
      }
      if (total > maxCost) continue
      if (total < cost[e]) {
        cost[e] = total
        owner[e] = s
        heap.push(total, e)
      }
    }
  }
  for (let i = 0; i < n; i++) if (!done[i] || !isLand[i]) owner[i] = -1
  const order = Int32Array.from(orderArr)
  const rank = new Int32Array(n).fill(-1)
  order.forEach((c, r) => (rank[c] = r))

  // 7. 단계별 셀 색
  const vCol = new Uint32Array(n)
  const hCol = new Uint32Array(n)
  const cCol = new Uint32Array(n)
  const mutCol = new Uint32Array(n)
  const revCol = new Uint32Array(n)
  const frontCol = new Uint32Array(n)
  const grey = hex('#d2cdc2')
  const white = pack(255, 255, 255)
  for (let i = 0; i < n; i++) {
    const shade = ((i * 2654435761) >>> 24) / 255
    vCol[i] = mix(PAPER, pack(222, 214, 196), shade * 0.55)
    hCol[i] = heightColor(h[i])
    cCol[i] = isLand[i] ? LAND_FLAT : BAND[Math.min(3, -depth[i] - 1)]
    mutCol[i] = mix(hCol[i], grey, isLand[i] ? 0.55 : 0.3)
    const sc = owner[i] >= 0 ? STATE_COLORS[owner[i] % STATE_COLORS.length] : 0
    revCol[i] = sc ? mix(mutCol[i], sc, 0.72) : mutCol[i]
    frontCol[i] = sc ? mix(sc, white, 0.45) : mutCol[i]
  }

  return {
    n,
    spacing,
    cellsX,
    cellsY,
    ox,
    oy,
    px,
    py,
    cid,
    edge,
    h,
    isLand,
    river,
    flux,
    down,
    riverCount,
    owner,
    order,
    costAt: Float32Array.from(costArr),
    rank,
    capitals,
    maxCost,
    landPct: Math.round((landCount / n) * 100),
    ms: typeof performance !== 'undefined' ? Math.round(performance.now() - t0) : 0,
    vCol,
    hCol,
    cCol,
    mutCol,
    revCol,
    frontCol,
  }
}

// ---------------------------------------------------------------- 생성 끝

function paintRaster(w: World, stage: StageId, k: number, px32: Uint32Array) {
  const { cid } = w
  const N = cid.length
  const total = w.order.length
  if (stage === 'voronoi') {
    for (let p = 0; p < N; p++) {
      px32[p] = w.edge[p] ? mix(w.vCol[cid[p]], INK, 0.5) : w.vCol[cid[p]]
    }
    return
  }
  if (stage === 'coast') {
    for (let p = 0; p < N; p++) {
      const a = w.isLand[cid[p]]
      const rx = p % RW
      const ry = (p / RW) | 0
      const shore =
        (rx < RW - 1 && w.isLand[cid[p + 1]] !== a) || (ry < RH - 1 && w.isLand[cid[p + RW]] !== a)
      px32[p] = shore ? mix(w.cCol[cid[p]], INK, 0.8) : w.cCol[cid[p]]
    }
    return
  }
  if (stage === 'states') {
    const finished = k >= total
    const lo = k - FRONTIER
    for (let p = 0; p < N; p++) {
      const c = cid[p]
      const r = w.rank[c]
      let col = w.mutCol[c]
      if (r >= 0 && r < k) col = !finished && r >= lo ? w.frontCol[c] : w.revCol[c]
      px32[p] = col
    }
    if (finished) {
      for (let p = 0; p < N; p++) {
        const rx = p % RW
        const ry = (p / RW) | 0
        const a = w.owner[cid[p]]
        if (a < 0) continue
        const b1 = rx < RW - 1 ? w.owner[cid[p + 1]] : a
        const b2 = ry < RH - 1 ? w.owner[cid[p + RW]] : a
        if ((b1 >= 0 && b1 !== a) || (b2 >= 0 && b2 !== a)) px32[p] = mix(px32[p], INK, 0.85)
      }
    }
    return
  }
  // heightmap, rivers
  for (let p = 0; p < N; p++) px32[p] = w.hCol[cid[p]]
}

function strokeRivers(ctx: CanvasRenderingContext2D, w: World, alpha: number) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const pass of [0, 1]) {
    ctx.strokeStyle = pass === 0 ? `rgba(30,70,105,${alpha})` : `rgba(93,151,187,${alpha})`
    for (let i = 0; i < w.n; i++) {
      if (!w.river[i]) continue
      const d = w.down[i]
      const width = Math.min(4, Math.max(1, 0.2 * Math.sqrt(w.flux[i])))
      ctx.lineWidth = pass === 0 ? width + 1.4 : width
      ctx.beginPath()
      ctx.moveTo(w.px[i], w.py[i])
      if (d >= 0) {
        if (w.isLand[d]) ctx.lineTo(w.px[d], w.py[d])
        else ctx.lineTo((w.px[i] + w.px[d]) / 2, (w.py[i] + w.py[d]) / 2)
      }
      ctx.stroke()
    }
  }
}

function drawWorld(
  canvas: HTMLCanvasElement,
  off: HTMLCanvasElement,
  w: World,
  stage: StageId,
  k: number
) {
  const ctx = canvas.getContext('2d')
  const octx = off.getContext('2d')
  if (!ctx || !octx) return
  ctx.clearRect(0, 0, W, H)

  if (stage === 'points') {
    ctx.fillStyle = '#f1eadb'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(38,50,61,.16)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i <= w.cellsX; i++) {
      const x = Math.round(w.ox + i * w.spacing) + 0.5
      ctx.moveTo(x, w.oy)
      ctx.lineTo(x, w.oy + w.cellsY * w.spacing)
    }
    for (let j = 0; j <= w.cellsY; j++) {
      const y = Math.round(w.oy + j * w.spacing) + 0.5
      ctx.moveTo(w.ox, y)
      ctx.lineTo(w.ox + w.cellsX * w.spacing, y)
    }
    ctx.stroke()
    ctx.strokeStyle = 'rgba(217,98,43,.8)'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    for (let i = 0; i < w.n; i++) {
      const cx = w.ox + ((i % w.cellsX) + 0.5) * w.spacing
      const cy = w.oy + (Math.floor(i / w.cellsX) + 0.5) * w.spacing
      ctx.moveTo(cx, cy)
      ctx.lineTo(w.px[i], w.py[i])
    }
    ctx.stroke()
    ctx.fillStyle = 'rgba(38,50,61,.35)'
    for (let i = 0; i < w.n; i++) {
      const cx = w.ox + ((i % w.cellsX) + 0.5) * w.spacing
      const cy = w.oy + (Math.floor(i / w.cellsX) + 0.5) * w.spacing
      ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3)
    }
    ctx.fillStyle = '#26323d'
    for (let i = 0; i < w.n; i++) {
      ctx.beginPath()
      ctx.arc(w.px[i], w.py[i], 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
    return
  }

  const img = octx.createImageData(RW, RH)
  paintRaster(w, stage, k, new Uint32Array(img.data.buffer))
  octx.putImageData(img, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(off, 0, 0, W, H)

  if (stage === 'voronoi') {
    ctx.fillStyle = '#26323d'
    for (let i = 0; i < w.n; i++) {
      ctx.beginPath()
      ctx.arc(w.px[i], w.py[i], 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (stage === 'rivers') strokeRivers(ctx, w, 1)
  if (stage === 'states') {
    strokeRivers(ctx, w, 0.55)
    w.capitals.forEach((c, s) => {
      if (w.rank[c] >= k) return
      const col = STATE_COLORS[s % STATE_COLORS.length]
      ctx.beginPath()
      ctx.arc(w.px[c], w.py[c], 6.5, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#26323d'
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(w.px[c], w.py[c], 2.6, 0, Math.PI * 2)
      ctx.fillStyle = `rgb(${col & 255},${(col >> 8) & 255},${(col >> 16) & 255})`
      ctx.fill()
    })
  }
}

const newSeed = () => String(10000 + Math.floor(Math.random() * 90000))

export default function FmgWorldBuilder({ lang = 'ko' }: { lang?: Lang }) {
  const l = t[lang]
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const [stage, setStage] = useState<StageId>('points')
  const [world, setWorld] = useState<World | null>(null)
  const [k, setK] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)
  const figRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offRef = useRef<HTMLCanvasElement | null>(null)
  const kRef = useRef(0)
  const startedRef = useRef(false)

  // 모션 선호와 화면 진입 감지
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReduced(mq.matches)
    onMq()
    mq.addEventListener('change', onMq)
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 })
    if (figRef.current) io.observe(figRef.current)
    return () => {
      mq.removeEventListener('change', onMq)
      io.disconnect()
    }
  }, [])

  // 시드가 바뀌면 월드를 다시 만든다(마운트 이후에만)
  useEffect(() => {
    startedRef.current = false
    kRef.current = 0
    setK(0)
    setPlaying(false)
    setWorld(generate(seed.trim() || DEFAULT_SEED))
  }, [seed])

  const total = world ? world.order.length : 0

  // 국가 단계에 들어오면 처음부터 자동 재생(모션 줄이기면 끝 상태)
  useEffect(() => {
    if (!world) return
    if (stage !== 'states') {
      startedRef.current = false
      setPlaying(false)
      return
    }
    if (reduced) {
      kRef.current = total
      setK(total)
      setPlaying(false)
      startedRef.current = true
      return
    }
    if (visible && !startedRef.current) {
      startedRef.current = true
      kRef.current = 0
      setK(0)
      setPlaying(true)
    }
  }, [stage, world, visible, reduced, total])

  useEffect(() => {
    if (!playing || total === 0) return
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const dt = Math.min(100, now - last)
      last = now
      kRef.current = Math.min(total, kRef.current + (total * dt) / EXPAND_MS)
      setK(Math.floor(kRef.current))
      if (kRef.current >= total) {
        setPlaying(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, total])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !world) return
    if (!offRef.current) {
      const o = document.createElement('canvas')
      o.width = RW
      o.height = RH
      offRef.current = o
    }
    drawWorld(canvas, offRef.current, world, stage, k)
  }, [world, stage, k])

  const toggle = useCallback(() => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (kRef.current >= total) {
      kRef.current = 0
      setK(0)
    }
    setPlaying(true)
  }, [playing, total])

  const st = l.stages[stage]
  const idx = STAGE_ORDER.indexOf(stage)
  const finished = total > 0 && k >= total
  const costNow = k > 0 && world ? Math.round(world.costAt[Math.min(k, total) - 1]) : 0

  return (
    <figure ref={figRef} className="my-8 grid grid-cols-[minmax(0,1fr)] gap-3">
      <div role="group" aria-label={l.group} className="flex flex-wrap gap-2">
        {STAGE_ORDER.map((id, i) => {
          const on = id === stage
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setStage(id)}
              className={`text-ink focus-visible:outline-accent inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${
                on ? 'border-accent bg-accent/10' : 'border-line bg-surface'
              }`}
            >
              <span className="text-muted font-mono text-[11px]">{i + 1}</span>
              {l.stages[id].label}
            </button>
          )
        })}
      </div>

      <div
        className="border-line overflow-hidden rounded-2xl border"
        style={{ background: '#f1eadb' }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          role="img"
          aria-label={`${st.label}. ${st.alt}`}
          className="block h-auto w-full"
          style={{ aspectRatio: '16 / 9' }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
        <button
          type="button"
          onClick={() => setSeed(newSeed())}
          className="text-ink border-line bg-surface focus-visible:outline-accent cursor-pointer rounded-full border px-3 py-1 text-[12.5px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {l.newSeed}
        </button>
        {world && (
          <span className="text-muted min-w-0 font-mono text-[11.5px]">
            {l.stats(world.n, world.landPct, world.riverCount, world.capitals.length, world.ms)}
          </span>
        )}
      </div>

      {stage === 'states' && total > 0 && (
        <div className="grid gap-1.5">
          <div className="text-muted font-mono text-[12px]">{l.readout(k, total, costNow)}</div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="text-ink border-line bg-surface focus-visible:outline-accent cursor-pointer rounded-full border px-3 py-1 font-mono text-[11.5px] tracking-wide whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {playing ? l.pause : finished ? l.replay : l.play}
            </button>
            <input
              type="range"
              min={0}
              max={total}
              value={k}
              aria-label={l.scrub}
              onChange={(e) => {
                const v = Number(e.target.value)
                kRef.current = v
                setK(v)
                setPlaying(false)
              }}
              className="accent-accent w-full"
            />
          </div>
        </div>
      )}

      <div className="border-line bg-surface grid gap-1.5 rounded-xl border p-3.5">
        <p className="text-ink m-0 text-[14px] leading-relaxed">{st.body}</p>
        <p className="text-muted m-0 font-mono text-[11.5px] break-all">{st.source}</p>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {l.stageAnnounce(idx + 1, st.label)}
      </p>

      <figcaption className="text-ink/75 text-[13.5px] leading-relaxed">
        <span className="text-ink font-semibold">{l.title}</span> {l.caption}
      </figcaption>
    </figure>
  )
}
