import Link from '@/components/Link'
import projectsData from '@/data/projectsData'

export default function ProjectsSection() {
  const featured = projectsData.filter((p) => p.featured).slice(0, 4)
  return (
    <section id="projects" className="py-12">
      <div className="sec-head">
        <span className="sec-num">01 — Projects</span>
        <Link href="/projects" className="text-muted hover:text-accent font-mono text-xs">
          All projects →
        </Link>
      </div>
      <div>
        {featured.map((p) => {
          const link = p.demo || p.github || p.href
          return (
            <div key={p.title} className="list-row">
              <div>
                <h3 className="text-xl font-bold">
                  {link ? (
                    <Link href={link} className="hover:text-accent transition-colors">
                      {p.title}
                    </Link>
                  ) : (
                    p.title
                  )}
                </h3>
                <p className="text-muted mt-1 font-serif text-base">{p.description}</p>
              </div>
              {p.techStack && (
                <span className="text-muted shrink-0 pt-1 font-mono text-xs whitespace-nowrap">
                  {p.techStack.slice(0, 3).join(' · ')} →
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
