import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'
import Link from '@/components/Link'
import HorizonBand from '@/components/HorizonBand'
import TagCountTele from '@/components/TagCountTele'

export const metadata = genPageMetadata({ title: 'Tags', description: 'Things I blog about' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  return (
    <div className="rh-page">
      <HorizonBand title="Tags" titleKo="태그" tele={<TagCountTele count={sortedTags.length} />} />
      <div className="rh-wrap">
        <ul className="rh-tagcloud">
          {sortedTags.map((t) => (
            <li key={t}>
              <Link
                href={`/tags/${slug(t)}`}
                className="rh-tagchip"
                aria-label={`View posts tagged ${t}`}
              >
                {t.split(' ').join('-')}
                <span>{tagCounts[t]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
