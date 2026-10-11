'use client'

import type { ReactNode } from 'react'
import { useLanguage } from './LanguageProvider'

interface HorizonBandProps {
  title?: string
  titleKo?: string
  dot?: boolean
  tele?: ReactNode
  variant?: 'monument' | 'headline' | 'slim' | 'name'
  aside?: ReactNode
  children?: ReactNode
  headingId?: string
}

export default function HorizonBand({
  title,
  titleKo,
  dot = true,
  tele,
  variant = 'monument',
  aside,
  children,
  headingId = 'page-title',
}: HorizonBandProps) {
  const { lang } = useLanguage()
  const text = lang === 'ko' && titleKo ? titleKo : title
  const slim = variant === 'slim'
  return (
    <section
      className={`rh-band rh-band--${variant}`}
      aria-labelledby={!slim && text ? headingId : undefined}
      aria-hidden={slim ? true : undefined}
    >
      <div className="rh-band-sky" aria-hidden="true" />
      <svg
        className="rh-band-far"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="rh-f1"
          d="M0 100V62h64l14-10h118l12 8h96l18-14h120l12 10h112l26-16h116l14 12h104l14-8h126l16 10h96l12-8h86l14 8h36v46z"
        />
        <path
          className="rh-f2"
          d="M0 100V80c56-4 108-3 156-7l16-24h112l18 22c64 6 128 9 200 6s128-8 196-5l20-38h138l18 30c62 7 128 11 196 5l18-14h112v45z"
        />
      </svg>
      {!slim && (
        <div className="rh-band-inner">
          <div className={aside ? 'rh-band-row' : undefined}>
            <div>
              {tele && <p className="rh-band-tele">{tele}</p>}
              {children}
              {text && (
                <h1 className="rh-monument" id={headingId}>
                  {text}
                  {dot && <span className="rh-dot">.</span>}
                </h1>
              )}
            </div>
            {aside}
          </div>
        </div>
      )}
      <div className="rh-band-ground" aria-hidden="true">
        <svg viewBox="0 0 1200 12" preserveAspectRatio="none" focusable="false">
          <path d="M0 12V7c120-4 240-4 360-1s240 4 360 0 240-5 360-1l120 1v6z" />
        </svg>
      </div>
    </section>
  )
}
