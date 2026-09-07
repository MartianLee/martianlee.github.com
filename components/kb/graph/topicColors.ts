/** Palette slot per topic. Slots map to --kb-topic-N CSS tokens; 0 is the neutral "other". */
export const TOPIC_SLOT: Record<string, number> = {
  'ai-infrastructure': 1,
  'llm-research': 2,
  'dev-life': 3,
  'web-frontend': 4,
  backend: 5,
  algorithms: 6,
  'backend-architecture': 7,
  'devops-cloud': 8,
}

export const TOPIC_LABEL: Record<string, string> = {
  'llm-research': 'LLM Research',
  'ai-infrastructure': 'AI Infrastructure',
  'web-frontend': 'Web Frontend',
  backend: 'Backend',
  'backend-architecture': 'Backend Architecture',
  'devops-cloud': 'DevOps & Cloud',
  'dev-life': 'Dev Life',
  algorithms: 'Algorithms',
  'software-engineering': 'Software Engineering',
  uncategorized: 'Uncategorized',
}

/** Same ordering the KB sidebar uses: research first, then AI, then alphabetical. */
export const TOPIC_PRIORITY: Record<string, number> = {
  'llm-research': 0,
  'ai-infrastructure': 1,
}

/** Digital-garden stage icons, shared by every graph component. */
export const STAGE_ICON: Record<string, string> = {
  seedling: '\u{1F331}',
  budding: '\u{1F33F}',
  evergreen: '\u{1F333}',
}

export function topicSlot(topic?: string): number {
  return (topic && TOPIC_SLOT[topic]) || 0
}

export function topicColor(topic?: string): string {
  return `var(--kb-topic-${topicSlot(topic)})`
}

export function topicLabel(topic?: string): string {
  return (topic && TOPIC_LABEL[topic]) || topic || 'Uncategorized'
}

export function sortTopics<T extends { id: string; label: string }>(topics: T[]): T[] {
  return [...topics].sort((a, b) => {
    const pa = TOPIC_PRIORITY[a.id] ?? 99
    const pb = TOPIC_PRIORITY[b.id] ?? 99
    if (pa !== pb) return pa - pb
    return a.label.localeCompare(b.label)
  })
}
