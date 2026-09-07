import type * as ThreeNS from 'three'
import {
  discSprite,
  fibonacciSphere,
  makePoints,
  randomInShell,
  disposePoints,
  type Three,
} from './three-utils'

export interface EarthSceneOpts {
  /** 카메라 거리. 허브 4.0 */
  cameraZ?: number
  /** 헤이즈 입자 수. 허브 2600 */
  hazeCount?: number
}

export interface EarthScene {
  scene: ThreeNS.Scene
  camera: ThreeNS.PerspectiveCamera
  /** 0~1. 보이는 헤이즈 입자 비율과 불투명도를 함께 조절 */
  setHazeLevel: (level: number) => void
  render: (renderer: ThreeNS.WebGLRenderer, ts: number) => void
  resize: (w: number, h: number) => void
  dispose: () => void
}

export function buildEarthScene(THREE: Three, opts: EarthSceneOpts = {}): EarthScene {
  const cameraZ = opts.cameraZ ?? 4.0
  const hazeCount = opts.hazeCount ?? 2600
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, cameraZ)
  const sprite = discSprite(THREE)
  const root = new THREE.Group()
  scene.add(root)

  // 입자 지구: 의사 대륙 색 밴딩
  const GN = 4200
  const pos = fibonacciSphere(GN)
  const col = new Float32Array(GN * 3)
  const cLand = new THREE.Color('#a8bd74')
  const cSoil = new THREE.Color('#cf7a3d')
  const cDeep = new THREE.Color('#7a4d26')
  for (let i = 0; i < GN; i++) {
    const x = pos[i * 3]
    const y = pos[i * 3 + 1]
    const z = pos[i * 3 + 2]
    const n = Math.sin(x * 4.1) * Math.cos(z * 3.3 + y * 2.0) + Math.sin(y * 6.0)
    const c = n > 0.35 ? cLand : n > -0.2 ? cSoil : cDeep
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  const earth = makePoints(THREE, pos, { size: 0.028, sprite, vertexColors: col })
  root.add(earth)

  // CO₂ 헤이즈 껍질
  const haze = makePoints(THREE, randomInShell(hazeCount, 1.12, 2.27), {
    size: 0.065,
    sprite,
    color: '#e6a760',
    opacity: 0.5,
    additive: true,
  })
  root.add(haze)
  const hazeMat = haze.material as ThreeNS.PointsMaterial

  // 호박색 글로우 코어
  const glow = makePoints(THREE, new Float32Array([0, 0, 0]), {
    size: 2.1,
    sprite,
    color: '#c8642f',
    opacity: 0.16,
    additive: true,
  })
  scene.add(glow)

  root.rotation.z = 0.28
  let level = 1
  // 허브 원본 룩: opacity 0.5 ± 0.1 (level 1일 때 동일해야 한다)
  let baseOpacity = 0.5

  return {
    scene,
    camera,
    setHazeLevel(l) {
      level = Math.max(0, Math.min(1, l))
      haze.geometry.setDrawRange(0, Math.max(1, Math.round(hazeCount * (0.15 + 0.85 * level))))
      baseOpacity = 0.2 + 0.3 * level
    },
    render(renderer, ts) {
      root.rotation.y = ts * 0.00006
      haze.rotation.y = -ts * 0.00003
      haze.rotation.x = Math.sin(ts * 0.00004) * 0.08
      hazeMat.opacity = baseOpacity + Math.sin(ts * 0.0005) * 0.1
      renderer.render(scene, camera)
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      disposePoints(earth)
      disposePoints(haze)
      disposePoints(glow)
      sprite.dispose()
    },
  }
}
