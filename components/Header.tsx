'use client'

import { usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageToggle from './LanguageToggle'
import { useUI } from './useUI'
import type { UIStrings } from '@/lib/ui-strings'

const navLabel = (ui: UIStrings, href: string, fallback: string): string => {
  if (href === '/projects') return ui.nav.projects
  if (href === '/posts') return ui.nav.writing
  if (href === '/kb') return ui.nav.notes
  if (href === '/about') return ui.nav.about
  return fallback
}

const isCurrent = (pathname: string, href: string): boolean => {
  if (href === '/posts') return /^\/(posts|tags|ko\/posts)(\/|$)/.test(pathname)
  return pathname === href || pathname.startsWith(href + '/')
}

const Header = () => {
  const ui = useUI()
  const pathname = usePathname() ?? '/'
  return (
    <header className="rh-head site-chrome-header">
      <Link href="/" aria-label={siteMetadata.headerTitle} className="rh-wordmark">
        ML<span>.</span>
      </Link>
      <div className="rh-tools">
        <nav className="rh-nav" aria-label="Site">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
            >
              {navLabel(ui, link.href, link.title)}
            </Link>
          ))}
          <a className="rh-cv" href={siteMetadata.linkedin}>
            {ui.cv}
          </a>
        </nav>
        <LanguageToggle />
        <ThemeSwitch />
        <SearchButton />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
