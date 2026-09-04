'use client'

import { climateCopy } from '@/data/climateData'
import { useLanguage } from '@/components/LanguageProvider'
import Globe3D from './Globe3D'

export default function ClimateHero() {
  const { lang } = useLanguage()
  const t = climateCopy[lang]
  return (
    <header className="pt-12 pb-9 sm:pt-14">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.15fr_.85fr] md:gap-11">
        <div>
          <p className="eyebrow mb-4">{t.hero.eyebrow}</p>
          <h1 className="font-serif text-[clamp(2.3rem,5vw,4rem)] leading-[1.08] font-bold tracking-[-0.02em] text-balance break-keep">
            {t.hero.title}
          </h1>
          <p className="text-ink/80 mt-4 max-w-[42ch] text-base">{t.hero.manifesto}</p>
          <p className="mt-4 max-w-[46ch] text-[15px] font-semibold">{t.hero.capLine}</p>
          <p className="mt-4 text-[13.5px] font-semibold">
            {t.hero.role} <span className="text-muted font-normal">{t.hero.roleSub}</span>
          </p>
        </div>
        <div className="mx-auto w-full max-w-[340px] md:max-w-none">
          <Globe3D caption={t.hero.globeCaption} />
        </div>
      </div>

      <div className="border-line divide-line mt-9 grid grid-cols-1 divide-y border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {t.stats.map((s) => (
          <div key={s.n} className="px-2 py-5 text-center">
            <div className="text-primary-800 dark:text-primary-300 font-serif text-[28px] tracking-[-0.01em] tabular-nums">
              {s.n}
            </div>
            <div className="text-ink/70 mt-1 text-[12.5px]">{s.label}</div>
          </div>
        ))}
      </div>
    </header>
  )
}
