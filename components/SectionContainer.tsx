import { ReactNode } from 'react'

export default function SectionContainer({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-[1100px] px-5 sm:px-8 xl:px-0">{children}</section>
}
