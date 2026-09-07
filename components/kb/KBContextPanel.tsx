'use client'

import Link from '@/components/Link'
import kbData from 'app/kb-data.json'
import type { KBData, KBBacklink, KBPostEntry } from '@/components/kb/types'
import { relatedUnlinked } from '@/components/kb/graph/graphModel'

const data = kbData as KBData

interface KBContextPanelProps {
  slug: string
  toc?: { value: string; url: string; depth: number }[]
}

export default function KBContextPanel({ slug, toc }: KBContextPanelProps) {
  const noteBacklinks: KBBacklink[] = data.backlinks[slug] || []
  const noteForwardLinks: KBPostEntry[] = (data.forwardLinks[slug] || [])
    .map((s) => data.postIndex.find((p) => p.slug === s))
    .filter((p): p is KBPostEntry => Boolean(p))

  const note = data.postIndex.find((p) => p.slug === slug)
  const related = relatedUnlinked(data, slug)

  return (
    <div className="flex h-full flex-col text-xs" style={{ color: 'var(--kb-text-strong)' }}>
      {/* TOC */}
      {toc && toc.length > 0 && (
        <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
          <h3
            className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
            style={{ color: 'var(--kb-text-muted)' }}
          >
            Outline
          </h3>
          <nav className="space-y-0.5">
            {toc.map((item) => (
              <a
                key={item.url}
                href={item.url}
                className="block truncate py-0.5 transition-colors hover:text-[var(--kb-accent)]"
                style={{ paddingLeft: `${(item.depth - 1) * 12}px` }}
              >
                {item.value}
              </a>
            ))}
          </nav>
        </section>
      )}

      {/* Backlinks */}
      <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
        <h3
          className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          Backlinks ({noteBacklinks.length})
        </h3>
        {noteBacklinks.length === 0 ? (
          <p className="italic" style={{ color: 'var(--kb-text-muted)' }}>
            No notes link here yet.
          </p>
        ) : (
          <div className="space-y-1">
            {noteBacklinks.map((bl) => (
              <Link
                key={bl.slug}
                href={`/kb/${bl.slug}`}
                className="block rounded px-1.5 py-1 font-medium transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
              >
                {bl.title}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Forward Links */}
      {noteForwardLinks.length > 0 && (
        <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
          <h3
            className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
            style={{ color: 'var(--kb-text-muted)' }}
          >
            Links To ({noteForwardLinks.length})
          </h3>
          <div className="space-y-1">
            {noteForwardLinks.map((n) => (
              <Link
                key={n.slug}
                href={`/kb/${n.slug}`}
                className="block rounded px-1.5 py-1 font-medium transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
              >
                {n.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related, not linked */}
      <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
        <h3
          className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          {`Related, not linked (${related.length})`}
        </h3>
        {related.length === 0 ? (
          <p className="italic" style={{ color: 'var(--kb-text-muted)' }}>
            No unlinked note shares 2+ tags.
          </p>
        ) : (
          <div className="space-y-1">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/kb/${r.slug}`}
                className="block rounded px-1.5 py-1 transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
              >
                <span className="block truncate font-medium">{r.title}</span>
                <span className="block truncate text-[10px]" style={{ color: 'var(--kb-accent)' }}>
                  {r.sharedTags.slice(0, 2).join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        )}
        <p className="mt-2 text-[10px] leading-snug" style={{ color: 'var(--kb-text-muted)' }}>
          Shares two or more tags with this note but is not linked either way.
        </p>
      </section>

      {/* Properties */}
      {note && (
        <section className="px-3 py-3">
          <h3
            className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
            style={{ color: 'var(--kb-text-muted)' }}
          >
            Properties
          </h3>
          <div className="space-y-1.5" style={{ color: 'var(--kb-text)' }}>
            <div className="flex justify-between">
              <span>Topic</span>
              <span style={{ color: 'var(--kb-text)' }}>{note.topic}</span>
            </div>
            <div className="flex justify-between">
              <span>Stage</span>
              <span style={{ color: 'var(--kb-text)' }}>{note.stage}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span style={{ color: 'var(--kb-text)' }}>
                {new Date(note.date).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tags</span>
              <span
                className="max-w-[120px] truncate text-right"
                style={{ color: 'var(--kb-text)' }}
              >
                {note.tags?.join(', ') || 'none'}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
