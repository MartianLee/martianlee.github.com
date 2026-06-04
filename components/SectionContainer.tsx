import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return <section className="mx-auto max-w-[1100px] px-5 sm:px-8 xl:px-0">{children}</section>
}
