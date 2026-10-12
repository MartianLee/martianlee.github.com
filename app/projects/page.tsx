import ProjectsView from '@/components/projects/ProjectsView'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function Projects() {
  return <ProjectsView />
}
