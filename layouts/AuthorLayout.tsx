import { ReactNode } from 'react'
import type { Authors } from '.contentlayer/generated'
import { CoreContent } from 'pliny/utils/contentlayer'
import careerData from '@/data/careerData'
import SocialIcon from '@/components/social-icons'

interface Props {
  children: ReactNode
  content: CoreContent<Authors>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, occupation, email, linkedin, github } = content
  return (
    <div className="pt-6">
      {occupation && <p className="eyebrow mb-4">{occupation}</p>}
      <h1 className="text-5xl font-bold tracking-[-0.03em] sm:text-6xl">{name}</h1>

      <div className="reading-measure mt-8">
        <div className="prose max-w-none">{children}</div>
      </div>

      <div className="mt-12">
        <div className="sec-head">
          <span className="sec-num">Experience</span>
          <a href="/static/cv.pdf" className="text-accent font-mono text-xs">
            Download CV (PDF) ↗
          </a>
        </div>
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

      <div className="border-ink mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 font-mono text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
          <span>Open to senior / staff engineering roles — globally.</span>
        </div>
        <div className="flex items-center gap-4">
          {email && <SocialIcon kind="mail" href={`mailto:${email}`} size={5} />}
          {github && <SocialIcon kind="github" href={github} size={5} />}
          {linkedin && <SocialIcon kind="linkedin" href={linkedin} size={5} />}
        </div>
      </div>
    </div>
  )
}
