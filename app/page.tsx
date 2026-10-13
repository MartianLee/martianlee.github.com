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
        {/* the year of the build: the chart's first render matches this page, then it reads the visitor's clock */}
        <ExperienceSection initialYear={new Date().getFullYear()} />
      </div>
    </div>
  )
}
