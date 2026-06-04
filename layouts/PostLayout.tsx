import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from '.contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PostLink from '@/components/PostLink'
import SectionContainer from '@/components/SectionContainer'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { formatDate } from 'pliny/utils/formatDate'
import { ui } from '@/lib/ui-strings'

const editUrl = (path: string) => `${siteMetadata.siteRepo}/blob/main/data/${path}`

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; slug: string; title: string }
  prev?: { path: string; slug: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags, readingTime } = content
  const basePath = path.split('/')[0]
  const t = ui[(content as { language?: string }).language === 'ko' ? 'ko' : 'en'].post
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
            {t.backToWriting}
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
                {t.onThisPage}
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
              {t.editOnGitHub}
            </Link>
          </div>

          {(prev || next) && (
            <div className="mt-7 flex justify-between gap-5">
              <div>
                {prev?.slug && (
                  <>
                    <div className="text-muted font-mono text-[11px]">{t.previous}</div>
                    <PostLink slug={prev.slug} className="hover:text-accent font-semibold">
                      {prev.title}
                    </PostLink>
                  </>
                )}
              </div>
              <div className="text-right">
                {next?.slug && (
                  <>
                    <div className="text-muted font-mono text-[11px]">{t.next}</div>
                    <PostLink slug={next.slug} className="hover:text-accent font-semibold">
                      {next.title}
                    </PostLink>
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
