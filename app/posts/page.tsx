import ListLayout from '@/layouts/ListLayoutWithTags'
import { listedBlogs, localizedList } from '@/lib/posts'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/SectionContainer'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Posts' })

export default function BlogPage() {
  const posts = localizedList(listedBlogs())
  const pageNumber = 1
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <SectionContainer>
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="All Posts"
        titleKo="전체 글"
      />
    </SectionContainer>
  )
}
