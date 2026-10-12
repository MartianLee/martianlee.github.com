import path from 'node:path'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { imageSize } from 'image-size'
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

/**
 * Intrinsic size of a screenshot in public/, read at build time so the figure keeps its aspect ratio
 * while the lazy image loads. Undefined (the component falls back to 16:9) when the file cannot be read.
 */
function readShotSize(imgSrc?: string): { width: number; height: number } | undefined {
  if (!imgSrc) return undefined
  try {
    const { width, height } = imageSize(path.join(process.cwd(), 'public', imgSrc))
    return width && height ? { width, height } : undefined
  } catch {
    return undefined
  }
}

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const project = projectsData.find((p) => p.slug === slug)
  if (!project) return notFound()

  return <ProjectDetail project={project} shot={readShotSize(project.imgSrc)} />
}
