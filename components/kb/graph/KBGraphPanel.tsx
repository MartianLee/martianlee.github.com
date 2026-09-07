'use client'

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import Link from '@/components/Link'
import type { KBPostEntry } from '@/components/kb/types'
import { useKBGraph } from './KBGraphContext'
import { degreesOf, noteMatchesFilters, relatedUnlinked } from './graphModel'
import { STAGE_ICON, sortTopics, topicColor, topicLabel } from './topicColors'

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="mb-2 text-[10px] font-semibold tracking-wider uppercase"
      style={{ color: 'var(--kb-text-muted)' }}
    >
      {children}
    </h3>
  )
}

function Section({ children }: { children: ReactNode }) {
  return (
    <section className="border-b px-3 py-3" style={{ borderColor: 'var(--kb-border)' }}>
      {children}
    </section>
  )
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[10px] leading-snug" style={{ color: 'var(--kb-text-muted)' }}>
      {children}
    </p>
  )
}

function Dot({ topic }: { topic?: string }) {
  return (
    <span
      className="h-[7px] w-[7px] shrink-0 rounded-full"
      style={{ background: topicColor(topic) }}
      aria-hidden="true"
    />
  )
}

function NoteRow({
  slug,
  title,
  topic,
  trailing,
}: {
  slug: string
  title: string
  topic?: string
  trailing?: ReactNode
}) {
  const g = useKBGraph()
  const active = g.selectedId === slug
  return (
    <button
      type="button"
      title={title}
      onClick={() => g.select(slug, { focus: true })}
      onPointerEnter={() => g.setHoverId(slug)}
      onPointerLeave={() => g.setHoverId(null)}
      className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11.5px] transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)] ${
        active ? 'bg-[var(--kb-accent-dim)] text-[var(--kb-accent)]' : ''
      }`}
    >
      <Dot topic={topic} />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {trailing}
    </button>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className="shrink-0 rounded border px-1 text-[9px]"
      style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}
    >
      {children}
    </span>
  )
}

function BackButton() {
  const g = useKBGraph()
  return (
    <button
      type="button"
      onClick={() => g.select(null)}
      className="mb-2 inline-flex items-center gap-1 text-[11px] transition-colors hover:text-[var(--kb-accent)]"
      style={{ color: 'var(--kb-text-muted)' }}
    >
      &larr; Overview
    </button>
  )
}

function Overview() {
  const g = useKBGraph()
  const deg = useMemo(() => degreesOf(g.data), [g.data])
  const filtered = g.filters.topics.size > 0 || g.filters.stage !== 'all'
  const visible = g.data.postIndex.filter((p) => noteMatchesFilters(p, g.filters))
  const visibleIds = new Set(visible.map((p) => p.slug))
  const byId = new Map(g.data.postIndex.map((p) => [p.slug, p]))
  const hubs = [...g.hubs].map((id) => byId.get(id)).filter((p): p is KBPostEntry => Boolean(p))
  const maxIn = Math.max(1, ...hubs.map((p) => deg.get(p.slug)?.inDegree ?? 0))
  const orphanNotes = g.orphans
    .map((id) => byId.get(id))
    .filter((p): p is KBPostEntry => Boolean(p))
  const orphanGroups = sortTopics(g.data.topics)
    .map((t) => ({
      topic: t,
      list: orphanNotes
        .filter((p) => p.topic === t.id && (!filtered || visibleIds.has(p.slug)))
        .sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .filter((grp) => grp.list.length > 0)
  const shownOrphans = orphanGroups.reduce((n, grp) => n + grp.list.length, 0)
  const shownIsolated = [...g.isolated].filter((id) => !filtered || visibleIds.has(id)).length
  const explicit = g.links.filter((l) => l.kind === 'link').length
  const linked = visible.filter((p) => {
    const d = deg.get(p.slug)
    return d && d.inDegree + d.outDegree > 0
  }).length

  const stat = (value: number, label: string, warn = false) => (
    <div className="flex flex-col">
      <span
        className="text-lg leading-tight font-medium tabular-nums"
        style={{ color: warn ? 'var(--kb-accent)' : 'var(--kb-text-strong)' }}
      >
        {value}
      </span>
      <span className="text-[10px]" style={{ color: 'var(--kb-text-muted)' }}>
        {label}
      </span>
    </div>
  )

  return (
    <>
      <Section>
        <SectionTitle>
          Overview
          {filtered && <span style={{ color: 'var(--kb-accent)' }}> &middot; filtered</span>}
        </SectionTitle>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {stat(visible.length, 'notes')}
          {stat(explicit, 'explicit links')}
          {stat(linked, 'linked notes')}
          {stat(shownOrphans, `orphans · ${shownIsolated} fully isolated`, true)}
        </div>
        <Hint>
          Orphan = no explicit link in or out. Fully isolated = not even a shared tag node.
        </Hint>
      </Section>

      <Section>
        <SectionTitle>Hubs &middot; most backlinks</SectionTitle>
        <div className="space-y-0.5">
          {hubs.map((p) => {
            const inDeg = deg.get(p.slug)?.inDegree ?? 0
            return (
              <NoteRow
                key={p.slug}
                slug={p.slug}
                title={p.title}
                topic={p.topic}
                trailing={
                  <>
                    <span
                      className="h-[3px] shrink-0 rounded-sm opacity-50"
                      style={{
                        width: `${Math.round(8 + (40 * inDeg) / maxIn)}px`,
                        background: 'var(--kb-text-muted)',
                      }}
                      aria-hidden="true"
                    />
                    <span
                      className="shrink-0 text-[10.5px] tabular-nums"
                      style={{ color: 'var(--kb-text-muted)' }}
                    >
                      &darr;{inDeg}
                    </span>
                  </>
                }
              />
            )
          })}
        </div>
      </Section>

      <Section>
        <SectionTitle>{`Orphans · ${shownOrphans}`}</SectionTitle>
        {orphanGroups.map((grp) => (
          <div key={grp.topic.id} className="mt-1.5 first:mt-0">
            <div
              className="flex items-center gap-1.5 px-1.5 py-0.5 text-[10.5px]"
              style={{ color: 'var(--kb-text-muted)' }}
            >
              <Dot topic={grp.topic.id} />
              {grp.topic.label}
              <span className="ml-auto tabular-nums">{grp.list.length}</span>
            </div>
            <div className="space-y-0.5">
              {grp.list.map((p) => (
                <NoteRow
                  key={p.slug}
                  slug={p.slug}
                  title={p.title}
                  topic={p.topic}
                  trailing={
                    <>
                      {g.isolated.has(p.slug) && <Badge>isolated</Badge>}
                      <span
                        className="shrink-0 text-[10.5px] tabular-nums"
                        style={{ color: 'var(--kb-text-muted)' }}
                      >
                        {p.date.slice(0, 4)}
                      </span>
                    </>
                  }
                />
              ))}
            </div>
          </div>
        ))}
        <Hint>Click an orphan to zoom to it.</Hint>
      </Section>
    </>
  )
}

function NoteMode({ note }: { note: KBPostEntry }) {
  const g = useKBGraph()
  const deg = g.data.postIndex.length ? degreesOf(g.data).get(note.slug) : undefined
  const byId = new Map(g.data.postIndex.map((p) => [p.slug, p]))
  const backlinks = (g.data.backlinks[note.slug] || [])
    .map((b) => byId.get(b.slug))
    .filter((p): p is KBPostEntry => Boolean(p))
  const forward = (g.data.forwardLinks[note.slug] || [])
    .map((s) => byId.get(s))
    .filter((p): p is KBPostEntry => Boolean(p))
  const related = relatedUnlinked(g.data, note.slug)

  const list = (items: KBPostEntry[], empty: string) =>
    items.length === 0 ? (
      <p className="text-[11px] italic" style={{ color: 'var(--kb-text-muted)' }}>
        {empty}
      </p>
    ) : (
      <div className="space-y-0.5">
        {items.map((p) => (
          <NoteRow key={p.slug} slug={p.slug} title={p.title} topic={p.topic} />
        ))}
      </div>
    )

  return (
    <>
      <Section>
        <BackButton />
        <h2
          className="mb-2 text-[18px] leading-tight font-normal text-balance"
          style={{ color: 'var(--kb-text-strong)', fontFamily: 'var(--font-family-serif)' }}
        >
          {note.title}
        </h2>
        <div
          className="mb-2 flex flex-wrap gap-x-2.5 gap-y-1 text-[10.5px]"
          style={{ color: 'var(--kb-text-muted)' }}
        >
          <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--kb-text)' }}>
            <Dot topic={note.topic} />
            {topicLabel(note.topic)}
          </span>
          <span>
            {STAGE_ICON[note.stage] || ''} {note.stage}
          </span>
          <span>{note.date.slice(0, 10)}</span>
          <span>
            &darr;{deg?.inDegree ?? 0} &uarr;{deg?.outDegree ?? 0}
          </span>
        </div>
        {note.summary && (
          <p
            className="line-clamp-3 text-[11px] leading-relaxed"
            style={{ color: 'var(--kb-text)' }}
          >
            {note.summary}
          </p>
        )}
        <Link
          href={`/kb/${note.slug}`}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] transition-colors hover:bg-[var(--kb-accent-dim)]"
          style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-accent)' }}
        >
          Open note &#8599;
        </Link>
      </Section>
      <Section>
        <SectionTitle>{`Backlinks (${backlinks.length})`}</SectionTitle>
        {list(backlinks, 'No notes link here yet.')}
      </Section>
      <Section>
        <SectionTitle>{`Links to (${forward.length})`}</SectionTitle>
        {list(forward, 'This note links nowhere yet.')}
      </Section>
      <Section>
        <SectionTitle>{`Related, not linked (${related.length})`}</SectionTitle>
        {related.length === 0 ? (
          <p className="text-[11px] italic" style={{ color: 'var(--kb-text-muted)' }}>
            No unlinked note shares 2+ tags.
          </p>
        ) : (
          <div className="space-y-0.5">
            {related.map((r) => (
              <NoteRow
                key={r.slug}
                slug={r.slug}
                title={r.title}
                topic={byId.get(r.slug)?.topic}
                trailing={
                  <span className="flex shrink-0 gap-1">
                    {r.sharedTags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded px-1 text-[9px]"
                        style={{ background: 'var(--kb-accent-dim)', color: 'var(--kb-accent)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                }
              />
            ))}
          </div>
        )}
        <Hint>Shares two or more tags with this note but is not linked either way.</Hint>
      </Section>
      <Section>
        <SectionTitle>Tags</SectionTitle>
        <div className="flex flex-wrap gap-1">
          {note.tags.length === 0 ? (
            <span className="text-[11px] italic" style={{ color: 'var(--kb-text-muted)' }}>
              none
            </span>
          ) : (
            note.tags.map((t) => (
              <span
                key={t}
                className="rounded px-1.5 text-[10px]"
                style={{ background: 'var(--kb-surface-alt)', color: 'var(--kb-text-muted)' }}
              >
                {t}
              </span>
            ))
          )}
        </div>
      </Section>
    </>
  )
}

function TagMode({ id }: { id: string }) {
  const g = useKBGraph()
  const tag = g.data.graph.tagNodes.find((t) => t.id === id)
  const byId = new Map(g.data.postIndex.map((p) => [p.slug, p]))
  const orphanSet = new Set(g.orphans)
  const members = g.data.graph.tagLinks
    .filter((l) => l.target === id)
    .map((l) => byId.get(l.source))
    .filter((p): p is KBPostEntry => Boolean(p))
    .sort((a, b) => b.date.localeCompare(a.date))
  if (!tag) return null
  return (
    <>
      <Section>
        <BackButton />
        <h2
          className="mb-2 text-[18px] leading-tight font-normal"
          style={{ color: 'var(--kb-text-strong)', fontFamily: 'var(--font-family-serif)' }}
        >
          #{tag.label}
        </h2>
        <div className="flex gap-2.5 text-[10.5px]" style={{ color: 'var(--kb-text-muted)' }}>
          <span>{members.length} notes</span>
          <span>{members.filter((p) => orphanSet.has(p.slug)).length} of them orphans</span>
        </div>
      </Section>
      <Section>
        <SectionTitle>Notes with this tag</SectionTitle>
        <div className="space-y-0.5">
          {members.map((p) => (
            <NoteRow
              key={p.slug}
              slug={p.slug}
              title={p.title}
              topic={p.topic}
              trailing={orphanSet.has(p.slug) ? <Badge>orphan</Badge> : undefined}
            />
          ))}
        </div>
      </Section>
    </>
  )
}

export default function KBGraphPanel() {
  const g = useKBGraph()
  const sel = g.selectedId
  const note = sel ? g.data.postIndex.find((p) => p.slug === sel) : undefined
  return (
    <div className="flex h-full flex-col text-xs" style={{ color: 'var(--kb-text-strong)' }}>
      {sel && sel.startsWith('tag:') ? (
        <TagMode id={sel} />
      ) : note ? (
        <NoteMode note={note} />
      ) : (
        <Overview />
      )}
    </div>
  )
}
