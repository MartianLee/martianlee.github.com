'use client'

import { useRef } from 'react'
import Link from '@/components/Link'
import ProjectOrb from '@/components/ProjectOrb'
import projectsData from '@/data/projectsData'
import { useUI, useLocalized } from '@/components/useUI'
import { usePointerSun } from '@/components/hooks/usePointerSun'
import { useSettleOnView } from '@/components/hooks/useSettleOnView'
import type { Project } from '@/data/projectsData'

function Row({ p }: { p: Project }) {
  const summary = useLocalized(p.summary, p.summaryKo)
  const kind = useLocalized(p.kind, p.kindKo)
  return (
    <li>
      <Link href={`/projects/${p.slug}`} className="rh-proj-row">
        <ProjectOrb orb={p.orb} glow />
        <span className="rh-proj-main">
          <span className="rh-proj-title">
            {p.title} <span className="rh-chip">{kind}</span>
          </span>
          <span className="rh-proj-desc">{summary}</span>
        </span>
        <span className="rh-proj-stack">{(p.techStack ?? []).slice(0, 3).join(' · ')} →</span>
      </Link>
    </li>
  )
}

export default function ProjectsSection() {
  const ui = useUI()
  const listRef = useRef<HTMLUListElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  usePointerSun(listRef)
  useSettleOnView(titleRef)
  const featured = projectsData.filter((p) => p.featured).slice(0, 4)
  return (
    <section className="rh-sec" id="projects" aria-labelledby="projects-h">
      <div className="rh-sec-head">
        <span className="rh-sec-no">01</span>
        <h2 id="projects-h" ref={titleRef}>
          {ui.home.projects}
        </h2>
        <Link className="rh-sec-link" href="/projects">
          {ui.sections.allProjects}
        </Link>
      </div>
      <ul className="rh-proj" ref={listRef}>
        {featured.map((p) => (
          <Row key={p.slug} p={p} />
        ))}
      </ul>
    </section>
  )
}
