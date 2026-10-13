import type { Metadata } from 'next'
import NotFoundView from '@/components/NotFoundView'

// REF's title for the page; absolute keeps the layout's "%s | site name" template off it
export const metadata: Metadata = { title: { absolute: 'Signal lost · MartianLee' } }

export default function NotFound() {
  return <NotFoundView />
}
