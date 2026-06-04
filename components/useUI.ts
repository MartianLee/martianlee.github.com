'use client'

import { useLanguage } from './LanguageProvider'
import { ui, type UIStrings } from '@/lib/ui-strings'

/** UI strings for the currently selected reading language. */
export function useUI(): UIStrings {
  const { lang } = useLanguage()
  return ui[lang]
}

/** Pick a value by language, falling back to the English value when the Korean one is missing. */
export function useLocalized<T>(en: T, ko: T | undefined): T {
  const { lang } = useLanguage()
  return lang === 'ko' && ko != null ? ko : en
}
