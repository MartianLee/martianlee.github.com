import { listedBlogs, localizedList } from '@/lib/posts'
import MarsHorizon from '@/components/home/MarsHorizon'
import ProjectsSection from '@/components/home/ProjectsSection'
import WritingSection from '@/components/home/WritingSection'
import ExperienceSection from '@/components/home/ExperienceSection'

export default async function Page() {
  const posts = localizedList(listedBlogs())
  return (
    <div className="rh-page">
      <MarsHorizon />
      <div className="rh-wrap">
        <ProjectsSection />
        <WritingSection posts={posts} />
        <ExperienceSection />
      </div>
    </div>
  )
}
