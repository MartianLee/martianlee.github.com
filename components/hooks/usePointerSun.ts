'use client'

import { useEffect, type RefObject } from 'react'
import { watchDarkTheme } from '@/lib/theme'

type Vec3 = [number, number, number]

const norm = (v: Vec3): Vec3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/** Resting light when CSS gives none to read: upper left. */
const FALLBACK_REST = norm([-0.35, -0.45, 0.82])

/**
 * The light a planet rests in, read from the tokens its CSS gives it (--rh-orb-lx/--rh-orb-ly, the highlight's place in percent:
 * they differ by context and by theme, for example the detail hero rests lower right in the dark theme, like the band's sun).
 * Inverts the `50 + x * 40` mapping that `paint` writes back, with z from the unit length.
 */
const restFromCss = (orb: HTMLElement): Vec3 => {
  const cs = getComputedStyle(orb)
  const lx = parseFloat(cs.getPropertyValue('--rh-orb-lx'))
  const ly = parseFloat(cs.getPropertyValue('--rh-orb-ly'))
  if (!Number.isFinite(lx) || !Number.isFinite(ly)) return [...FALLBACK_REST]
  const x = (lx - 50) / 40
  const y = (ly - 50) / 40
  return [x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))]
}

interface Planet {
  orb: HTMLElement
  tile: HTMLElement
  row: HTMLElement | null
  /** the light it eases back to when no Sun is out */
  rest: Vec3
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
 * Every planet eases back to the resting light its own CSS gives it (see `restFromCss`), read at mount and again when the theme flips.
 */
export function usePointerSun(listRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const list = listRef.current
    if (!list || window.matchMedia('(hover: none)').matches) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const planets: Planet[] = Array.from(list.querySelectorAll<HTMLElement>('.rh-orb')).map(
      (orb) => {
        const rest = restFromCss(orb)
        return {
          orb,
          tile: orb.parentElement ?? orb,
          row: orb.closest<HTMLElement>('.rh-proj-row'),
          rest,
          l: [...rest] as Vec3,
          s: 1,
          a: 0,
        }
      }
    )
    // true once step() has written light onto the orbs: from then on a flip of the theme has to move it, before that the CSS follows
    let painted = false
    let sun: { x: number; y: number } | null = null
    let hoverRow: HTMLElement | null = null
    let focusRow: HTMLElement | null = null
    let raf = 0
    let lastT = 0

    const target = (p: Planet, r: DOMRect): Vec3 =>
      sun ? norm([sun.x - (r.left + r.width / 2), sun.y - (r.top + r.height / 2), 260]) : p.rest

    const paint = (p: Planet) => {
      const [x, y] = p.l
      const [restX, restY] = p.rest
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
      st.setProperty('--rh-ry', `${(still ? 0 : (x - restX) * 14).toFixed(2)}deg`)
      st.setProperty('--rh-rx', `${(still ? 0 : -(y - restY) * 14).toFixed(2)}deg`)
      st.setProperty('--rh-sc', p.s.toFixed(3))
    }

    const step = (now: number) => {
      painted = true
      const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016)
      lastT = now
      const k = still ? 1 : 1 - Math.exp(-dt * 7)
      const rects = planets.map((p) => p.orb.getBoundingClientRect())
      let moving = false
      planets.forEach((p, i) => {
        const t = target(p, rects[i])
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

    // the resting light differs by theme in CSS, so it is read again; light already written on the orbs eases to it, otherwise the CSS shows it
    const onTheme = () => {
      for (const p of planets) p.rest = restFromCss(p.orb)
      if (painted) kick()
      else for (const p of planets) p.l = [...p.rest] as Vec3
    }
    const stopTheme = watchDarkTheme(onTheme)
    // step() ends the loop when the tab is hidden, so a planet that was still easing needs a nudge when the tab is back
    const onVisible = () => {
      if (!document.hidden) kick()
    }
    document.addEventListener('visibilitychange', onVisible)

    list.addEventListener('pointermove', onMove)
    list.addEventListener('pointerleave', onLeave)
    list.addEventListener('focusin', onFocusIn)
    list.addEventListener('focusout', onFocusOut)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      stopTheme()
      document.removeEventListener('visibilitychange', onVisible)
      list.removeEventListener('pointermove', onMove)
      list.removeEventListener('pointerleave', onLeave)
      list.removeEventListener('focusin', onFocusIn)
      list.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [listRef])
}
