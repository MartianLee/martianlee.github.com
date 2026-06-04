'use client'

import projectsData, { type Project } from '@/data/projectsData'
import Card from '@/components/Card'
import { useUI } from '@/components/useUI'

export default function ProjectsView() {
  const ui = useUI()
  const gameProjects = projectsData.filter((project) => project.category === 'game')
  const nonGameProjects = projectsData.filter((project) => project.category === 'non-game')

  const renderCards = (items: Project[]) =>
    items.map((d) => (
      <Card
        key={d.slug}
        title={d.title}
        description={d.description}
        descriptionKo={d.descriptionKo}
        slug={d.slug}
        kind={d.kind}
        kindKo={d.kindKo}
        imgSrc={d.imgSrc}
        techStack={d.techStack}
      />
    ))

  return (
    <div className="pt-6 pb-16">
      <p className="eyebrow mb-4">{ui.projectsPage.eyebrow}</p>
      <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{ui.projectsPage.title}</h1>

      <div className="mt-12 space-y-12">
        <section>
          <div className="sec-head">
            <span className="sec-num">01</span>
            <span>{ui.projectsPage.apps}</span>
          </div>
          <div>{renderCards(nonGameProjects)}</div>
        </section>

        <section>
          <div className="sec-head">
            <span className="sec-num">02</span>
            <span>{ui.projectsPage.games}</span>
          </div>
          <div>{renderCards(gameProjects)}</div>
        </section>
      </div>
    </div>
  )
}
