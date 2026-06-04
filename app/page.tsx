import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from '.contentlayer/generated'
import Masthead from '@/components/home/Masthead'
import ProjectsSection from '@/components/home/ProjectsSection'
import WritingSection from '@/components/home/WritingSection'
import ExperienceSection from '@/components/home/ExperienceSection'
import ContactSection from '@/components/home/ContactSection'

export default async function Page() {
  const posts = allCoreContent(sortPosts(allBlogs))
  return (
    <>
      <Masthead />
      <ProjectsSection />
      <WritingSection posts={posts} />
      <ExperienceSection />
      <ContactSection />
    </>
  )
}
