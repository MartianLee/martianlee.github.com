'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Lang = 'en' | 'ko'
const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  useEffect(() => {
    const stored = localStorage.getItem('lang')
    if (stored === 'ko' || stored === 'en') setLangState(stored)
  }, [])
  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l)
    setLangState(l)
  }
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
