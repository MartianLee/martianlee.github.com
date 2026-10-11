'use client'

import { useRef } from 'react'
import Link from '@/components/Link'
import ProjectRow from '@/components/projects/ProjectRow'
import projectsData from '@/data/projectsData'
import { useUI } from '@/components/useUI'
import { usePointerSun } from '@/components/hooks/usePointerSun'
import { useSettleOnView } from '@/components/hooks/useSettleOnView'

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
          <ProjectRow key={p.slug} p={p} />
        ))}
      </ul>
    </section>
  )
}
