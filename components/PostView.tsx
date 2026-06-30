import { coreContent } from 'pliny/utils/contentlayer'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import { allAuthors } from '.contentlayer/generated'
import type { Authors, Blog } from '.contentlayer/generated'
import MermaidRenderer from '@/components/MermaidRenderer'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import type { CoreContent } from 'pliny/utils/contentlayer'

const layouts = { PostSimple, PostLayout, PostBanner }
const defaultLayout = 'PostLayout'

export default function PostView({
  post,
  prev,
  next,
}: {
  post: Blog
  prev?: CoreContent<Blog>
  next?: CoreContent<Blog>
}) {
  const authorList = post.authors || ['default']
  const authorDetails = authorList.map((a) =>
    coreContent(allAuthors.find((p) => p.slug === a) as Authors)
  )
  const mainContent = coreContent(post)
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((a) => ({ '@type': 'Person', name: a.name }))
  const Layout = layouts[post.layout || defaultLayout]
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
      <MermaidRenderer />
    </>
  )
}
