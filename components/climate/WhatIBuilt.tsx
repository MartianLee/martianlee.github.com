'use client'

import { climateCopy } from '@/data/climateData'
import { useLanguage } from '@/components/LanguageProvider'
import { tagClass } from './styles'

export default function WhatIBuilt() {
  const { lang } = useLanguage()
  const t = climateCopy[lang].whatIBuilt
  return (
    <section className="py-12">
      <div className="sec-head">
        <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">{t.heading}</h2>
        <span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
          {t.label}
        </span>
      </div>
      <p className="text-muted mb-6 max-w-[58ch] text-sm">{t.sub}</p>

      <div className="flex flex-col gap-3">
        {t.cases.map((c) => (
          <article key={c.num} className="border-line bg-surface rounded-xl border p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-accent font-serif text-[22px]">{c.num}</span>
              <h3 className="text-[17px] font-bold tracking-tight text-balance break-keep">
                {c.title}
              </h3>
            </div>
            <p className="text-ink/75 mt-1.5 max-w-[74ch] text-[13.5px]">{c.desc}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {c.tags.map((tag) => (
                <span key={tag.label} className={tagClass(tag.kind)}>
                  {tag.label}
                </span>
              ))}
              <span className="text-muted ml-auto text-[10.5px] font-bold tracking-[0.08em] whitespace-nowrap">
                {t.upNext}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
