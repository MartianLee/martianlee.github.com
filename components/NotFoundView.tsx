'use client'

import Link from './Link'
import HorizonBand from './HorizonBand'
import MarsLightTime from './MarsLightTime'
import { useUI } from './useUI'

export default function NotFoundView() {
  const ui = useUI()
  return (
    <div className="rh-page rh-nf">
      <HorizonBand
        title={ui.notFound.title}
        tele={
          <>
            <span className="rh-live">
              <i aria-hidden="true" />
              {ui.notFound.eyebrow}
            </span>
            <span className="rh-sep" aria-hidden="true">
              ·
            </span>
            <span>{ui.notFound.noSignal}</span>
          </>
        }
        aside={
          <svg className="rh-lander" viewBox="0 0 120 92" aria-hidden="true" focusable="false">
            <circle className="rh-lander-halo" cx="104" cy="10" r="7" />
            <g className="rh-lander-body">
              <path d="M103 12v22h2V12z" />
              <path d="M86 20c6-9 20-12 30-5l-3 3c-7-5-17-3-22 3z" />
              <path d="M30 40h60l8 22H22z" />
              <path d="M4 44h24v4H4zM92 44h24v4H92z" />
              <path d="M2 38h4v16H2zM114 38h4v16h-4z" />
              <path d="M40 34h40v6H40z" />
              <path d="M30 62 14 88h6l15-24zM90 62l16 26h-6L85 64zM58 62h4v26h-4z" />
              <path d="M8 88h16v4H8zM96 88h16v4H96zM52 88h16v4H52z" />
            </g>
            <circle className="rh-lander-beacon" cx="104" cy="10" r="3" />
          </svg>
        }
      />
      <div className="rh-wrap">
        <div className="rh-nf-copy">
          <p className="rh-nf-body">{ui.notFound.body}</p>
          <p className="rh-nf-mars">
            <MarsLightTime variant="notFound" />
          </p>
          <p className="rh-nf-actions">
            <Link className="rh-btn rh-btn--accent" href="/">
              {ui.notFound.home}
            </Link>
            <Link className="rh-btn" href="/posts">
              {ui.notFound.posts}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
