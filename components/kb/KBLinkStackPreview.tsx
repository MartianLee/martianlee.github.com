'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import kbData from 'app/kb-data.json'
import type { KBData, KBPostEntry } from '@/components/kb/types'

const data = kbData as KBData

interface KBLinkStackPreviewProps {
  currentSlug: string
  children: React.ReactNode
}

export default function KBLinkStackPreview({ currentSlug, children }: KBLinkStackPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [previewSlug, setPreviewSlug] = useState<string | null>(null)

  const previewNote = useMemo<KBPostEntry | null>(() => {
    if (!previewSlug) return null
    return data.postIndex.find((note) => note.slug === previewSlug) ?? null
  }, [previewSlug])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return
      if (anchor.closest('[data-kb-preview-panel="true"]')) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href) return

      const url = new URL(href, window.location.origin)
      const kbPrefix = '/kb/'
      if (!url.pathname.startsWith(kbPrefix)) return

      const slug = decodeURIComponent(url.pathname.slice(kbPrefix.length))
      if (!slug || slug === currentSlug) return

      if (!data.postIndex.some((note) => note.slug === slug)) return

      event.preventDefault()
      setPreviewSlug(slug)
    }

    container.addEventListener('click', onClick)
    return () => container.removeEventListener('click', onClick)
  }, [currentSlug])

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewSlug(null)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  const backlinks = previewSlug ? (data.backlinks[previewSlug]?.length ?? 0) : 0
  const outLinks = previewSlug ? (data.forwardLinks[previewSlug]?.length ?? 0) : 0

  return (
    <div ref={containerRef} className="relative">
      {children}

      <button
        type="button"
        aria-label="Close preview"
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          previewNote ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'rgba(0, 0, 0, 0.2)', pointerEvents: previewNote ? 'auto' : 'none' }}
        onClick={() => setPreviewSlug(null)}
      />

      <aside
        data-kb-preview-panel="true"
        className={`fixed top-12 right-2 z-50 h-[calc(100dvh-5rem)] w-[min(640px,calc(100vw-1rem))] rounded-lg border shadow-2xl transition-all duration-250 sm:right-4 ${
          previewNote ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-8 opacity-0'
        }`}
        style={{
          borderColor: 'var(--kb-border)',
          background: 'var(--kb-surface)',
        }}
        aria-hidden={!previewNote}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 translate-x-2 translate-y-2 rounded-lg border opacity-60"
          style={{ borderColor: 'var(--kb-border)', background: 'var(--kb-surface-alt)' }}
        />

        <div
          className="flex h-9 items-center justify-between border-b px-3 font-mono text-xs"
          style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}
        >
          <span>Link Preview</span>
          <div className="flex items-center gap-2">
            {previewNote && (
              <Link
                href={`/kb/${previewNote.slug}`}
                className="rounded border px-1.5 py-0.5 hover:bg-[var(--kb-accent-dim)]"
                style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-accent)' }}
              >
                문서로 이동
              </Link>
            )}
            <button
              type="button"
              onClick={() => setPreviewSlug(null)}
              className="rounded px-1.5 py-0.5 hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
            >
              esc
            </button>
          </div>
        </div>

        {previewNote && (
          <div className="flex h-[calc(100%-2.25rem)] flex-col overflow-hidden">
            <div
              className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2 font-mono text-[11px]"
              style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-text-muted)' }}
            >
              <span style={{ color: 'var(--kb-accent)' }}>{previewNote.topic}</span>
              <span>&middot;</span>
              <span>in {outLinks}</span>
              <span>/</span>
              <span>back {backlinks}</span>
            </div>

            <iframe
              title={`KB preview: ${previewNote.title}`}
              src={`/kb/preview/${previewNote.slug}`}
              className="h-full w-full border-0"
              loading="lazy"
            />

            <div
              className="flex shrink-0 items-center justify-between border-t px-4 py-2 font-mono text-xs"
              style={{ color: 'var(--kb-text-muted)' }}
            >
              <span>1-depth full note preview</span>
              <Link
                href={`/kb/${previewNote.slug}`}
                className="rounded border px-2 py-1 hover:bg-[var(--kb-accent-dim)]"
                style={{ borderColor: 'var(--kb-border)', color: 'var(--kb-accent)' }}
              >
                전체 노트 열기
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
