import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Knowledge Base',
  description:
    "MartianLee's personal knowledge base — notes on architecture, web development, and AI infrastructure.",
})

export default function KBLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
