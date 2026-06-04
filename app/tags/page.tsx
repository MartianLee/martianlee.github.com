import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'
import Link from '@/components/Link'

export const metadata = genPageMetadata({ title: 'Tags', description: 'Things I blog about' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  return (
    <div>
      <div className="pt-2 pb-8">
        <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">Tags</h1>
      </div>
      {tagKeys.length === 0 && <p className="text-muted font-mono text-sm">No tags found.</p>}
      <div className="flex flex-wrap gap-2">
        {sortedTags.map((t) => (
          <Link
            key={t}
            href={`/tags/${slug(t)}`}
            className="chip hover:border-accent hover:text-accent transition-colors"
            aria-label={`View posts tagged ${t}`}
          >
            {t.split(' ').join('-')}
            <span className="text-muted ml-1.5 font-mono text-[10px]">{tagCounts[t]}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
