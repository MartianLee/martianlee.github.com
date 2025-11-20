import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from '.contentlayer/generated'
import HeroSection from '@/components/home/HeroSection'
import FeaturedSection from '@/components/home/FeaturedSection'
import TechStackSection from '@/components/home/TechStackSection'
import RecentPostsSection from '@/components/home/RecentPostsSection'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)

  return (
    <>
      <HeroSection />
      <FeaturedSection />
      <TechStackSection />
      <RecentPostsSection posts={posts} />
    </>
  )
}
