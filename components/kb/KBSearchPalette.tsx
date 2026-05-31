'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import kbData from 'app/kb-data.json'
import type { KBData, KBPostEntry } from '@/components/kb/types'

const data = kbData as KBData

const STAGE_ICON: Record<string, string> = {
  seedling: '\u{1F331}',
  budding: '\u{1F33F}',
  evergreen: '\u{1F333}',
}

const TOPIC_LABEL: Record<string, string> = Object.fromEntries(
  data.topics.map((t) => [t.id, t.label])
)

const RECENT_LIMIT = 8
const RESULT_LIMIT = 50

interface ScoredNote {
  note: KBPostEntry
  score: number
}

/** Rank notes against a query. All whitespace-separated tokens must match (AND). */
function searchNotes(query: string): KBPostEntry[] {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  const scored: ScoredNote[] = []
  for (const note of data.postIndex) {
    const title = note.title.toLowerCase()
    const summary = (note.summary || '').toLowerCase()
    const tags = (note.tags || []).join(' ').toLowerCase()
    const topic = (TOPIC_LABEL[note.topic] || note.topic).toLowerCase()

    let score = 0
    let matchedAll = true
    for (const token of tokens) {
      if (title.includes(token)) score += 4
      else if (tags.includes(token)) score += 3
      else if (summary.includes(token) || topic.includes(token)) score += 1
      else {
        matchedAll = false
        break
      }
    }
    if (matchedAll) scored.push({ note, score })
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.note.date).getTime() - new Date(a.note.date).getTime()
  })

  return scored.slice(0, RESULT_LIMIT).map((s) => s.note)
}

const recentNotes: KBPostEntry[] = [...data.postIndex]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, RECENT_LIMIT)

export default function KBSearchPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => (query.trim() ? searchNotes(query) : recentNotes), [query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelected(0)
  }, [])

  // Global Cmd+K / Ctrl+K interception (capture phase, beats global kbar)
  // plus a custom event so the status bar can open the palette.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        e.stopImmediatePropagation()
        setOpen((prev) => !prev)
      }
    }
    const onOpenEvent = () => setOpen(true)

    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('kb:open-search', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('kb:open-search', onOpenEvent)
    }
  }, [])

  // Focus input and reset selection when opening; reset selection on query change.
  useEffect(() => {
    if (open) {
      setSelected(0)
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  // Keep the selected row in view.
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected, open])

  const go = useCallback(
    (note: KBPostEntry | undefined) => {
      if (!note) return
      close()
      router.push(`/kb/${note.slug}`)
    },
    [close, router]
  )

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(results[selected])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }

  if (!open) return null

  return (
    <div className="kb-theme fixed inset-0 z-[100] flex justify-center px-4 pt-[12vh] font-mono">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/60"
        onClick={close}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search KB notes"
        className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-lg shadow-2xl"
        style={{ background: 'var(--kb-surface)', border: '1px solid var(--kb-border)' }}
      >
        {/* Input row */}
        <div
          className="flex shrink-0 items-center gap-2 px-3"
          style={{ borderBottom: '1px solid var(--kb-border)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--kb-text-muted)" aria-hidden>
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search KB notes…"
            className="h-11 flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--kb-text-strong)' }}
            spellCheck={false}
            autoComplete="off"
          />
          <kbd
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px]"
            style={{ background: 'var(--kb-surface-alt)', color: 'var(--kb-text-muted)' }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto py-1">
          {results.length === 0 ? (
            <div
              className="px-3 py-6 text-center text-xs"
              style={{ color: 'var(--kb-text-muted)' }}
            >
              No notes found
            </div>
          ) : (
            <>
              {!query.trim() && (
                <div
                  className="px-3 pt-1 pb-1 text-[10px] font-semibold tracking-wider uppercase"
                  style={{ color: 'var(--kb-text-muted)' }}
                >
                  Recent
                </div>
              )}
              {results.map((note, i) => {
                const isActive = i === selected
                const backlinkCount = data.backlinks[note.slug]?.length || 0
                return (
                  <button
                    key={note.slug}
                    data-index={i}
                    onMouseMove={() => setSelected(i)}
                    onClick={() => go(note)}
                    className="flex w-full items-start gap-2.5 px-3 py-2 text-left"
                    style={{
                      background: isActive ? 'var(--kb-accent-dim)' : 'transparent',
                    }}
                  >
                    <span className="mt-0.5 shrink-0 text-xs">
                      {STAGE_ICON[note.stage] || '\u{1F33F}'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-[13px]"
                        style={{ color: isActive ? 'var(--kb-accent)' : 'var(--kb-text-strong)' }}
                      >
                        {note.title}
                      </div>
                      <div
                        className="mt-0.5 flex items-center gap-2 text-[10px]"
                        style={{ color: 'var(--kb-text-muted)' }}
                      >
                        <span>{TOPIC_LABEL[note.topic] || note.topic}</span>
                        {backlinkCount > 0 && (
                          <>
                            <span>&middot;</span>
                            <span>
                              {backlinkCount} backlink{backlinkCount > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div
          className="flex shrink-0 items-center gap-3 px-3 py-1.5 text-[10px]"
          style={{ borderTop: '1px solid var(--kb-border)', color: 'var(--kb-text-muted)' }}
        >
          <span>&uarr;&darr; navigate</span>
          <span>&crarr; open</span>
          <span>esc close</span>
          <span className="ml-auto tabular-nums">{results.length} notes</span>
        </div>
      </div>
    </div>
  )
}
