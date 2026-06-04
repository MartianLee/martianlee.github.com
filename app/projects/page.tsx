import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function Projects() {
  const gameProjects = projectsData.filter((project) => project.category === 'game')
  const nonGameProjects = projectsData.filter((project) => project.category === 'non-game')

  const renderCards = (items: (typeof projectsData)[number][]) =>
    items.map((d) => (
      <Card
        key={d.title}
        title={d.title}
        description={d.description}
        imgSrc={d.imgSrc}
        href={d.href}
        techStack={d.techStack}
        workflow={d.workflow}
        aiTools={d.aiTools}
        demo={d.demo}
        github={d.github}
      />
    ))

  return (
    <div className="pt-6 pb-16">
      <p className="eyebrow mb-4">Side projects</p>
      <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">Things I've built</h1>

      <div className="mt-12 space-y-12">
        <section>
          <div className="sec-head">
            <span className="sec-num">01</span>
            <span>Apps &amp; tools</span>
          </div>
          <div>{renderCards(nonGameProjects)}</div>
        </section>

        <section>
          <div className="sec-head">
            <span className="sec-num">02</span>
            <span>Games</span>
          </div>
          <div>{renderCards(gameProjects)}</div>
        </section>
      </div>
    </div>
  )
}
