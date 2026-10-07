'use client'

import Link from '@/components/Link'
import { useLanguage } from '@/components/LanguageProvider'
import careerData from '@/data/careerData'

/** Experience rows, shared by the home page and the About page. */
export default function CareerList() {
  const { lang } = useLanguage()
  const pick = (en: string, ko?: string) => (lang === 'ko' && ko ? ko : en)
  return (
    <div>
      {careerData.map((c) => (
        <div key={c.company} className="list-row">
          <div>
            <h3 className="text-xl font-bold">
              {c.href ? (
                <Link
                  href={c.href}
                  className="hover:text-accent underline-offset-[3px] transition-colors hover:underline"
                >
                  {c.company}
                </Link>
              ) : (
                c.company
              )}{' '}
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
  )
}
