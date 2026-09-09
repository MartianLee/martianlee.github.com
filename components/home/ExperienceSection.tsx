'use client'

import siteMetadata from '@/data/siteMetadata'
import CareerList from '@/components/CareerList'
import { useUI } from '@/components/useUI'

export default function ExperienceSection() {
  const ui = useUI()
  return (
    <section className="py-12">
      <div className="sec-head">
        <span className="sec-num">{ui.sections.experience}</span>
        <a href={siteMetadata.linkedin} className="text-accent font-mono text-xs">
          {ui.cv}
        </a>
      </div>
      <CareerList />
    </section>
  )
}
