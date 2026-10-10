export interface TocEntry {
  value: string
  url: string
  depth: number
}

export function parseToc(raw: unknown): TocEntry[] {
  if (Array.isArray(raw)) return raw as TocEntry[]
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as TocEntry[]) : []
    } catch {
      return []
    }
  }
  return []
}

const NUMBERED = /^\s*\d+[.)]\s/

/** True when the author already numbers the h2 sections, so automatic numbering must stay off. */
export function hasNumberedHeadings(toc: readonly TocEntry[]): boolean {
  return toc.some((h) => h.depth === 2 && NUMBERED.test(h.value))
}
