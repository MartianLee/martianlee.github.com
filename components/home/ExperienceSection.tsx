'use client'

import { useRef } from 'react'
import siteMetadata from '@/data/siteMetadata'
import careerData from '@/data/careerData'
import TenureChart from '@/components/TenureChart'
import { useUI } from '@/components/useUI'
import { useSettleOnView } from '@/components/hooks/useSettleOnView'

export default function ExperienceSection({ initialYear }: { initialYear: number }) {
  const ui = useUI()
  const titleRef = useRef<HTMLHeadingElement>(null)
  useSettleOnView(titleRef)
  return (
    <section className="rh-sec" aria-labelledby="exp-h">
      <div className="rh-sec-head">
        <span className="rh-sec-no">03</span>
        <h2 id="exp-h" ref={titleRef}>
          {ui.home.experience}
        </h2>
        <a className="rh-sec-link" href={siteMetadata.linkedin}>
          {ui.cv}
        </a>
      </div>
      <TenureChart roles={careerData} initialYear={initialYear} />
    </section>
  )
}
