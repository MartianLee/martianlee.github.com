'use client'

import { useRef, useState, ReactNode } from 'react'

interface PreProps {
  children: ReactNode
}

export default function Pre({ children }: PreProps) {
  const preRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    if (preRef.current) {
      navigator.clipboard.writeText(preRef.current.textContent || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      ref={preRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setCopied(false)
      }}
      style={{ position: 'relative' }}
    >
      {hovered && (
        <button
          aria-label="Copy code"
          onClick={onCopy}
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            height: '32px',
            width: '32px',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: copied ? '#34d399' : 'var(--kb-border, #374151)',
            background: 'var(--kb-surface-alt, #1f2937)',
            color: copied ? '#34d399' : 'var(--kb-text-muted, #9ca3af)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            width="20"
            height="20"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {copied ? (
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            ) : (
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            )}
          </svg>
        </button>
      )}
      <pre>{children}</pre>
    </div>
  )
}
