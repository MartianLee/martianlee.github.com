/**
 * Minecraft-in-Elden-Ring 브릿지의 패스스루 합성을 절차적 장면 위에서 재현한다.
 *
 * compositor.cpp의 HLSL 픽셀 셰이더와 같은 수식을 240x135 버퍼의 픽셀마다 CPU에서 돌린다.
 * 게임 에셋은 쓰지 않고 모든 레이어를 도형 + 결정적 해시 노이즈로 만든다.
 * PassthroughCompositor(토글)와 PassthroughLayers(분해도)가 이 모듈을 함께 쓴다.
 *
 * 색은 0..1 float, 알파는 premultiplied로 일관되게 다룬다.
 */

export const W = 240
export const H = 135
const HORIZON = 62

/** 장면 좌표(px)와 깊이(m). 하이라이트 박스도 이 값을 참조한다. */
export const SCENE = {
  pillar: { x0: 112, x1: 128, y0: 18, y1: 118, depth: 9 },
  stack: { x0: 118, y0: 82, cell: 12, n: 3, depth: 13 },
  near: { x0: 86, y0: 78, size: 12, depth: 7 },
  far: { x0: 196, y0: 54, size: 8, depth: 60 },
  torch: { x: 92, y: 70 },
} as const

// 셰이더 상수 (compositor.cpp)
const BIAS = 0.03 // compositor.cpp p.bias
const FOG_START = 15
const FOG_END = 80
const FOG_STRENGTH = 0.85
const LIGHT_MIN = 0.2
const LIGHT_GAIN = 2.6
const TINT_AMOUNT = 0.4
const LIGHT_MAX = 1.15

export type RGB = [number, number, number]

const hex = (s: string): RGB => [
  parseInt(s.slice(1, 3), 16) / 255,
  parseInt(s.slice(3, 5), 16) / 255,
  parseInt(s.slice(5, 7), 16) / 255,
]
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const sat = (v: number) => clamp(v, 0, 1)

/** 결정적 해시 노이즈 [0,1) */
function hash(x: number, y: number, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

export interface Grid {
  data: Float32Array
  gw: number
  gh: number
  s: number
}

/** s x s 평균으로 줄인 뒤 3x3 박스 블러. */
function blurGrid(rgb: Float32Array, s: number): Grid {
  const gw = Math.ceil(W / s)
  const gh = Math.ceil(H / s)
  const down = new Float32Array(gw * gh * 3)
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      let n = 0
      const acc = [0, 0, 0]
      for (let y = gy * s; y < Math.min(H, gy * s + s); y++) {
        for (let x = gx * s; x < Math.min(W, gx * s + s); x++) {
          const i = (y * W + x) * 3
          acc[0] += rgb[i]
          acc[1] += rgb[i + 1]
          acc[2] += rgb[i + 2]
          n++
        }
      }
      const o = (gy * gw + gx) * 3
      for (let c = 0; c < 3; c++) down[o + c] = acc[c] / n
    }
  }
  const out = new Float32Array(gw * gh * 3)
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const acc = [0, 0, 0]
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const sx = clamp(gx + dx, 0, gw - 1)
          const sy = clamp(gy + dy, 0, gh - 1)
          const i = (sy * gw + sx) * 3
          acc[0] += down[i]
          acc[1] += down[i + 1]
          acc[2] += down[i + 2]
        }
      }
      const o = (gy * gw + gx) * 3
      for (let c = 0; c < 3; c++) out[o + c] = acc[c] / 9
    }
  }
  return { data: out, gw, gh, s }
}

/** 픽셀 중심 좌표 (x+0.5, y+0.5)에서 쌍선형 샘플. */
function sampleGrid(g: Grid, x: number, y: number, out: RGB) {
  const fx = clamp((x + 0.5) / g.s - 0.5, 0, g.gw - 1)
  const fy = clamp((y + 0.5) / g.s - 0.5, 0, g.gh - 1)
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(g.gw - 1, x0 + 1)
  const y1 = Math.min(g.gh - 1, y0 + 1)
  const tx = fx - x0
  const ty = fy - y0
  for (let c = 0; c < 3; c++) {
    const a = lerp(g.data[(y0 * g.gw + x0) * 3 + c], g.data[(y0 * g.gw + x1) * 3 + c], tx)
    const b = lerp(g.data[(y1 * g.gw + x0) * 3 + c], g.data[(y1 * g.gw + x1) * 3 + c], tx)
    out[c] = lerp(a, b, ty)
  }
}

export interface Scene {
  hostRGB: Float32Array
  hostD: Float32Array
  mc: Float32Array // premultiplied RGBA
  mcD: Float32Array
  hand: Float32Array // premultiplied RGBA
  gui: Float32Array // premultiplied RGBA
  light: Grid
  haze: Grid
}

const TORCH = SCENE.torch
const GLOW_R = 45

function buildHost(rgb: Float32Array, depth: Float32Array) {
  const skyTop = hex('#1b1a24')
  const skyHor = hex('#4a4038')
  const gNear = hex('#5b5141')
  const gFar = hex('#3a3226')
  const wall = hex('#57534a')
  const pillar = hex('#6b6458')
  const torch = hex('#ffd28a')
  const GLOW: RGB = [1.0, 0.55, 0.2]

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let c: RGB
      let d: number
      if (y < HORIZON) {
        const k = y / HORIZON
        c = [
          lerp(skyTop[0], skyHor[0], k),
          lerp(skyTop[1], skyHor[1], k),
          lerp(skyTop[2], skyHor[2], k),
        ]
        d = 1000
      } else {
        // 블록(13 m)이 땅에 파묻히지 않도록 가장 가까운 줄(y=134)도 11 m 이상이 되게 잡았다.
        const k = (y - HORIZON) / (H - 1 - HORIZON)
        const n = 1 + (hash(x, y, 1) - 0.5) * 0.14
        c = [
          lerp(gNear[0], gFar[0], k) * n,
          lerp(gNear[1], gFar[1], k) * n,
          lerp(gNear[2], gFar[2], k) * n,
        ]
        d = Math.min(300, 900 / (y - 55))
      }
      if (x >= 168 && x < 232 && y >= 34 && y < 62) {
        const n = 1 + (hash(x, y, 2) - 0.5) * 0.1
        c = [wall[0] * n, wall[1] * n, wall[2] * n]
        d = 70
      }
      if (
        x >= SCENE.pillar.x0 &&
        x < SCENE.pillar.x1 &&
        y >= SCENE.pillar.y0 &&
        y < SCENE.pillar.y1
      ) {
        const dark = x === 127 ? 0.72 : x === 126 ? 0.86 : 1
        const n = (1 + (hash(x, y, 3) - 0.5) * 0.08) * dark
        c = [pillar[0] * n, pillar[1] * n, pillar[2] * n]
        d = SCENE.pillar.depth
      }
      // 전체를 어둡게 깔고(0.55) 횃불 주변에만 따뜻한 빛을 더한다.
      const dist = Math.hypot(x - TORCH.x, y - TORCH.y)
      const glow = Math.pow(Math.max(0, 1 - dist / GLOW_R), 1.5) * 1.4
      c = [c[0] * 0.55 + GLOW[0] * glow, c[1] * 0.55 + GLOW[1] * glow, c[2] * 0.55 + GLOW[2] * glow]
      if (dist <= 2.2) c = torch
      const i = y * W + x
      rgb[i * 3] = sat(c[0])
      rgb[i * 3 + 1] = sat(c[1])
      rgb[i * 3 + 2] = sat(c[2])
      depth[i] = d
    }
  }
}

function buildMinecraft(mc: Float32Array, mcD: Float32Array) {
  const grass = hex('#5fa83a')
  const dirt = hex('#86603a')

  const block = (x0: number, y0: number, size: number, depth: number, grassH: number) => {
    for (let ly = 0; ly < size; ly++) {
      for (let lx = 0; lx < size; lx++) {
        const x = x0 + lx
        const y = y0 + ly
        let c: RGB
        if (ly < grassH) {
          const n = 1 + (hash(x, y, 4) - 0.5) * 0.3
          c = [grass[0] * n, grass[1] * n, grass[2] * n]
        } else {
          const speck = hash(x, y, 5) < 0.18 ? 0.72 : 1 + (hash(x, y, 6) - 0.5) * 0.12
          c = [dirt[0] * speck, dirt[1] * speck, dirt[2] * speck]
        }
        if (lx === 0 || ly === 0 || lx === size - 1 || ly === size - 1) {
          c = [c[0] * 0.6, c[1] * 0.6, c[2] * 0.6]
        }
        const i = y * W + x
        mc[i * 4] = c[0]
        mc[i * 4 + 1] = c[1]
        mc[i * 4 + 2] = c[2]
        mc[i * 4 + 3] = 1
        mcD[i] = depth
      }
    }
  }

  // 3x3 더미: 기둥(x 112..128, 9 m) 뒤에 x 118..128이 겹친다.
  const { stack, near, far } = SCENE
  for (let by = 0; by < stack.n; by++) {
    for (let bx = 0; bx < stack.n; bx++) {
      block(
        stack.x0 + bx * stack.cell,
        stack.y0 + by * stack.cell,
        stack.cell,
        stack.depth,
        by === 0 ? 3 : 0
      )
    }
  }
  block(near.x0, near.y0, near.size, near.depth, 3) // 횃불 바로 밑, 모든 것의 앞
  block(far.x0, far.y0, far.size, far.depth, 2) // 먼 블록: 벽(70 m) 앞이지만 멀어서 안개가 두드러진다
}

function buildHand(hand: Float32Array) {
  const skin = hex('#c58f6b')
  const sleeve = hex('#3aa7a3')
  // (196,135) -> (222,100) 방향의 비스듬한 막대
  const ax = 196
  const ay = 135
  const dx = 222 - ax
  const dy = 100 - ay
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const half = 7
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = x + 0.5 - ax
      const py = y + 0.5 - ay
      const along = px * ux + py * uy
      const side = -px * uy + py * ux
      if (along < -8 || along > len || Math.abs(side) > half) continue
      let c = along < len * 0.5 ? sleeve : skin
      let shade = 1 + (hash(x, y, 7) - 0.5) * 0.1
      if (side > half - 2) shade *= 0.78
      else if (side < -half + 1.5) shade *= 1.08
      c = [sat(c[0] * shade), sat(c[1] * shade), sat(c[2] * shade)]
      const i = y * W + x
      hand[i * 4] = c[0]
      hand[i * 4 + 1] = c[1]
      hand[i * 4 + 2] = c[2]
      hand[i * 4 + 3] = 1
    }
  }
}

function buildGui(gui: Float32Array) {
  const put = (x: number, y: number, c: RGB, a: number) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return
    const i = (y * W + x) * 4
    // 불투명 위에 덮을 때를 위해 source-over로 premultiplied 누적
    gui[i] = c[0] * a + gui[i] * (1 - a)
    gui[i + 1] = c[1] * a + gui[i + 1] * (1 - a)
    gui[i + 2] = c[2] * a + gui[i + 2] * (1 - a)
    gui[i + 3] = a + gui[i + 3] * (1 - a)
  }
  const white: RGB = [1, 1, 1]
  const black: RGB = [0, 0, 0]
  const border = hex('#9a9a9a')
  const items: Record<number, RGB> = {
    1: hex('#5fa83a'),
    4: hex('#86603a'),
    6: hex('#3aa7a3'),
  }
  const SELECTED = 0
  const x0 = Math.floor((W - (9 * 9 + 8)) / 2)
  const y0 = H - 12
  for (let s = 0; s < 9; s++) {
    const sx = x0 + s * 10
    for (let ly = 0; ly < 9; ly++) {
      for (let lx = 0; lx < 9; lx++) {
        const edge = lx === 0 || ly === 0 || lx === 8 || ly === 8
        if (edge) put(sx + lx, y0 + ly, s === SELECTED ? white : border, 1)
        else put(sx + lx, y0 + ly, black, 0.55)
      }
    }
    const item = items[s]
    if (item) {
      for (let ly = 2; ly < 7; ly++) for (let lx = 2; lx < 7; lx++) put(sx + lx, y0 + ly, item, 1)
    }
  }
  // 십자선
  const cx = W / 2
  const cy = Math.floor(H / 2)
  for (let k = -2; k <= 2; k++) {
    put(cx + k, cy, white, 1)
    put(cx, cy + k, white, 1)
  }
}

function makeScene(): Scene {
  const hostRGB = new Float32Array(W * H * 3)
  const hostD = new Float32Array(W * H)
  const mc = new Float32Array(W * H * 4)
  const mcD = new Float32Array(W * H)
  const hand = new Float32Array(W * H * 4)
  const gui = new Float32Array(W * H * 4)
  buildHost(hostRGB, hostD)
  buildMinecraft(mc, mcD)
  buildHand(hand)
  buildGui(gui)
  return {
    hostRGB,
    hostD,
    mc,
    mcD,
    hand,
    gui,
    light: blurGrid(hostRGB, 8),
    haze: blurGrid(hostRGB, 4),
  }
}
let cached: Scene | null = null

/** 장면은 한 번만 만들어 모듈 단에서 공유한다. */
export function buildScene(): Scene {
  cached ??= makeScene()
  return cached
}

export interface CompositeOpts {
  occlusion: boolean
  relight: boolean
  haze: boolean
  depthView: boolean
}

// ---- 셰이더 수식 ----

const envScratch: RGB = [0, 0, 0]
const hazeScratch: RGB = [0, 0, 0]

/** lightAt(uv): 흐린 호스트 색의 밝기로 세기를, 색조로 틴트를 정한다. */
function lightAt(sc: Scene, x: number, y: number, out: RGB) {
  sampleGrid(sc.light, x, y, envScratch)
  const env = envScratch
  const lum = env[0] * 0.299 + env[1] * 0.587 + env[2] * 0.114
  const k = clamp(LIGHT_MIN + lum * LIGHT_GAIN, 0, LIGHT_MAX)
  const inv = 0.5 / Math.max(lum, 1e-3)
  for (let c = 0; c < 3; c++) {
    const tint = sat(env[c] * inv)
    out[c] = k * lerp(1, tint * 2, TINT_AMOUNT)
  }
}

interface WorldFlags {
  occlusion: boolean
  relight: boolean
  haze: boolean
}

const lightScratch: RGB = [1, 1, 1]

/** 월드 레이어(premultiplied RGBA)에 켜진 단계까지만 적용한 결과를 out[0..3]에 쓴다. */
function worldAt(sc: Scene, x: number, y: number, f: WorldFlags, out: number[]) {
  const i = y * W + x
  const o = i * 4
  let wr = sc.mc[o]
  let wg = sc.mc[o + 1]
  let wb = sc.mc[o + 2]
  let wa = sc.mc[o + 3]
  if (wa > 0) {
    const hostD = sc.hostD[i]
    const mcD = sc.mcD[i]
    if (f.occlusion && mcD > hostD + BIAS + mcD * 0.004) {
      wr = wg = wb = wa = 0
    } else {
      if (f.relight) {
        lightAt(sc, x, y, lightScratch)
        wr *= lightScratch[0]
        wg *= lightScratch[1]
        wb *= lightScratch[2]
      }
      const fog = sat((mcD - FOG_START) / Math.max(FOG_END - FOG_START, 1)) * FOG_STRENGTH
      if (fog > 0 && f.haze) {
        sampleGrid(sc.haze, x, y, hazeScratch)
        wr = lerp(wr, hazeScratch[0] * wa, fog)
        wg = lerp(wg, hazeScratch[1] * wa, fog)
        wb = lerp(wb, hazeScratch[2] * wa, fog)
      }
    }
  }
  out[0] = wr
  out[1] = wg
  out[2] = wb
  out[3] = wa
}

const worldScratch = [0, 0, 0, 0]
const handLight: RGB = [1, 1, 1]

export function composite(sc: Scene, opts: CompositeOpts, out: Uint8ClampedArray) {
  const px = out
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const o = i * 4

      if (opts.depthView) {
        const g = (sc.hostD[i] / 10) % 1
        px[o] = px[o + 1] = px[o + 2] = Math.round(g * 255)
        px[o + 3] = 255
        continue
      }

      worldAt(sc, x, y, opts, worldScratch)
      const [wr, wg, wb, wa] = worldScratch

      // hand
      let hr = sc.hand[o]
      let hg = sc.hand[o + 1]
      let hb = sc.hand[o + 2]
      const ha = sc.hand[o + 3]
      if (ha > 0 && opts.relight) {
        lightAt(sc, x, y, handLight)
        hr *= handLight[0]
        hg *= handLight[1]
        hb *= handLight[2]
      }

      // scene = hand + world * (1 - hand.a)
      const sr = hr + wr * (1 - ha)
      const sg = hg + wg * (1 - ha)
      const sb = hb + wb * (1 - ha)
      const sa = ha + wa * (1 - ha)

      // out = gui + scene * (1 - gui.a)
      const ga = sc.gui[o + 3]
      const or = sc.gui[o] + sr * (1 - ga)
      const og = sc.gui[o + 1] + sg * (1 - ga)
      const ob = sc.gui[o + 2] + sb * (1 - ga)
      const oa = ga + sa * (1 - ga)

      // final = out + host * (1 - out.a)
      px[o] = Math.round(sat(or + sc.hostRGB[i * 3] * (1 - oa)) * 255)
      px[o + 1] = Math.round(sat(og + sc.hostRGB[i * 3 + 1] * (1 - oa)) * 255)
      px[o + 2] = Math.round(sat(ob + sc.hostRGB[i * 3 + 2] * (1 - oa)) * 255)
      px[o + 3] = 255
    }
  }
}

// ---- 레이어 렌더러 (분해도용) ----

const px8 = (v: number) => Math.round(sat(v) * 255)

/** 투명한 곳이 비어 보이도록 깔아 두는 어두운 체커보드. */
function checker(x: number, y: number) {
  return (Math.floor(x / 5) + Math.floor(y / 5)) & 1 ? 0.15 : 0.1
}

function put(out: Uint8ClampedArray, i: number, r: number, g: number, b: number) {
  out[i * 4] = px8(r)
  out[i * 4 + 1] = px8(g)
  out[i * 4 + 2] = px8(b)
  out[i * 4 + 3] = 255
}

/** premultiplied RGBA 레이어를 체커보드 위에 얹는다. */
function putOverChecker(
  out: Uint8ClampedArray,
  i: number,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number
) {
  const k = checker(x, y) * (1 - a)
  put(out, i, r + k, g + k, b + k)
}

function forEachPixel(fn: (x: number, y: number, i: number) => void) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) fn(x, y, y * W + x)
}

/** 분해도용 깊이: 가까울수록 밝고(40 m에서 검정), 하늘은 검정. */
function putGray(out: Uint8ClampedArray, i: number, d: number) {
  const g = 1 - clamp(d / 40, 0, 1)
  put(out, i, g, g, g)
}

export function renderHostColor(sc: Scene, out: Uint8ClampedArray) {
  forEachPixel((_x, _y, i) =>
    put(out, i, sc.hostRGB[i * 3], sc.hostRGB[i * 3 + 1], sc.hostRGB[i * 3 + 2])
  )
}

export function renderHostDepth(sc: Scene, out: Uint8ClampedArray) {
  forEachPixel((_x, _y, i) => putGray(out, i, sc.hostD[i]))
}

export function renderMcColor(sc: Scene, out: Uint8ClampedArray) {
  forEachPixel((x, y, i) => {
    const o = i * 4
    putOverChecker(out, i, x, y, sc.mc[o], sc.mc[o + 1], sc.mc[o + 2], sc.mc[o + 3])
  })
}

export function renderMcDepth(sc: Scene, out: Uint8ClampedArray) {
  forEachPixel((x, y, i) => {
    if (sc.mc[i * 4 + 3] > 0) putGray(out, i, sc.mcD[i])
    else putOverChecker(out, i, x, y, 0, 0, 0, 0)
  })
}

export function renderHand(sc: Scene, out: Uint8ClampedArray) {
  forEachPixel((x, y, i) => {
    const o = i * 4
    putOverChecker(out, i, x, y, sc.hand[o], sc.hand[o + 1], sc.hand[o + 2], sc.hand[o + 3])
  })
}

export function renderGui(sc: Scene, out: Uint8ClampedArray) {
  forEachPixel((x, y, i) => {
    const o = i * 4
    putOverChecker(out, i, x, y, sc.gui[o], sc.gui[o + 1], sc.gui[o + 2], sc.gui[o + 3])
  })
}

const PASS = hex('#4ade80')
const FAIL = hex('#f87171')

/** 어둡게 깐 호스트 위에서 깊이 테스트를 통과한 MC 픽셀은 초록, 탈락한 픽셀은 빨강. */
export function renderOcclusionMask(sc: Scene, out: Uint8ClampedArray) {
  forEachPixel((_x, _y, i) => {
    let r = sc.hostRGB[i * 3] * 0.45
    let g = sc.hostRGB[i * 3 + 1] * 0.45
    let b = sc.hostRGB[i * 3 + 2] * 0.45
    if (sc.mc[i * 4 + 3] > 0) {
      const mcD = sc.mcD[i]
      const fail = mcD > sc.hostD[i] + BIAS + mcD * 0.004
      const tint = fail ? FAIL : PASS
      const a = fail ? 0.85 : 0.7
      r = lerp(r, tint[0], a)
      g = lerp(g, tint[1], a)
      b = lerp(b, tint[2], a)
    }
    put(out, i, r, g, b)
  })
}

function renderWorldStage(sc: Scene, out: Uint8ClampedArray, f: WorldFlags) {
  const w = [0, 0, 0, 0]
  forEachPixel((x, y, i) => {
    worldAt(sc, x, y, f, w)
    putOverChecker(out, i, x, y, w[0], w[1], w[2], w[3])
  })
}

export function renderAfterOcclusion(sc: Scene, out: Uint8ClampedArray) {
  renderWorldStage(sc, out, { occlusion: true, relight: false, haze: false })
}

/** lightAt(uv)가 돌려주는 곱셈 값을 색으로 본다. 클램프 상한(1.15)이 흰색이다. */
export function renderLightMap(sc: Scene, out: Uint8ClampedArray) {
  const k: RGB = [1, 1, 1]
  forEachPixel((x, y, i) => {
    lightAt(sc, x, y, k)
    put(out, i, k[0] / LIGHT_MAX, k[1] / LIGHT_MAX, k[2] / LIGHT_MAX)
  })
}

export function renderAfterRelight(sc: Scene, out: Uint8ClampedArray) {
  renderWorldStage(sc, out, { occlusion: true, relight: true, haze: false })
}

export function renderHazeMap(sc: Scene, out: Uint8ClampedArray) {
  const c: RGB = [0, 0, 0]
  forEachPixel((x, y, i) => {
    sampleGrid(sc.haze, x, y, c)
    put(out, i, c[0], c[1], c[2])
  })
}

export function renderAfterHaze(sc: Scene, out: Uint8ClampedArray) {
  renderWorldStage(sc, out, { occlusion: true, relight: true, haze: true })
}

export function renderFinal(sc: Scene, out: Uint8ClampedArray) {
  composite(sc, { occlusion: true, relight: true, haze: true, depthView: false }, out)
}
