export interface KBPostEntry {
  slug: string
  title: string
  shortTitle: string
  date: string
  topic: string
  stage: string
  tags: string[]
  summary: string
}

export interface KBTopic {
  id: string
  label: string
  count: number
  slugs: string[]
}

export interface KBBacklink {
  slug: string
  title: string
}

export interface KBTagNode {
  id: string
  label: string
  count: number
}

export interface KBTagLink {
  source: string
  target: string
}

export interface KBGraphData {
  tagNodes: KBTagNode[]
  tagLinks: KBTagLink[]
}

export interface KBData {
  topics: KBTopic[]
  backlinks: Record<string, KBBacklink[]>
  forwardLinks: Record<string, string[]>
  postIndex: KBPostEntry[]
  graph: KBGraphData
  generatedAt: string
}
