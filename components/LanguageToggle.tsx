'use client'

export default function LanguageToggle() {
  return (
    <div
      className="text-muted font-mono text-xs"
      aria-label="Language: English (Korean toggle coming soon)"
      title="Korean toggle coming soon"
    >
      <span className="text-ink font-bold">EN</span>
      <span className="px-1 opacity-40">/</span>
      <span className="cursor-not-allowed">KO</span>
    </div>
  )
}
