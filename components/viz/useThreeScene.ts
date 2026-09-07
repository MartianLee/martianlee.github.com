'use client'

import { useEffect, useState, type RefObject } from 'react'
import type * as ThreeNS from 'three'
import type { Three } from './three-utils'

export interface SceneHandle {
  /** 매 프레임 호출. ts = performance.now 기반 ms, dt = 직전 프레임과의 간격 ms */
  render: (ts: number, dt: number) => void
  /** 캔버스 CSS 크기 변경 시 호출(카메라 aspect 갱신용) */
  resize: (w: number, h: number) => void
  dispose: () => void
}

export type SceneBuilder = (
  THREE: Three,
  canvas: HTMLCanvasElement,
  renderer: ThreeNS.WebGLRenderer
) => SceneHandle

/** idle: SSR/로딩 전, live: 애니메이션 중, static: reduced-motion 1프레임, failed: three 로드/WebGL 실패 */
export type VizStatus = 'idle' | 'live' | 'static' | 'failed'

/**
 * three를 지연 로드해 장면을 구동한다.
 * - 캔버스가 화면에 보일 때만 RAF를 돈다(포스트 한 페이지에 장면 여러 개).
 * - prefers-reduced-motion이면 첫 프레임만 렌더한다.
 * - 언마운트 시 RAF 취소 + 장면/렌더러 dispose.
 * `build`는 모듈 레벨 함수여야 한다(의존성 배열에 들어가므로 매 렌더마다 새로 만들면 장면이 재생성된다).
 */
export function useThreeScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  build: SceneBuilder
): VizStatus {
  const [status, setStatus] = useState<VizStatus>('idle')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    let raf = 0
    let last = 0
    let visible = false
    let handle: SceneHandle | undefined
    let renderer: ThreeNS.WebGLRenderer | undefined
    let io: IntersectionObserver | undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      if (!renderer || !handle) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      handle.resize(w, h)
    }
    const frame = (ts: number) => {
      raf = 0
      if (disposed || !handle) return
      const dt = last ? Math.min(ts - last, 100) : 16
      last = ts
      handle.render(ts, dt)
      if (!reduce && visible) raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(frame)
    }

    const run = async () => {
      try {
        const THREE = await import('three')
        if (disposed) return
        THREE.ColorManagement.enabled = false
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        handle = build(THREE, canvas, renderer)
        resize()
        handle.render(0, 0)
        setStatus(reduce ? 'static' : 'live')
        if (!reduce) {
          // reduced-motion: 첫 프레임만. observer를 두지 않아야 가시성 변화로 두 번째 프레임이 그려지지 않는다.
          io = new IntersectionObserver(
            (entries) => {
              visible = entries[0]?.isIntersecting ?? false
              if (visible) start()
            },
            { threshold: 0.05 }
          )
          io.observe(canvas)
        }
        window.addEventListener('resize', resize)
      } catch (err) {
        console.warn('[useThreeScene] 3D scene unavailable, showing fallback', err)
        setStatus('failed')
      }
    }
    run()

    return () => {
      disposed = true
      io?.disconnect()
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      try {
        handle?.dispose()
      } finally {
        renderer?.dispose()
      }
    }
  }, [canvasRef, build])

  return status
}
