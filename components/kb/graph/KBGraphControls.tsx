'use client'

import { useEffect, useRef } from 'react'
import { useKBGraph } from './KBGraphContext'
import { STAGE_ICON, sortTopics, topicColor } from './topicColors'

const STAGE_ORDER = ['seedling', 'budding', 'evergreen']

export default function KBGraphControls() {
  const g = useKBGraph()
  const inputRef = useRef<HTMLInputElement>(null)

  // "/" focuses the filter box (Cmd+K already opens the KB search palette).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.closest('input, textarea, [contenteditable="true"]')
      if (e.key === '/' && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const topics = sortTopics(g.data.topics)
  const stages = STAGE_ORDER.filter((s) => g.data.postIndex.some((p) => p.stage === s))

  const toggleTopic = (id: string) => {
    const next = new Set(g.filters.topics)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    g.setFilters({ ...g.filters, topics: next })
  }

  const chip = (active: boolean) =>
    `inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] whitespace-nowrap transition-colors ${
      active
        ? 'bg-[var(--kb-accent)] text-black'
        : 'bg-[var(--kb-surface-alt)] hover:bg-[var(--kb-accent-dim)]'
    }`

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-1.5 px-3 py-2 text-xs"
      style={{ borderBottom: '1px solid var(--kb-border)', color: 'var(--kb-text)' }}
    >
      <label
        className="flex h-6 min-w-[260px] items-center gap-1.5 rounded border px-2"
        style={{ borderColor: 'var(--kb-border)', background: 'var(--kb-surface)' }}
      >
        <span className="sr-only">Highlight notes</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M11.7 10.3a6 6 0 1 0-1.4 1.4l3.2 3.2 1.4-1.4-3.2-3.2zM6.5 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={g.query}
          onChange={(e) => g.setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && g.query) {
              e.stopPropagation()
              g.setQuery('')
            }
          }}
          placeholder="Highlight notes… (title, tag, slug)"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
          style={{ color: 'var(--kb-text-strong)' }}
        />
        <kbd
          aria-hidden="true"
          className="rounded border px-1 text-[10px]"
          style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}
        >
          /
        </kbd>
      </label>

      <span className="mx-0.5 h-4 w-px" style={{ background: 'var(--kb-border)' }} />

      {topics.map((t) => {
        const active = g.filters.topics.has(t.id)
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggleTopic(t.id)}
            className={chip(active)}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: topicColor(t.id),
                boxShadow: active ? '0 0 0 1.5px #fff' : undefined,
              }}
            />
            {t.label}
            <span
              className={active ? 'text-black/70' : ''}
              style={active ? undefined : { color: 'var(--kb-text-muted)' }}
            >
              {t.count}
            </span>
          </button>
        )
      })}

      <span className="mx-0.5 h-4 w-px" style={{ background: 'var(--kb-border)' }} />

      <div
        role="group"
        aria-label="Stage"
        className="inline-flex h-6 overflow-hidden rounded border"
        style={{ borderColor: 'var(--kb-border)', background: 'var(--kb-surface)' }}
      >
        {['all', ...stages].map((s, i) => {
          const active = g.filters.stage === s
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => g.setFilters({ ...g.filters, stage: s })}
              className={`px-2 text-[11px] ${i > 0 ? 'border-l' : ''} ${
                active ? 'bg-[var(--kb-accent-dim)] text-[var(--kb-accent)]' : ''
              }`}
              style={{
                borderColor: 'var(--kb-border)',
                color: active ? undefined : 'var(--kb-text-muted)',
              }}
            >
              {s === 'all' ? 'All' : `${STAGE_ICON[s]} ${s[0].toUpperCase()}${s.slice(1)}`}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        aria-pressed={g.filters.tags}
        onClick={() => g.setFilters({ ...g.filters, tags: !g.filters.tags })}
        className="inline-flex h-6 items-center gap-1.5 text-[11px]"
      >
        <span
          className="relative h-3.5 w-[26px] rounded-full transition-colors"
          style={{ background: g.filters.tags ? 'var(--kb-accent)' : 'var(--kb-border)' }}
        >
          <span
            className="absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full transition-transform"
            style={{
              background: 'var(--kb-surface)',
              transform: g.filters.tags ? 'translateX(12px)' : undefined,
            }}
          />
        </span>
        Tags
      </button>

      <div
        className="ml-auto hidden items-center gap-3 text-[10.5px] lg:flex"
        style={{ color: 'var(--kb-text-muted)' }}
      >
        <span className="inline-flex items-center gap-1">
          <svg width="26" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="26" y2="4" stroke="var(--kb-graph-edge)" strokeWidth="1.2" />
          </svg>
          link
        </span>
        <span className="inline-flex items-center gap-1">
          <svg width="26" height="8" aria-hidden="true">
            <line
              x1="0"
              y1="4"
              x2="26"
              y2="4"
              stroke="var(--kb-graph-edge)"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              opacity="0.7"
            />
          </svg>
          shared tag
        </span>
        <span className="inline-flex items-center gap-1">
          <svg width="10" height="8" aria-hidden="true">
            <circle
              cx="5"
              cy="4"
              r="3.2"
              fill="var(--kb-surface)"
              stroke="var(--kb-graph-edge)"
              strokeWidth="1.2"
            />
          </svg>
          tag node
        </span>
      </div>
    </div>
  )
}
