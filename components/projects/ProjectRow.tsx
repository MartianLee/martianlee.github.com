'use client'

import Link from '@/components/Link'
import ProjectOrb from '@/components/ProjectOrb'
import { useLocalized } from '@/components/useUI'
import type { Project } from '@/data/projectsData'

/**
 * One project row: planet tile, name + kind chip, one-liner, first three stack items.
 * Shared by the home (ProjectsSection) and /projects; usePointerSun in the parent lights the planet inside it.
 */
export default function ProjectRow({ p }: { p: Project }) {
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
