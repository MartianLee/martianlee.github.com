'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  const onKoPost = pathname.startsWith('/ko/posts/')
  const onEnPost = pathname.startsWith('/posts/') && !pathname.startsWith('/posts/page/')
  // Highlight the language actually being shown: a post detail page reflects its
  // own language; elsewhere reflect the saved reading preference.
  const active: 'en' | 'ko' = onKoPost ? 'ko' : onEnPost ? 'en' : lang

  const choose = (l: 'en' | 'ko') => {
    setLang(l) // remember the reading preference (drives post links elsewhere)
    if (l === 'ko' && onEnPost) router.push('/ko' + pathname)
    else if (l === 'en' && onKoPost) router.push(pathname.replace(/^\/ko/, ''))
  }

  return (
    <div
      className="font-mono text-xs"
      title="Reading language (switches the article on post pages)"
    >
      <button
        type="button"
        onClick={() => choose('en')}
        aria-pressed={active === 'en'}
        className={`cursor-pointer transition-colors ${active === 'en' ? 'text-ink font-bold' : 'text-muted hover:text-ink'}`}
      >
        EN
      </button>
      <span className="text-muted px-1 opacity-50">/</span>
      <button
        type="button"
        onClick={() => choose('ko')}
        aria-pressed={active === 'ko'}
        className={`cursor-pointer transition-colors ${active === 'ko' ? 'text-ink font-bold' : 'text-muted hover:text-ink'}`}
      >
        KO
      </button>
    </div>
  )
}
