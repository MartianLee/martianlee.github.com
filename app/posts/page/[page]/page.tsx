import ListLayout from '@/layouts/ListLayoutWithTags'
import { listedBlogs, localizedList } from '@/lib/posts'
import tagData from 'app/tag-data.json'

const POSTS_PER_PAGE = 10

export const generateStaticParams = async () => {
  const totalPages = Math.ceil(listedBlogs().length / POSTS_PER_PAGE)
  const paths = Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }))

  return paths
}

export default async function Page(props: { params: Promise<{ page: string }> }) {
  const params = await props.params
  const posts = localizedList(listedBlogs())
  const pageNumber = parseInt(params.page as string)
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
