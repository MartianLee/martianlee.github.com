'use client'

import careerData from '@/data/careerData'
import siteMetadata from '@/data/siteMetadata'
import { useUI } from '@/components/useUI'
import { useLanguage } from '@/components/LanguageProvider'

export default function ExperienceSection() {
  const ui = useUI()
  const { lang } = useLanguage()
  const pick = (en: string, ko?: string) => (lang === 'ko' && ko ? ko : en)
  return (
    <section className="py-12">
      <div className="sec-head">
        <span className="sec-num">{ui.sections.experience}</span>
        <a href={siteMetadata.linkedin} className="text-accent font-mono text-xs">
          {ui.cv}
        </a>
      </div>
      <div>
        {careerData.map((c) => (
          <div key={c.company} className="list-row">
            <div>
              <h3 className="text-xl font-bold">
                {c.company}{' '}
                <span className="text-muted text-base font-medium">— {pick(c.role, c.roleKo)}</span>
              </h3>
              <p className="text-muted mt-1 font-serif text-base">
                {pick(c.description, c.descriptionKo)}
                {c.techStack ? ` · ${c.techStack.join(' · ')}` : ''}
              </p>
            </div>
            <span className="text-muted shrink-0 pt-1 font-mono text-xs whitespace-nowrap">
              {c.period}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
