import ProjectsView from '@/components/projects/ProjectsView'
import { genPageMetadata } from 'app/seo'
import SectionContainer from '@/components/SectionContainer'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function Projects() {
  return (
    <SectionContainer>
      <ProjectsView />
    </SectionContainer>
  )
}
