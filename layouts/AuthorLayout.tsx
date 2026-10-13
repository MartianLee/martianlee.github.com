'use client'

import { Fragment, ReactNode } from 'react'
import siteMetadata from '@/data/siteMetadata'
import careerData from '@/data/careerData'
import Link from '@/components/Link'
import { useUI } from '@/components/useUI'
import { useLanguage } from '@/components/LanguageProvider'
import AboutBioKo from '@/components/about/AboutBioKo'
import ClimateCallout from '@/components/about/ClimateCallout'
import MarsGlobe from '@/components/about/MarsGlobe'

interface Props {
  // the bio in the author's MDX; the name comes from the UI strings and the contact links live in the footer
  children: ReactNode
}

export default function AuthorLayout({ children }: Props) {
  const ui = useUI()
  const { lang } = useLanguage()
  const pick = (en: string, ko?: string) => (lang === 'ko' && ko ? ko : en)
  // "SeongHwa Lee" stacks as two lines, the full stop belongs to the last word; "이성화" is one
  const words = ui.about.name.split(' ')
  return (
    <div className="rh-page">
      <section className="rh-about-band" aria-labelledby="about-name">
        <div className="rh-about-sky" aria-hidden="true" />
        <div className="rh-about-land" aria-hidden="true">
          <svg viewBox="0 0 1000 96" preserveAspectRatio="none" focusable="false">
            <path d="M0 96V54h34l10-12h62l12 11 20 2 16-18h118l9 13 34 2 14-14q30-3 58 4l12 9h44l10 10 30 2q24 4 46 0l20-6 34-2 30 8q40 6 80 2 50-6 100-1 52 5 110 1 50-4 107 3V96z" />
          </svg>
        </div>
        <div className="rh-about-in">
          <div className="rh-about-who">
            <p className="rh-about-eyebrow">
              {ui.masthead.eyebrow.split(' · ').map((part, i) => (
                <Fragment key={part}>
                  {i > 0 && ' · '}
                  <span className="rh-nw">{part}</span>
                </Fragment>
              ))}
            </p>
            <h1 className="rh-about-name" id="about-name">
              {words.map((word, i) => (
                <Fragment key={word}>
                  {i > 0 && ' '}
                  <span>
                    {word}
                    {i === words.length - 1 && <span className="rh-dot">.</span>}
                  </span>
                </Fragment>
              ))}
            </h1>
          </div>
          <MarsGlobe />
        </div>
      </section>

      <div className="rh-wrap">
        <div className="rh-about-read">
          <div className="prose rh-reading rh-about-bio">
            {lang === 'ko' ? <AboutBioKo /> : children}
          </div>
          <ClimateCallout />
        </div>

        <section className="rh-sec" aria-labelledby="exp-h">
          <div className="rh-sec-head">
            <span className="rh-sec-no">01</span>
            <h2 id="exp-h">{ui.about.experience}</h2>
            <a className="rh-sec-link" href={siteMetadata.linkedin}>
              {ui.cv}
            </a>
          </div>
          <ol className="rh-about-exp">
            {careerData.map((c) => (
              <li key={c.company}>
                <h3>
                  {c.href ? <Link href={c.href}>{c.company}</Link> : c.company}
                  <span className="sr-only">{', '}</span>
                  <span className="rh-role">{pick(c.role, c.roleKo)}</span>
                </h3>
                <span className="rh-period">{c.period}</span>
                <p>{pick(c.description, c.descriptionKo)}</p>
                {c.techStack && <p className="rh-about-stack">{c.techStack.join(' · ')}</p>}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
