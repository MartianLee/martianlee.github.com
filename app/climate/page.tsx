import { genPageMetadata } from 'app/seo'
import ClimateHero from '@/components/climate/ClimateHero'
import WhatIBuilt from '@/components/climate/WhatIBuilt'
import HowItWorked from '@/components/climate/HowItWorked'
import LearningSeries from '@/components/climate/LearningSeries'
import ClimateCTA from '@/components/climate/ClimateCTA'
import HorizonBand from '@/components/HorizonBand'
import SectionContainer from '@/components/SectionContainer'

export const metadata = genPageMetadata({
  title: 'Climate',
  description:
    'Earth Driven Developer. Carbon-measurement and offset products built solo as Founder/CTO of TomorrowUse, plus an upcoming learning series on carbon.',
})

export default function ClimatePage() {
  return (
    <>
      <HorizonBand variant="slim" />
      <SectionContainer>
        <ClimateHero />
        <WhatIBuilt />
        <HowItWorked />
        <LearningSeries />
        <ClimateCTA />
      </SectionContainer>
    </>
  )
}
