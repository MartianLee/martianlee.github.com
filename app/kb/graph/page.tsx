import { genPageMetadata } from 'app/seo'
import KBGraphView from '@/components/kb/graph/KBGraphView'

export const metadata = genPageMetadata({
  title: 'Knowledge Graph',
  description:
    "Graph view of MartianLee's knowledge base — every note, its links, and shared tags in one picture.",
  robots: {
    index: false,
    follow: true,
  },
})

export default function KBGraphPage() {
  return <KBGraphView />
}
