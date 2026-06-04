'use client'

import Link from '@/components/Link'
import Card from '@/components/Card'
import projectsData from '@/data/projectsData'
import { useUI } from '@/components/useUI'

export default function ProjectsSection() {
  const ui = useUI()
  const featured = projectsData.filter((p) => p.featured).slice(0, 4)
  return (
    <section id="projects" className="py-12">
      <div className="sec-head">
        <span className="sec-num">{ui.sections.projects}</span>
        <Link href="/projects" className="text-muted hover:text-accent font-mono text-xs">
          {ui.sections.allProjects}
        </Link>
      </div>
      <div>
        {featured.map((p) => (
          <Card
            key={p.slug}
            title={p.title}
            description={p.description}
            descriptionKo={p.descriptionKo}
            slug={p.slug}
            kind={p.kind}
            kindKo={p.kindKo}
            imgSrc={p.imgSrc}
            techStack={p.techStack}
          />
        ))}
      </div>
    </section>
  )
}
