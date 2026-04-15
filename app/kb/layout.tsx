import { genPageMetadata } from 'app/seo'
import KBBodyClass from './KBBodyClass'

export const metadata = genPageMetadata({
  title: 'Knowledge Base',
  description:
    "MartianLee's personal knowledge base — notes on architecture, web development, and AI infrastructure.",
})

export default function KBLayout({ children }: { children: React.ReactNode }) {
  return <KBBodyClass>{children}</KBBodyClass>
}
