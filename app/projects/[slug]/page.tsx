import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import projectsData from '@/data/projectsData'
import ProjectDetail from '@/components/projects/ProjectDetail'
import { genPageMetadata } from 'app/seo'

export const generateStaticParams = async () => projectsData.map((p) => ({ slug: p.slug }))

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const project = projectsData.find((p) => p.slug === slug)
  if (!project) return {}
  return genPageMetadata({ title: project.title, description: project.description })
}

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const project = projectsData.find((p) => p.slug === slug)
  if (!project) return notFound()

  return <ProjectDetail project={project} />
}
