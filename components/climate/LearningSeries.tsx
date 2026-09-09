'use client'

import Link from '@/components/Link'
import { climateCopy } from '@/data/climateData'
import { useLanguage } from '@/components/LanguageProvider'
import { mossText } from './styles'

export default function LearningSeries() {
  const { lang } = useLanguage()
  const t = climateCopy[lang].series
  const readLabel = lang === 'ko' ? '읽기 →' : 'Read →'
  const hrefFor = (slug: string) => (lang === 'ko' ? `/ko/posts/${slug}` : `/posts/${slug}`)
  return (
    <section className="pb-12">
      <div className="sec-head">
        <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">{t.heading}</h2>
        <span className="text-muted font-mono text-[11px] tracking-[0.08em] uppercase">
          {t.label}
        </span>
      </div>
      <p className="text-muted mb-6 max-w-[58ch] text-sm">{t.sub}</p>

      <div className="flex flex-col gap-2.5">
        {t.items.map((item) => {
          const inner = (
            <>
              <div className={`text-center font-serif text-xl ${mossText}`}>{item.num}</div>
              <div>
                <h4 className="text-[15px] font-semibold tracking-tight break-keep">
                  {item.title}
                </h4>
                <p className="text-ink/70 mt-0.5 text-[12.5px]">{item.desc}</p>
              </div>
              <span
                className={`col-start-2 text-[10.5px] font-bold tracking-[0.08em] whitespace-nowrap sm:col-start-auto ${item.slug ? 'text-accent' : 'text-muted'}`}
              >
                {item.slug ? readLabel : t.badge}
              </span>
            </>
          )
          const cls =
            'border-line grid grid-cols-[34px_1fr] items-center gap-4 rounded-xl border px-4 py-3 sm:grid-cols-[46px_1fr_auto]'
          return item.slug ? (
            <Link
              key={item.num}
              href={hrefFor(item.slug)}
              className={`${cls} hover:border-accent transition-colors`}
            >
              {inner}
            </Link>
          ) : (
            <div key={item.num} className={cls}>
              {inner}
            </div>
          )
        })}
      </div>
    </section>
  )
}
