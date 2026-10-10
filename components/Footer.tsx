'use client'

import { useEffect, useRef } from 'react'
import siteMetadata from '@/data/siteMetadata'
import MarsLightTime from './MarsLightTime'
import { useUI } from './useUI'

export default function Footer() {
  const ui = useUI()
  const contactRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const contact = contactRef.current
    if (!contact) return
    const wire = contact.querySelector<HTMLElement>('.rh-wire')
    const from = contact.querySelector<HTMLElement>('.rh-status')
    if (!wire || !from) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Contact: a relay pulse runs along the wire from the status text towards the links.
    const send = (a: HTMLElement) => {
      const group = a.parentElement
      if (!group) return
      const c = contact.getBoundingClientRect()
      const f = from.getBoundingClientRect()
      const t = group.getBoundingClientRect()
      const sameRow = Math.abs((f.top + f.bottom) / 2 - (t.top + t.bottom) / 2) < 8
      if (!sameRow || t.left - f.right < 60) return
      const x0 = f.right - c.left + 14
      const x1 = t.left - c.left - 12
      wire.style.setProperty('--rh-x0', x0.toFixed(0) + 'px')
      wire.style.setProperty('--rh-y0', ((f.top + f.bottom) / 2 - c.top).toFixed(0) + 'px')
      wire.style.setProperty('--rh-len', Math.max(0, x1 - x0).toFixed(0) + 'px')
      contact.classList.remove('rh-tx')
      void contact.offsetWidth // restart the animation
      contact.classList.add('rh-tx')
    }
    const stop = () => contact.classList.remove('rh-tx')

    const removers: Array<() => void> = []
    const listen = (el: HTMLElement, type: string, fn: () => void) => {
      el.addEventListener(type, fn)
      removers.push(() => el.removeEventListener(type, fn))
    }
    contact.querySelectorAll<HTMLAnchorElement>('nav a').forEach((a) => {
      const start = () => {
        if (!reduceMotion.matches) send(a)
      }
      listen(a, 'pointerenter', start)
      listen(a, 'focus', start)
      listen(a, 'pointerleave', stop)
      listen(a, 'blur', stop)
    })
    return () => {
      removers.forEach((remove) => remove())
      stop()
    }
  }, [])
  return (
    <footer className="rh-footer site-chrome-footer">
      <div className="rh-wrap">
        <section className="rh-contact" id="contact" aria-label="Contact" ref={contactRef}>
          <span className="rh-wire" aria-hidden="true">
            <i />
          </span>
          <p className="rh-status">
            <i aria-hidden="true" />
            {ui.contact.open}
          </p>
          <nav aria-label="Contact links">
            <a href={`mailto:${siteMetadata.email}`}>{ui.contact.email}</a>
            <a href={siteMetadata.github}>GitHub ↗</a>
            <a href={siteMetadata.linkedin}>LinkedIn ↗</a>
          </nav>
          <p className="rh-live-line">
            <MarsLightTime variant="contact" />
          </p>
        </section>
        <div className="rh-foot">
          <span>
            © {new Date().getFullYear()} {siteMetadata.author}
          </span>
          <span>{ui.footer.location}</span>
        </div>
      </div>
    </footer>
  )
}
