'use client'

import Link from './Link'
import { useLanguage } from './LanguageProvider'

export default function PostLink({
  slug,
  className,
  children,
  'aria-label': ariaLabel,
}: {
  slug: string
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}) {
  const { lang } = useLanguage()
  const href = lang === 'ko' ? `/ko/posts/${slug}` : `/posts/${slug}`
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}
