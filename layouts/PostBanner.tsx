import { ReactNode } from 'react'
import Image from '@/components/Image'
import Bleed from 'pliny/ui/Bleed'
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

export default function PostMinimal({ content, next, prev, children }: LayoutProps) {
  const { slug, title, images } = content
  const displayImage =
    images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/picsum/800/400'

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div className="pb-8">
          <div className="w-full">
            <Bleed>
              <div className="relative aspect-[2/1] w-full">
                <Image src={displayImage} alt={title} fill className="object-cover" />
              </div>
            </Bleed>
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{title}</h1>
        </div>
        <div className="reading-measure">
          <div className="prose max-w-none py-4">{children}</div>
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
