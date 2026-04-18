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
    <>
      <div className="space-y-10 pt-6 pb-16">
        <div className="border-b border-gray-200 pb-8 dark:border-gray-700">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Projects
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-gray-600 dark:text-gray-300">
            Personal projects and side projects I've built
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="border border-teal-200 px-4 py-1 text-sm font-semibold text-teal-700 dark:border-teal-500/40 dark:text-teal-300">
              Non-Games {nonGameProjects.length}
            </span>
            <span className="border border-orange-200 px-4 py-1 text-sm font-semibold text-orange-700 dark:border-orange-500/40 dark:text-orange-300">
              Games {gameProjects.length}
            </span>
          </div>
        </div>

        <div className="space-y-12">
          <section className="border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase dark:text-teal-300">
                  Non-Game Projects
                </p>
                <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Tools, Apps, and Utilities
                </h2>
              </div>
              <span className="w-fit border border-teal-200 px-3 py-1 text-sm font-semibold text-teal-700 dark:border-teal-500/40 dark:text-teal-300">
                {nonGameProjects.length} items
              </span>
            </div>
            <div className="-m-4 flex flex-wrap">{renderCards(nonGameProjects)}</div>
          </section>

          <section className="border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-wide text-orange-700 uppercase dark:text-orange-300">
                  Game Projects
                </p>
                <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Playable Prototypes and Builds
                </h2>
              </div>
              <span className="w-fit border border-orange-200 px-3 py-1 text-sm font-semibold text-orange-700 dark:border-orange-500/40 dark:text-orange-300">
                {gameProjects.length} items
              </span>
            </div>
            <div className="-m-4 flex flex-wrap">{renderCards(gameProjects)}</div>
          </section>
        </div>
      </div>
    </>
  )
}
