import { listedBlogs, localizedList } from '@/lib/posts'
import Masthead from '@/components/home/Masthead'
import ProjectsSection from '@/components/home/ProjectsSection'
import WritingSection from '@/components/home/WritingSection'
import ExperienceSection from '@/components/home/ExperienceSection'
import ContactSection from '@/components/home/ContactSection'
import SectionContainer from '@/components/SectionContainer'

export default async function Page() {
  const posts = localizedList(listedBlogs())
  return (
    <SectionContainer>
      <Masthead />
      <ProjectsSection />
      <WritingSection posts={posts} />
      <ExperienceSection />
      <ContactSection />
    </SectionContainer>
  )
}
