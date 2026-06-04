import Link from '@/components/Link'
import PostLink from '@/components/PostLink'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from '.contentlayer/generated'

export default function WritingSection({ posts }: { posts: CoreContent<Blog>[] }) {
  const featured = posts.slice(0, 2)
  const rest = posts.slice(2, 5)
  return (
    <section className="py-12">
      <div className="sec-head">
        <span className="sec-num">02 — Selected writing</span>
        <Link href="/posts" className="text-muted hover:text-accent font-mono text-xs">
          All posts →
        </Link>
      </div>
      <p className="text-muted mb-8 max-w-[60ch] font-serif text-lg">
        I take large codebases apart and write down how they actually work.
      </p>
      <div className="flex flex-col gap-7">
        {featured.map((post) => (
          <article key={post.slug}>
            <div className="text-muted font-mono text-[11px] tracking-wide">
              {formatDate(post.date, siteMetadata.locale)} · {post.readingTime.text} ·{' '}
              {post.tags?.slice(0, 2).join(' / ')}
            </div>
            <h3 className="mt-1.5 text-2xl leading-tight font-bold tracking-tight">
              <PostLink slug={post.slug} className="hover:text-accent transition-colors">
                {post.title}
              </PostLink>
            </h3>
            {post.summary && (
              <p className="text-muted mt-2 max-w-[64ch] font-serif">{post.summary}</p>
            )}
          </article>
        ))}
      </div>
      <div className="mt-8">
        {rest.map((post) => (
          <div key={post.slug} className="list-row items-baseline">
            <PostLink
              slug={post.slug}
              className="hover:text-accent text-[17px] font-semibold transition-colors"
            >
              {post.title}
            </PostLink>
            <span className="text-muted shrink-0 font-mono text-xs">
              {formatDate(post.date, siteMetadata.locale)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
