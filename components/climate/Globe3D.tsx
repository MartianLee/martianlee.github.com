'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hero 3D panel: fibonacci particle Earth with an amber CO₂ haze shell.
 *
 * three.js is imported dynamically inside useEffect, so it ships as a lazy
 * chunk loaded only when /climate is visited and never touches SSR or the
 * static build. Fallback ladder: the static radial-gradient planet + dashed
 * rings render immediately; on successful load the canvas fades in; with
 * prefers-reduced-motion a single frame is rendered; on any failure the
 * static panel simply remains.
 */
export default function Globe3D({ caption }: { caption: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let disposed = false
    let cleanup: (() => void) | undefined

    const start = async () => {
      try {
        const THREE = await import('three')
        const canvas = canvasRef.current
        if (disposed || !canvas) return

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        // Match the legacy (r128-era) color pipeline the design was tuned on:
        // with default color management the additive glow blooms far brighter
        // and washes out the particle earth.
        THREE.ColorManagement.enabled = false
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
        camera.position.set(0, 0, 4.0)

        // Soft round particle sprite.
        const spriteCanvas = document.createElement('canvas')
        spriteCanvas.width = spriteCanvas.height = 64
        const ctx = spriteCanvas.getContext('2d')
        if (!ctx) return
        const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
        grd.addColorStop(0, 'rgba(255,255,255,1)')
        grd.addColorStop(0.35, 'rgba(255,255,255,.65)')
        grd.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, 64, 64)
        const sprite = new THREE.Texture(spriteCanvas)
        sprite.needsUpdate = true

        const root = new THREE.Group()
        scene.add(root)

        // Earth: fibonacci point sphere with pseudo-continent banding.
        const GN = 4200
        const earthPos = new Float32Array(GN * 3)
        const earthCol = new Float32Array(GN * 3)
        const phi = Math.PI * (3 - Math.sqrt(5))
        const cLand = new THREE.Color('#a8bd74')
        const cSoil = new THREE.Color('#cf7a3d')
        const cDeep = new THREE.Color('#7a4d26')
        for (let i = 0; i < GN; i++) {
          const y = 1 - (i / (GN - 1)) * 2
          const r = Math.sqrt(1 - y * y)
          const th = phi * i
          const x = Math.cos(th) * r
          const z = Math.sin(th) * r
          earthPos[i * 3] = x
          earthPos[i * 3 + 1] = y
          earthPos[i * 3 + 2] = z
          const n = Math.sin(x * 4.1) * Math.cos(z * 3.3 + y * 2.0) + Math.sin(y * 6.0)
          const col = n > 0.35 ? cLand : n > -0.2 ? cSoil : cDeep
          earthCol[i * 3] = col.r
          earthCol[i * 3 + 1] = col.g
          earthCol[i * 3 + 2] = col.b
        }
        const earthGeo = new THREE.BufferGeometry()
        earthGeo.setAttribute('position', new THREE.BufferAttribute(earthPos, 3))
        earthGeo.setAttribute('color', new THREE.BufferAttribute(earthCol, 3))
        const earthMat = new THREE.PointsMaterial({
          size: 0.028,
          map: sprite,
          vertexColors: true,
          transparent: true,
          depthWrite: false,
          sizeAttenuation: true,
        })
        root.add(new THREE.Points(earthGeo, earthMat))

        // CO₂ haze: amber particle shell, denser near the surface.
        const HN = 2600
        const hazePos = new Float32Array(HN * 3)
        for (let j = 0; j < HN; j++) {
          const u = Math.random()
          const v = Math.random()
          const tt = Math.acos(2 * u - 1)
          const pp = 2 * Math.PI * v
          const rad = 1.12 + Math.pow(Math.random(), 1.6) * 1.15
          hazePos[j * 3] = Math.sin(tt) * Math.cos(pp) * rad
          hazePos[j * 3 + 1] = Math.cos(tt) * rad
          hazePos[j * 3 + 2] = Math.sin(tt) * Math.sin(pp) * rad
        }
        const hazeGeo = new THREE.BufferGeometry()
        hazeGeo.setAttribute('position', new THREE.BufferAttribute(hazePos, 3))
        const hazeMat = new THREE.PointsMaterial({
          size: 0.065,
          map: sprite,
          color: new THREE.Color('#e6a760'),
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true,
        })
        const haze = new THREE.Points(hazeGeo, hazeMat)
        root.add(haze)

        // Subtle amber glow core.
        const glowGeo = new THREE.BufferGeometry()
        glowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3))
        const glowMat = new THREE.PointsMaterial({
          size: 2.1,
          map: sprite,
          color: new THREE.Color('#c8642f'),
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        scene.add(new THREE.Points(glowGeo, glowMat))

        root.rotation.z = 0.28

        const resize = () => {
          const w = canvas.clientWidth
          const h = canvas.clientHeight
          if (canvas.width !== w || canvas.height !== h) {
            renderer.setSize(w, h, false)
            camera.aspect = w / h
            camera.updateProjectionMatrix()
          }
        }

        let raf = 0
        const frame = (ts: number) => {
          resize()
          root.rotation.y = ts * 0.00006
          haze.rotation.y = -ts * 0.00003
          haze.rotation.x = Math.sin(ts * 0.00004) * 0.08
          hazeMat.opacity = 0.5 + Math.sin(ts * 0.0005) * 0.1
          renderer.render(scene, camera)
          if (!reduce) raf = requestAnimationFrame(frame)
        }
        const onResize = () => {
          resize()
          if (reduce) renderer.render(scene, camera)
        }
        window.addEventListener('resize', onResize)

        setLive(true)
        raf = requestAnimationFrame(frame)

        cleanup = () => {
          window.removeEventListener('resize', onResize)
          cancelAnimationFrame(raf)
          earthGeo.dispose()
          hazeGeo.dispose()
          glowGeo.dispose()
          earthMat.dispose()
          hazeMat.dispose()
          glowMat.dispose()
          sprite.dispose()
          renderer.dispose()
        }
      } catch {
        // three failed to load or init: the static panel stays as-is.
      }
    }
    start()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [])

  return (
    <div
      className="border-line relative aspect-square overflow-hidden rounded-2xl border shadow-[0_24px_60px_-28px_rgba(120,48,21,.55)] dark:shadow-[0_24px_60px_-28px_rgba(0,0,0,.7)]"
      style={{
        background:
          'radial-gradient(circle at 38% 34%, #c98b54 0%, #a8431f 34%, #5b2a12 72%, #2c160a 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background:
            'radial-gradient(120% 120% at 62% 38%, #3a2413 0%, #241708 45%, #150d05 100%)',
        }}
      />
      <div
        className={`absolute inset-[14%] rounded-full border border-dashed border-[rgba(244,239,228,.35)] transition-opacity duration-700 ${live ? 'opacity-0' : ''}`}
      />
      <div
        className={`absolute inset-[26%] rounded-full border border-dashed border-[rgba(244,239,228,.35)] transition-opacity duration-700 ${live ? 'opacity-0' : ''}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${live ? 'opacity-100' : 'opacity-0'}`}
      />
      <p
        className="absolute right-3.5 bottom-3 left-3.5 text-[11.5px] leading-snug text-[#f4efe4]"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,.45)' }}
      >
        {caption}
      </p>
    </div>
  )
}
