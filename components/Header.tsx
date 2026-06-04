import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageToggle from './LanguageToggle'

const Header = () => {
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
              {link.title}
            </Link>
          ))}
          <a href="/static/cv.pdf" className="text-accent">
            CV ↗
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
