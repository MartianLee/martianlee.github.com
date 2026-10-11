'use client'

import { useEffect, type RefObject } from 'react'

type Vec3 = [number, number, number]

const norm = (v: Vec3): Vec3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/** Resting light: upper left, the same shading the planets have in CSS before any pointer arrives. */
const REST = norm([-0.35, -0.45, 0.82])

interface Planet {
  orb: HTMLElement
  tile: HTMLElement
  row: HTMLElement | null
  /** current light direction */
  l: Vec3
  /** current scale (a lit row grows a little) */
  s: number
  /** current activity: 0 at rest, 1 while the Sun is out */
  a: number
}

/**
 * The pointer is the Sun: every planet (.rh-orb) inside `listRef` turns its lit side toward it (REF index.html 705 to 765).
 * Variables are written on the elements that read them: the orb gets --rh-lx/--rh-ly/--rh-hx/--rh-hy/--rh-sx/--rh-sy,
 * --rh-t0..t2, --rh-d1/--rh-d2, --rh-act, --rh-rx/--rh-ry and --rh-sc (the orb re-declares --rh-lx/--rh-ly itself, so a value set
 * higher up would be ignored), the tile gets --rh-act/--rh-gx/--rh-gy, the row gets --rh-mx. One rAF runs while anything is
 * still easing and none otherwise. Keyboard focus puts the Sun over the focused row's title. Touch-only devices keep the resting light.
 */
export function usePointerSun(listRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const list = listRef.current
    if (!list || window.matchMedia('(hover: none)').matches) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const planets: Planet[] = Array.from(list.querySelectorAll<HTMLElement>('.rh-orb')).map(
      (orb) => ({
        orb,
        tile: orb.parentElement ?? orb,
        row: orb.closest<HTMLElement>('.rh-proj-row'),
        l: [...REST] as Vec3,
        s: 1,
        a: 0,
      })
    )
    let sun: { x: number; y: number } | null = null
    let hoverRow: HTMLElement | null = null
    let focusRow: HTMLElement | null = null
    let raf = 0
    let lastT = 0

    const target = (r: DOMRect): Vec3 =>
      sun ? norm([sun.x - (r.left + r.width / 2), sun.y - (r.top + r.height / 2), 260]) : REST

    const paint = (p: Planet) => {
      const [x, y] = p.l
      const a = p.a
      const f = 55 + 22 * a
      const st = p.orb.style
      st.setProperty('--rh-act', a.toFixed(3))
      st.setProperty('--rh-lx', `${(50 + x * 40).toFixed(1)}%`)
      st.setProperty('--rh-ly', `${(50 + y * 40).toFixed(1)}%`)
      st.setProperty('--rh-hx', `${(50 + x * 34).toFixed(1)}%`)
      st.setProperty('--rh-hy', `${(50 + y * 34).toFixed(1)}%`)
      st.setProperty('--rh-sx', `${(50 + x * f).toFixed(1)}%`)
      st.setProperty('--rh-sy', `${(50 + y * f).toFixed(1)}%`)
      st.setProperty('--rh-t0', `${(30 - 8 * a).toFixed(1)}%`)
      st.setProperty('--rh-t1', `${(58 - 12 * a).toFixed(1)}%`)
      st.setProperty('--rh-t2', `${(90 - 18 * a).toFixed(1)}%`)
      st.setProperty('--rh-d1', (0.42 + 0.16 * a).toFixed(3))
      st.setProperty('--rh-d2', (0.9 + 0.07 * a).toFixed(3))
      p.tile.style.setProperty('--rh-act', (a * 0.9).toFixed(3))
      p.tile.style.setProperty('--rh-gx', `${(50 + x * 75).toFixed(1)}%`)
      p.tile.style.setProperty('--rh-gy', `${(50 + y * 75).toFixed(1)}%`)
      st.setProperty('--rh-ry', `${(still ? 0 : (x - REST[0]) * 14).toFixed(2)}deg`)
      st.setProperty('--rh-rx', `${(still ? 0 : -(y - REST[1]) * 14).toFixed(2)}deg`)
      st.setProperty('--rh-sc', p.s.toFixed(3))
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016)
      lastT = now
      const k = still ? 1 : 1 - Math.exp(-dt * 7)
      const rects = planets.map((p) => p.orb.getBoundingClientRect())
      let moving = false
      planets.forEach((p, i) => {
        const t = target(rects[i])
        const lit = p.row !== null && (p.row === hoverRow || p.row === focusRow) ? 1.07 : 1
        const act = sun ? 1 : 0
        const n = norm([
          p.l[0] + (t[0] - p.l[0]) * k,
          p.l[1] + (t[1] - p.l[1]) * k,
          p.l[2] + (t[2] - p.l[2]) * k,
        ])
        const ds =
          Math.abs(n[0] - p.l[0]) +
          Math.abs(n[1] - p.l[1]) +
          Math.abs(lit - p.s) +
          Math.abs(act - p.a)
        p.l = n
        p.s += (lit - p.s) * k
        p.a += (act - p.a) * k
        if (ds > 0.0005) moving = true
        paint(p)
      })
      raf = moving && !document.hidden ? requestAnimationFrame(step) : 0
    }
    const kick = () => {
      if (raf) return
      lastT = performance.now()
      raf = requestAnimationFrame(step)
    }

    const rowOf = (t: EventTarget | null) =>
      t instanceof Element ? t.closest<HTMLElement>('.rh-proj-row') : null
    /** "Sun over the title": the Sun sits on the left of the focused row's title. */
    const sunFor = (row: HTMLElement) => {
      const r = (row.querySelector('.rh-proj-title') ?? row).getBoundingClientRect()
      return { x: r.left + Math.min(r.width, 160) / 2, y: r.top + r.height / 2 }
    }

    const onMove = (e: PointerEvent) => {
      sun = { x: e.clientX, y: e.clientY }
      const row = rowOf(e.target)
      hoverRow = row
      if (row) {
        row.style.setProperty(
          '--rh-mx',
          `${(e.clientX - row.getBoundingClientRect().left).toFixed(0)}px`
        )
      }
      kick()
    }
    const onLeave = () => {
      hoverRow = null
      sun = focusRow ? sunFor(focusRow) : null
      kick()
    }
    const onFocusIn = (e: FocusEvent) => {
      const row = rowOf(e.target)
      // keyboard focus only: a mouse click also focuses the link, and the Sun belongs to the pointer then
      if (!row || !(e.target instanceof Element) || !e.target.matches(':focus-visible')) return
      focusRow = row
      row.style.setProperty('--rh-mx', '24%')
      sun = sunFor(row)
      kick()
    }
    const onFocusOut = () => {
      focusRow = null
      if (!hoverRow) sun = null
      kick()
    }
    const onScroll = () => {
      if (focusRow && !hoverRow) {
        sun = sunFor(focusRow)
        kick()
      }
    }

    list.addEventListener('pointermove', onMove)
    list.addEventListener('pointerleave', onLeave)
    list.addEventListener('focusin', onFocusIn)
    list.addEventListener('focusout', onFocusOut)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      list.removeEventListener('pointermove', onMove)
      list.removeEventListener('pointerleave', onLeave)
      list.removeEventListener('focusin', onFocusIn)
      list.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [listRef])
}
