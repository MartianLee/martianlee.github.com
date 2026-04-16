'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'

interface KBShellProps {
  sidebar: ReactNode
  main: ReactNode
  context?: ReactNode
  statusBar?: ReactNode
  breadcrumb?: ReactNode
}

export default function KBShell({ sidebar, main, context, statusBar, breadcrumb }: KBShellProps) {
  // null = not yet hydrated, use CSS to control visibility
  const [sidebarOpen, setSidebarOpen] = useState<boolean | null>(null)
  const [contextOpen, setContextOpen] = useState<boolean | null>(null)

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    setSidebarOpen(isDesktop)
    setContextOpen(isDesktop)

    // KB takes over the full viewport — prevent outer page from scrolling
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const hydrated = sidebarOpen !== null

  const closePanels = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setSidebarOpen(false)
      setContextOpen(false)
    }
  }

  return (
    <div
      className="kb-theme flex flex-col font-mono"
      style={{ background: 'var(--kb-bg)', height: '100dvh' }}
    >
      {/* Toolbar */}
      <div
        className="flex h-8 shrink-0 items-center justify-between px-3 text-xs"
        style={{ borderBottom: '1px solid var(--kb-border)', color: 'var(--kb-text-muted)' }}
      >
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center rounded px-1.5 py-0.5 transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
            title="Blog Home"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L8.354 1.146z" />
            </svg>
          </Link>
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen)
              if (!sidebarOpen) setContextOpen(false)
            }}
            className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2.5A.5.5 0 0 1 .5 2h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0 5A.5.5 0 0 1 .5 7h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z" />
            </svg>
            <span className="hidden sm:inline">Explorer</span>
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Link href="/kb" className="hover:underline" style={{ color: 'var(--kb-accent)' }}>
            KB
          </Link>
          {breadcrumb && (
            <>
              <span>/</span>
              {breadcrumb}
            </>
          )}
        </div>

        <button
          onClick={() => {
            setContextOpen(!contextOpen)
            if (!contextOpen) setSidebarOpen(false)
          }}
          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors hover:bg-[var(--kb-accent-dim)] hover:text-[var(--kb-accent)]"
        >
          <span className="hidden sm:inline">Context</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 2.5A.5.5 0 0 1 .5 2h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm8 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z" />
          </svg>
        </button>
      </div>

      {/* Mobile backdrop */}
      {hydrated && (sidebarOpen || contextOpen) && (
        <button
          type="button"
          aria-label="Close panels"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={closePanels}
        />
      )}

      {/* 3-Panel Body */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        {(hydrated ? sidebarOpen : true) && (
          <aside
            className={`shrink-0 overflow-y-auto ${
              !hydrated
                ? 'hidden w-[260px] md:relative md:block'
                : 'fixed top-0 left-0 z-50 h-full w-[280px] md:relative md:z-auto md:h-auto md:w-[260px]'
            }`}
            style={{
              borderRight: '1px solid var(--kb-border)',
              background: 'var(--kb-surface)',
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main */}
        <main className="min-w-0 flex-1 overflow-y-auto" style={{ background: 'var(--kb-bg)' }}>
          {main}
        </main>

        {/* Context Panel */}
        {(hydrated ? contextOpen : true) && context && (
          <aside
            className={`shrink-0 overflow-y-auto ${
              !hydrated
                ? 'hidden w-[240px] md:relative md:block'
                : 'fixed top-0 right-0 z-50 h-full w-[280px] md:relative md:z-auto md:h-auto md:w-[240px]'
            }`}
            style={{
              borderLeft: '1px solid var(--kb-border)',
              background: 'var(--kb-surface)',
            }}
          >
            {context}
          </aside>
        )}
      </div>

      {/* Status Bar */}
      {statusBar && (
        <div
          className="flex h-6 shrink-0 items-center px-3 text-[11px]"
          style={{
            borderTop: '1px solid var(--kb-border)',
            background: 'var(--kb-surface-alt)',
            color: 'var(--kb-text-muted)',
          }}
        >
          {statusBar}
        </div>
      )}
    </div>
  )
}
