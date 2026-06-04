import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import projectsData from '@/data/projectsData'
import Image from '@/components/Image'
import Link from '@/components/Link'
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

  const { title, kind, category, description, imgSrc, techStack, workflow, aiTools, demo, github } =
    project

  return (
    <div className="pt-6 pb-16">
      <Link href="/projects" className="text-muted hover:text-accent font-mono text-xs">
        ← Projects
      </Link>

      <div className="mt-7 flex flex-wrap items-center gap-2.5">
        <span className="chip">{kind}</span>
        <span className="text-muted font-mono text-[11px] tracking-wide uppercase">
          {category === 'game' ? 'Game' : 'App / Tool'}
        </span>
      </div>

      <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{title}</h1>
      <p className="text-muted mt-4 max-w-[60ch] font-serif text-xl leading-snug">{description}</p>

      <div className="mt-7 flex flex-wrap gap-3 font-mono text-sm">
        {demo && (
          <a href={demo} className="ghost-btn">
            Live Demo ↗
          </a>
        )}
        {github && (
          <a href={github} className="ghost-btn">
            GitHub ↗
          </a>
        )}
      </div>

      {imgSrc && (
        <div className="border-line bg-surface mt-10 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border">
          <Image
            src={imgSrc}
            alt={title}
            width={1100}
            height={620}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div className="mt-12 grid gap-10 sm:grid-cols-3">
        {techStack && techStack.length > 0 && (
          <div>
            <div className="sec-num mb-3">Tech stack</div>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        {workflow && workflow.length > 0 && (
          <div>
            <div className="sec-num mb-3">Workflow</div>
            <ul className="text-muted space-y-1.5 font-serif text-sm">
              {workflow.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        {aiTools && aiTools.length > 0 && (
          <div>
            <div className="sec-num mb-3">Built with AI</div>
            <ul className="text-muted space-y-1.5 font-serif text-sm">
              {aiTools.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
