'use client'

import { useState, useMemo } from 'react'
import Link from '@/components/Link'
import kbData from 'app/kb-data.json'
import type { KBData, KBPostEntry } from '@/components/kb/types'

const data = kbData as KBData

const STAGE_ICON: Record<string, string> = {
  seedling: '\u{1F331}',
  budding: '\u{1F33F}',
  evergreen: '\u{1F333}',
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return '1d ago'
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export default function KBNoteList() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'connections'>('date')

  const filteredNotes = useMemo(() => {
    const notes: KBPostEntry[] = activeTopic
      ? data.postIndex.filter((p) => p.topic === activeTopic)
      : [...data.postIndex]

    if (sortBy === 'date') {
      notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else {
      notes.sort(
        (a, b) => (data.backlinks[b.slug]?.length || 0) - (data.backlinks[a.slug]?.length || 0)
      )
    }
    return notes
  }, [activeTopic, sortBy])

  return (
    <div className="flex h-full flex-col" style={{ color: 'var(--kb-text)' }}>
      {/* Header */}
      <div
        className="shrink-0 px-6 pt-6 pb-4"
        style={{ borderBottom: '1px solid var(--kb-border)' }}
      >
        <h1
          className="mb-4 text-2xl font-normal tracking-tight"
          style={{ color: 'var(--kb-text-strong)', fontFamily: 'var(--font-family-serif)' }}
        >
          Knowledge Base
        </h1>

        {/* Topic Filter Chips */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTopic(null)}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              activeTopic === null
                ? 'bg-[var(--kb-accent)] text-black'
                : 'bg-[var(--kb-surface-alt)] hover:bg-[var(--kb-accent-dim)]'
            }`}
          >
            All ({data.postIndex.length})
          </button>
          {[...data.topics]
            .sort((a, b) => {
              if (a.label === 'AI Infrastructure') return -1
              if (b.label === 'AI Infrastructure') return 1
              return 0
            })
            .map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id === activeTopic ? null : t.id)}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  activeTopic === t.id
                    ? 'bg-[var(--kb-accent)] text-black'
                    : 'bg-[var(--kb-surface-alt)] hover:bg-[var(--kb-accent-dim)]'
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
        </div>

        {/* Sort Controls */}
        <div
          className="flex items-center gap-3 text-[11px]"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          <span>Sort:</span>
          <button
            onClick={() => setSortBy('date')}
            className={
              sortBy === 'date' ? 'text-[var(--kb-accent)]' : 'hover:text-[var(--kb-text)]'
            }
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('connections')}
            className={
              sortBy === 'connections' ? 'text-[var(--kb-accent)]' : 'hover:text-[var(--kb-text)]'
            }
          >
            Most Connected
          </button>
          <span className="ml-auto">{filteredNotes.length} notes</span>
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.map((note) => {
          const backlinkCount = data.backlinks[note.slug]?.length || 0
          return (
            <Link
              key={note.slug}
              href={`/kb/${note.slug}`}
              className="group flex items-start gap-3 border-b px-6 py-3 transition-colors hover:bg-[var(--kb-accent-dim)]"
              style={{ borderColor: 'var(--kb-border)' }}
            >
              <span className="mt-0.5 shrink-0 text-sm">
                {STAGE_ICON[note.stage] || '\u{1F33F}'}
              </span>
              <div className="min-w-0 flex-1">
                <span
                  className="line-clamp-2 font-medium group-hover:text-[var(--kb-accent)]"
                  style={{ color: 'var(--kb-text-strong)' }}
                >
                  {note.title}
                </span>
                {note.summary && (
                  <p
                    className="mt-0.5 line-clamp-1 text-[11px]"
                    style={{ color: 'var(--kb-text-muted)' }}
                  >
                    {note.summary}
                  </p>
                )}
                <div
                  className="mt-1 flex items-center gap-2 text-[10px]"
                  style={{ color: 'var(--kb-text-muted)' }}
                >
                  <span>{relativeDate(note.date)}</span>
                  {backlinkCount > 0 && (
                    <>
                      <span>&middot;</span>
                      <span>
                        {backlinkCount} backlink{backlinkCount > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                  {note.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-1 py-px"
                      style={{ background: 'var(--kb-surface-alt)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
