import { ReactNode } from 'react'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { path, slug, date, title } = content

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <header className="border-line border-b pt-6 pb-8">
          <dl>
            <dt className="sr-only">Published on</dt>
            <dd className="text-muted font-mono text-xs">
              <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
            </dd>
          </dl>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{title}</h1>
        </header>
        <div className="reading-measure pt-9">
          <div className="prose max-w-none">{children}</div>
          {siteMetadata.comments && (
            <div className="pt-10" id="comment">
              <Comments slug={slug} />
            </div>
          )}
          <footer className="border-line mt-10 border-t pt-6">
            <div className="flex flex-col gap-3 font-mono text-sm sm:flex-row sm:justify-between">
              {prev && prev.path && (
                <div>
                  <div className="text-muted text-[11px]">← PREVIOUS</div>
                  <Link
                    href={`/${prev.path}`}
                    className="hover:text-accent font-semibold"
                    aria-label={`Previous post: ${prev.title}`}
                  >
                    {prev.title}
                  </Link>
                </div>
              )}
              {next && next.path && (
                <div className="sm:text-right">
                  <div className="text-muted text-[11px]">NEXT →</div>
                  <Link
                    href={`/${next.path}`}
                    className="hover:text-accent font-semibold"
                    aria-label={`Next post: ${next.title}`}
                  >
                    {next.title}
                  </Link>
                </div>
              )}
            </div>
          </footer>
        </div>
      </article>
    </SectionContainer>
  )
}
