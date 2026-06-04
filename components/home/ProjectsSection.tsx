import Link from '@/components/Link'
import Card from '@/components/Card'
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
        {featured.map((p) => (
          <Card
            key={p.slug}
            title={p.title}
            description={p.description}
            slug={p.slug}
            kind={p.kind}
            imgSrc={p.imgSrc}
            techStack={p.techStack}
          />
        ))}
      </div>
    </section>
  )
}
