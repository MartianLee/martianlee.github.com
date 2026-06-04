import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from '.contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { formatDate } from 'pliny/utils/formatDate'

const editUrl = (path: string) => `${siteMetadata.siteRepo}/blob/main/data/${path}`

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags, readingTime } = content
  const basePath = path.split('/')[0]
  const author = authorDetails[0]
  const toc: { value: string; url: string; depth: number }[] = Array.isArray(content.toc)
    ? (content.toc as { value: string; url: string; depth: number }[])
    : (() => {
        try {
          const parsed = JSON.parse(content.toc as unknown as string)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      })()

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <header className="pt-6">
          <Link href={`/${basePath}`} className="text-muted hover:text-accent font-mono text-xs">
            ← Writing
          </Link>
          {tags && (
            <div className="mt-7 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag key={tag} text={tag} />
              ))}
            </div>
          )}
          <h1 className="mt-3 max-w-[18ch] text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
            {title}
          </h1>
          {content.summary && (
            <p className="text-muted mt-4 max-w-[60ch] font-serif text-xl leading-snug">
              {content.summary}
            </p>
          )}
          <div className="text-muted mt-6 flex flex-wrap items-center gap-3 font-mono text-xs">
            {author?.name && (
              <>
                <span>{author.name}</span>
                <span>·</span>
              </>
            )}
            <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
            <span>·</span>
            <span>{readingTime.text}</span>
          </div>
        </header>

        <hr className="border-line mt-6" />

        <div className="reading-measure pt-9">
          {toc.length > 2 && (
            <nav className="border-line mb-9 rounded-lg border p-4 font-mono text-[12.5px] leading-relaxed">
              <div className="text-muted mb-1.5 text-[10px] tracking-[0.1em] uppercase">
                On this page
              </div>
              {toc
                .filter((h) => h.depth <= 3)
                .map((h) => (
                  <a
                    key={h.url}
                    href={h.url}
                    className="hover:text-accent block"
                    style={{ paddingLeft: `${(h.depth - 1) * 12}px` }}
                  >
                    {h.value}
                  </a>
                ))}
            </nav>
          )}

          <div className="prose max-w-none break-words">{children}</div>

          <div className="border-line mt-12 flex items-center justify-between border-t pt-5 font-mono text-xs">
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <Tag key={tag} text={tag} />
              ))}
            </div>
            <Link href={editUrl(filePath)} className="text-accent whitespace-nowrap">
              Edit on GitHub ↗
            </Link>
          </div>

          {(prev || next) && (
            <div className="mt-7 flex justify-between gap-5">
              <div>
                {prev?.path && (
                  <>
                    <div className="text-muted font-mono text-[11px]">← PREVIOUS</div>
                    <Link href={`/${prev.path}`} className="hover:text-accent font-semibold">
                      {prev.title}
                    </Link>
                  </>
                )}
              </div>
              <div className="text-right">
                {next?.path && (
                  <>
                    <div className="text-muted font-mono text-[11px]">NEXT →</div>
                    <Link href={`/${next.path}`} className="hover:text-accent font-semibold">
                      {next.title}
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {siteMetadata.comments && (
            <div className="pt-10" id="comment">
              <Comments slug={slug} />
            </div>
          )}
        </div>
      </article>
    </SectionContainer>
  )
}
