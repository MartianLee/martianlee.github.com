import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import { slug as slugify } from 'github-slugger'
import type { Blog, Authors } from '.contentlayer/generated'
import Comments from '@/components/Comments'
import HorizonBand from '@/components/HorizonBand'
import Link from '@/components/Link'
import PostLink from '@/components/PostLink'
import PostToc from '@/components/posts/PostToc'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import siteMetadata from '@/data/siteMetadata'
import { hasNumberedHeadings, parseToc } from '@/lib/headings'
import { formatPostDate } from '@/lib/post-date'
import { fill, ui } from '@/lib/ui-strings'

const editUrl = (path: string) => `${siteMetadata.siteRepo}/blob/main/data/${path}`

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; slug: string; title: string }
  prev?: { path: string; slug: string; title: string }
  children: ReactNode
}

const Sep = () => (
  <span className="rh-sep" aria-hidden="true">
    ·
  </span>
)

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags, readingTime } = content
  const basePath = path.split('/')[0]
  // The post's own language drives both the strings and the date; siteMetadata.locale would print Korean dates on English posts.
  const lang = content.language === 'ko' ? 'ko' : 'en'
  const t = ui[lang].post
  const author = authorDetails[0]
  const toc = parseToc(content.toc)
  const autonum = hasNumberedHeadings(toc) ? 'off' : 'on'
  const minutes = Math.max(1, Math.ceil(readingTime.minutes))
  const published = formatPostDate(date, lang)
  const chips = tags.map((tag) => (
    <Link key={tag} className="rh-tagchip" href={`/tags/${slugify(tag)}`}>
      {tag.split(' ').join('-')}
    </Link>
  ))

  return (
    <div className="rh-page">
      <HorizonBand
        variant="headline"
        title={title}
        dot={false}
        tele={
          <>
            <Link href={`/${basePath}`}>{t.backToWriting}</Link>
            {author?.name && (
              <>
                <Sep />
                <span>{author.name}</span>
              </>
            )}
            <Sep />
            <time dateTime={date}>{published}</time>
            <Sep />
            <span>{fill(ui[lang].list.readGauge, { n: minutes })}</span>
            {content.kind === 'note' && (
              <>
                <Sep />
                <span className="rh-note-mark">{t.studyNote}</span>
              </>
            )}
          </>
        }
      />
      <div className="rh-wrap">
        <div className="rh-post-intro">
          {content.summary && <p className="rh-post-sum">{content.summary}</p>}
          <p className="rh-post-tags">
            <span className="rh-stage" title={t.stage}>
              {content.stage}
            </span>
            {chips}
          </p>
        </div>

        <div className="rh-post-grid">
          <article className="prose rh-reading" data-autonum={autonum}>
            {children}
          </article>
          <PostToc toc={toc} label={t.onThisPage} />
        </div>

        <div className="rh-post-end">
          {tags.length > 0 && <p className="rh-post-tags">{chips}</p>}
          <a className="rh-edit" href={editUrl(filePath)} target="_blank" rel="noopener noreferrer">
            {t.editOnGitHub}
          </a>
        </div>

        {(prev?.slug || next?.slug) && (
          <nav className="rh-pn" aria-label={t.morePosts}>
            {prev?.slug && (
              <PostLink slug={prev.slug} className="rh-pn-card">
                <span>{t.previous}</span>
                <b>{prev.title}</b>
              </PostLink>
            )}
            {next?.slug && (
              <PostLink slug={next.slug} className="rh-pn-card rh-pn-next">
                <span>{t.next}</span>
                <b>{next.title}</b>
              </PostLink>
            )}
          </nav>
        )}

        {siteMetadata.comments && (
          <div className="rh-comments" id="comment">
            <Comments slug={slug} />
          </div>
        )}
      </div>
      <ScrollTopAndComment />
    </div>
  )
}
