'use client'

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

const Header = () => {
  const ui = useUI()
  return (
    <header className="site-chrome-header flex items-center justify-between py-7">
      <Link
        href="/"
        aria-label={siteMetadata.headerTitle}
        className="text-xl font-bold tracking-tight"
      >
        ML<span className="text-accent">.</span>
      </Link>
      <div className="flex items-center gap-4 font-mono text-xs sm:gap-5">
        <nav className="hidden items-center gap-5 sm:flex">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="text-ink hover:text-accent transition-colors"
            >
              {navLabel(ui, link.href, link.title)}
            </Link>
          ))}
          <a href={siteMetadata.linkedin} className="text-accent">
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
