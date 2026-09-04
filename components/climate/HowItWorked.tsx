'use client'

import { climateCopy } from '@/data/climateData'
import { useLanguage } from '@/components/LanguageProvider'
import { pillClass } from './styles'

export default function HowItWorked() {
  const { lang } = useLanguage()
  const t = climateCopy[lang].howItWorked
  return (
    <section className="pb-12">
      <div className="border-line bg-surface rounded-2xl border p-6">
        <h3 className="mb-2 font-serif text-[19px] font-bold">{t.title}</h3>
        <p className="text-ink/75 max-w-[72ch] text-[13.5px]">{t.body}</p>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {t.pills.map((p) => (
            <span key={p.label} className={pillClass(p.own)}>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
