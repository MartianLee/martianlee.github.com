'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import kbData from 'app/kb-data.json'
import type { KBData } from '@/components/kb/types'

const data = kbData as KBData

const STAGE_ICON: Record<string, string> = {
  seedling: '\u{1F331}',
  budding: '\u{1F33F}',
  evergreen: '\u{1F333}',
}

const TOPIC_ICON: Record<string, string> = {
  'llm-research': '\u{1F4DA}',
  'ai-infrastructure': '\u{1F916}',
  'web-frontend': '\u{1F310}',
  backend: '\u{2699}\u{FE0F}',
  'devops-cloud': '\u{2601}\u{FE0F}',
  'dev-life': '\u{1F4DD}',
  algorithms: '\u{1F9E9}',
  uncategorized: '\u{1F4C1}',
}

const TOPIC_PRIORITY: Record<string, number> = {
  'llm-research': 0,
  'ai-infrastructure': 1,
}

interface KBSidebarProps {
  activeSlug?: string
}

export default function KBSidebar({ activeSlug }: KBSidebarProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(() => {
    if (activeSlug) {
      const activePost = data.postIndex.find((p) => p.slug === activeSlug)
      if (activePost) return new Set([activePost.topic])
    }
    return new Set()
  })

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }

  const getNotesForTopic = (topicId: string) =>
    data.postIndex
      .filter((p) => p.topic === topicId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex h-full flex-col text-xs" style={{ color: 'var(--kb-text)' }}>
      {/* Section Label */}
      <div
        className="flex h-8 items-center px-3 text-[10px] font-semibold tracking-wider uppercase"
        style={{ color: 'var(--kb-text-muted)' }}
      >
        Explorer
      </div>

      {/* Topic Tree */}
      <nav className="flex-1 overflow-y-auto">
        {[...data.topics]
          .sort((a, b) => {
            const pa = TOPIC_PRIORITY[a.id] ?? 99
            const pb = TOPIC_PRIORITY[b.id] ?? 99
            if (pa !== pb) return pa - pb
            return a.label.localeCompare(b.label)
          })
          .map((topic) => {
            const isExpanded = expandedTopics.has(topic.id)
            const notes = getNotesForTopic(topic.id)
            return (
              <div key={topic.id}>
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="flex w-full items-center gap-1 px-2 py-1.5 text-left transition-colors hover:bg-[var(--kb-accent-dim)]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className={`shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  >
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                  <span className="shrink-0">{TOPIC_ICON[topic.id] || '\u{1F4C1}'}</span>
                  <span
                    className="truncate text-[13px] font-medium"
                    style={{ color: 'var(--kb-text-strong)' }}
                  >
                    {topic.label}
                  </span>
                  <span
                    className="ml-auto shrink-0 tabular-nums"
                    style={{ color: 'var(--kb-text-muted)' }}
                  >
                    {topic.count}
                  </span>
                </button>
                {isExpanded && (
                  <div className="ml-3">
                    {notes.map((note) => {
                      const isActive = note.slug === activeSlug
                      return (
                        <Link
                          key={note.slug}
                          href={`/kb/${note.slug}`}
                          className={`flex items-center gap-1.5 py-1 pr-2 pl-3 text-[12.5px] transition-colors ${
                            isActive
                              ? 'bg-[var(--kb-accent-dim)] text-[var(--kb-accent)]'
                              : 'hover:bg-[var(--kb-accent-dim)]'
                          }`}
                          title={note.title}
                        >
                          <span className="shrink-0 text-[10px]">
                            {STAGE_ICON[note.stage] || '\u{1F33F}'}
                          </span>
                          <span className="truncate">{note.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
      </nav>

      {/* Stats Footer */}
      <div
        className="flex items-center gap-2 px-3 py-2 text-[10px]"
        style={{
          borderTop: '1px solid var(--kb-border)',
          color: 'var(--kb-text-muted)',
        }}
      >
        <span>{data.postIndex.length} notes</span>
        <span>&middot;</span>
        <span>{data.topics.length} topics</span>
      </div>
    </div>
  )
}
