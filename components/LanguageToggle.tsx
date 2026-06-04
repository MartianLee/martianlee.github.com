'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  const choose = (l: 'en' | 'ko') => {
    setLang(l)
    if (l === 'ko' && pathname.startsWith('/posts/')) router.push('/ko' + pathname)
    else if (l === 'en' && pathname.startsWith('/ko/posts/'))
      router.push(pathname.replace(/^\/ko/, ''))
  }

  return (
    <div className="font-mono text-xs" aria-label="Reading language">
      <button
        onClick={() => choose('en')}
        className={lang === 'en' ? 'text-ink font-bold' : 'text-muted'}
      >
        EN
      </button>
      <span className="px-1 opacity-40">/</span>
      <button
        onClick={() => choose('ko')}
        className={lang === 'ko' ? 'text-ink font-bold' : 'text-muted'}
      >
        KO
      </button>
    </div>
  )
}
