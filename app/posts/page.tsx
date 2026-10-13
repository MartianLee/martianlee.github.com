import ListLayout from '@/layouts/ListLayoutWithTags'
import { listedBlogs, localizedList } from '@/lib/posts'
import { genPageMetadata } from 'app/seo'
import tagData from 'app/tag-data.json'

const POSTS_PER_PAGE = 10

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
  const stats = {
    listedTotal: posts.length,
    tagTotal: Object.keys(tagData as Record<string, number>).length,
    latest: posts[0]?.date ?? '',
    maxMinutes: Math.max(1, ...posts.map((p) => Math.ceil(p.readingTime.minutes))),
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="Posts"
      titleKo="글"
      stats={stats}
    />
  )
}
