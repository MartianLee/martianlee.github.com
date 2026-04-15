import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="0.75em"
    height="0.75em"
    fill="currentColor"
    style={{ display: 'inline', marginLeft: '0.15em', verticalAlign: 'baseline' }}
    aria-hidden="true"
  >
    <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854.22a.75.75 0 0 1 .896-.152l.146.102 1.384 1.384a.75.75 0 0 1 .102.146.75.75 0 0 1-.102.896l-5.72 5.72a.75.75 0 0 1-1.06-1.06l5.72-5.72-1.384-1.384a.75.75 0 0 1 .018-1.032Z" />
  </svg>
)

const CustomLink = ({
  href,
  children,
  ...rest
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }

  if (isAnchorLink) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <a target="_blank" rel="noopener noreferrer" href={href} {...rest}>
      {children}
      <ExternalLinkIcon />
    </a>
  )
}

export default CustomLink
