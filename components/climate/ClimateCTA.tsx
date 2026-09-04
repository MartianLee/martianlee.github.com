'use client'

import siteMetadata from '@/data/siteMetadata'
import { climateCopy } from '@/data/climateData'
import { useLanguage } from '@/components/LanguageProvider'
import { mossText } from './styles'

export default function ClimateCTA() {
  const { lang } = useLanguage()
  const t = climateCopy[lang].cta
  return (
    <section className="border-line border-t py-8 text-center">
      <p className={`font-mono text-[11px] font-bold tracking-[0.16em] uppercase ${mossText}`}>
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-600 align-middle" />
        {t.label}
      </p>
      <p className="text-ink/80 mt-2 text-[1.02rem] font-semibold text-balance break-keep">
        {t.heading}
      </p>
      <div className="text-accent mt-3 flex justify-center gap-5 font-mono text-[13px]">
        <a href={`mailto:${siteMetadata.email}`}>Email</a>
        <a href={siteMetadata.github} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        <a href={siteMetadata.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn ↗
        </a>
      </div>
    </section>
  )
}
