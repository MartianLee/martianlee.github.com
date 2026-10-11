'use client'

import { useRef } from 'react'
import HorizonBand from '@/components/HorizonBand'
import ProjectRow from '@/components/projects/ProjectRow'
import projectsData from '@/data/projectsData'
import { useUI } from '@/components/useUI'
import { usePointerSun } from '@/components/hooks/usePointerSun'
import { fill } from '@/lib/ui-strings'

export default function ProjectsView() {
  const ui = useUI()
  const pageRef = useRef<HTMLDivElement>(null)
  // The pointer is the Sun for every planet on the page (REF window-level listener): one hook on the page wrapper.
  usePointerSun(pageRef)
  const apps = projectsData.filter((p) => p.category === 'non-game')
  const games = projectsData.filter((p) => p.category === 'game')
  const groups = [
    { id: 'g-apps', no: '01', title: ui.projectsPage.apps, items: apps },
    { id: 'g-games', no: '02', title: ui.projectsPage.games, items: games },
  ]

  return (
    <div className="rh-page" ref={pageRef}>
      <HorizonBand
        title="Projects"
        titleKo="프로젝트"
        tele={
          <>
            <span>{ui.band.sideProjects}</span>
            <span className="rh-sep" aria-hidden="true">
              ·
            </span>
            <span>{fill(ui.band.projectCount, { n: projectsData.length })}</span>
            <span className="rh-sep" aria-hidden="true">
              ·
            </span>
            <span>{fill(ui.band.appsCount, { n: apps.length })}</span>
            <span className="rh-sep" aria-hidden="true">
              ·
            </span>
            <span>{fill(ui.band.gamesCount, { n: games.length })}</span>
          </>
        }
      />
      <div className="rh-wrap">
        <p className="rh-lede">{ui.projectsPage.intro}</p>
        <p className="rh-sun-hint">
          <i aria-hidden="true" />
          {ui.projectsPage.sunHint}
        </p>
        {groups.map((g) => (
          <section key={g.id} className="rh-sec" aria-labelledby={g.id}>
            <div className="rh-sec-head">
              <span className="rh-sec-no">{g.no}</span>
              <h2 id={g.id}>{g.title}</h2>
              <span className="rh-sec-count">
                {fill(ui.band.projectCount, { n: g.items.length })}
              </span>
            </div>
            <ul className="rh-proj">
              {g.items.map((p) => (
                <ProjectRow key={p.slug} p={p} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
