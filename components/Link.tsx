'use client'

import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'
import { usePathname } from 'next/navigation'

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

/**
 * Posts (`/posts`, `/ko/posts`) and the knowledge base (`/kb`) render the same
 * MDX, whose in-content cross-links are authored as `/kb/<slug>`. When a reader
 * is inside a blog post, a `/kb/` link would bounce them out into the KB view.
 * Keep them in their current section by rewriting the `/kb/` prefix to match it.
 * Slugs are shared across `/kb`, `/posts`, and `/ko/posts`, so it's a prefix swap.
 */
function resolveInternalHref(href: string, pathname: string | null): string {
  if (!href.startsWith('/kb/') || !pathname) return href
  const rest = href.slice('/kb/'.length)
  if (pathname.startsWith('/ko/posts/')) return `/ko/posts/${rest}`
  if (pathname.startsWith('/posts/')) return `/posts/${rest}`
  return href
}

/**
 * A link to a file of the export (an image, a PDF, a download) rather than to a page. next/link would prefetch such an href as a
 * route payload, and the static host answers that request with a 404 each time one scrolls into view.
 */
const FILE_HREF =
  /^\/static\/|\.(?:png|jpe?g|gif|webp|avif|svg|ico|pdf|zip|mp3|mp4|webm|xml|json|txt|csv)$/i
const isFileHref = (href: string): boolean => FILE_HREF.test(href.split(/[?#]/)[0])

const CustomLink = ({
  href,
  children,
  ...rest
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const pathname = usePathname()
  const isInternalLink = typeof href === 'string' && href.startsWith('/')
  const isAnchorLink = typeof href === 'string' && href.startsWith('#')

  if (isInternalLink) {
    const to = resolveInternalHref(href, pathname)
    if (isFileHref(to)) {
      return (
        <a href={to} {...rest}>
          {children}
        </a>
      )
    }
    return (
      <Link href={to} {...rest}>
        {children}
      </Link>
    )
  }

  if (isAnchorLink) {
    return (
      <a href={href as string} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <a target="_blank" rel="noopener noreferrer" href={href as string} {...rest}>
      {children}
      <ExternalLinkIcon />
    </a>
  )
}

export default CustomLink
