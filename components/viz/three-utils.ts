import type * as ThreeNS from 'three'

export type Three = typeof ThreeNS

/** 부드러운 원형 입자 스프라이트 텍스처 */
export function discSprite(THREE: Three): ThreeNS.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  if (g) {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.35, 'rgba(255,255,255,.65)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
  }
  const tex = new THREE.Texture(c)
  tex.needsUpdate = true
  return tex
}

/** 반지름 1 구 표면에 n개 점을 고르게 배치 */
export function fibonacciSphere(n: number): Float32Array {
  const out = new Float32Array(n * 3)
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = phi * i
    out[i * 3] = Math.cos(th) * r
    out[i * 3 + 1] = y
    out[i * 3 + 2] = Math.sin(th) * r
  }
  return out
}

/** 반지름 rMin~rMax 껍질 안에 n개 점을 무작위 배치(표면 쪽이 더 촘촘) */
export function randomInShell(n: number, rMin: number, rMax: number, bias = 1.6): Float32Array {
  const out = new Float32Array(n * 3)
  for (let j = 0; j < n; j++) {
    const u = Math.random()
    const v = Math.random()
    const tt = Math.acos(2 * u - 1)
    const pp = 2 * Math.PI * v
    const rad = rMin + Math.pow(Math.random(), bias) * (rMax - rMin)
    out[j * 3] = Math.sin(tt) * Math.cos(pp) * rad
    out[j * 3 + 1] = Math.cos(tt) * rad
    out[j * 3 + 2] = Math.sin(tt) * Math.sin(pp) * rad
  }
  return out
}

export interface PointsOpts {
  size: number
  color?: string
  vertexColors?: Float32Array
  opacity?: number
  additive?: boolean
  sprite: ThreeNS.Texture
}

/** BufferGeometry + PointsMaterial을 한 번에 만든다. dispose는 호출자가 geometry/material 둘 다. */
export function makePoints(
  THREE: Three,
  positions: Float32Array,
  opts: PointsOpts
): ThreeNS.Points {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  if (opts.vertexColors) geo.setAttribute('color', new THREE.BufferAttribute(opts.vertexColors, 3))
  const mat = new THREE.PointsMaterial({
    size: opts.size,
    map: opts.sprite,
    color: opts.color ? new THREE.Color(opts.color) : undefined,
    vertexColors: Boolean(opts.vertexColors),
    transparent: true,
    opacity: opts.opacity ?? 1,
    depthWrite: false,
    sizeAttenuation: true,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  return new THREE.Points(geo, mat)
}

/** Points 하나의 geometry/material을 모두 해제 */
export function disposePoints(p: ThreeNS.Points) {
  p.geometry.dispose()
  const m = p.material
  if (Array.isArray(m)) m.forEach((x) => x.dispose())
  else m.dispose()
}
