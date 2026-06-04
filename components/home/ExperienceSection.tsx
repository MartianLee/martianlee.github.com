import careerData from '@/data/careerData'

export default function ExperienceSection() {
  return (
    <section className="py-12">
      <div className="sec-head">
        <span className="sec-num">03 — Experience</span>
        <a href="/static/cv.pdf" className="text-accent font-mono text-xs">
          Download CV (PDF) ↗
        </a>
      </div>
      <div>
        {careerData.map((c) => (
          <div key={c.company} className="list-row">
            <div>
              <h3 className="text-xl font-bold">
                {c.company} <span className="text-muted text-base font-medium">— {c.role}</span>
              </h3>
              <p className="text-muted mt-1 font-serif text-base">
                {c.description}
                {c.techStack ? ` · ${c.techStack.join(' · ')}` : ''}
              </p>
            </div>
            <span className="text-muted shrink-0 pt-1 font-mono text-xs whitespace-nowrap">
              {c.period}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
