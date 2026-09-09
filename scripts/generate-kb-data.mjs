import { writeFileSync } from 'fs'

export const TAG_NODE_MIN_NOTES = 3
export const TAG_BLOCKLIST = ['post', 'develop']
export const SHORT_TITLE_MAX = 32

// --- short titles -----------------------------------------------------------

/** Split points: ": ", "： ", " — ", " – ", " - ", " / ", and the space after a "?". */
export const SHORT_TITLE_SEPARATOR = /\s*[:：—–]\s+|\s+[-/]\s+|(?<=\?)\s+/

export function splitTitle(title) {
  return String(title)
    .split(SHORT_TITLE_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Clip to `max` characters including the ellipsis, preferring a word boundary. */
export function clipLabel(s, max = SHORT_TITLE_MAX) {
  const text = String(s).trim()
  if (text.length <= max) return text
  const head = text.slice(0, max - 1)
  const boundary = text[max - 1] === ' ' ? head.length : head.lastIndexOf(' ')
  const cut = boundary > (max - 1) * 0.6 ? head.slice(0, boundary) : head
  return cut.trimEnd() + '…'
}

/**
 * Head of the title unless that head is shared by other notes (headCount > 1)
 * or is shorter than 6 characters; then the tail. Always clipped.
 */
export function deriveShortTitle(title, headCount = new Map()) {
  const parts = splitTitle(title)
  let label = String(title)
  if (parts.length > 1) {
    const head = parts[0]
    const ambiguous = (headCount.get(head) || 0) > 1 || head.length < 6
    label = ambiguous ? parts.slice(1).join(' ') : head
  }
  return clipLabel(label)
}

// --- topic inference (unchanged rules) -------------------------------------
const TOPIC_RULES = [
  {
    topic: 'llm-research',
    match: (post) =>
      post.tags?.some((t) =>
        ['paper', 'paper-reading', 'arxiv', 'transformer', 'research'].includes(t.toLowerCase())
      ) ||
      post.title?.toLowerCase().includes('논문') ||
      /\bpaper\b/i.test(post.title || ''),
  },
  {
    topic: 'ai-infrastructure',
    match: (post) =>
      post.tags?.some((t) =>
        [
          'architecture',
          'ai-agent',
          'llm',
          'langchain',
          'ollama',
          'rust',
          'cdp',
          'browser-automation',
        ].includes(t.toLowerCase())
      ) || post.title?.toLowerCase().includes('아키텍처 분석'),
  },
  {
    topic: 'web-frontend',
    match: (post) =>
      post.tags?.some((t) =>
        [
          'react',
          'reactjs',
          'angular',
          'angularjs',
          'vue',
          'vue.js',
          'next.js',
          'css',
          'react-native',
          'frontend',
          'front-end',
          'gatsby',
          'javascript',
          'typescript',
        ].includes(t.toLowerCase())
      ),
  },
  {
    topic: 'backend',
    match: (post) =>
      post.tags?.some((t) =>
        [
          'rails',
          'django',
          'spring',
          'spring-boot',
          'postgresql',
          'node.js',
          'ruby',
          'java',
          'jwt',
        ].includes(t.toLowerCase())
      ) ||
      post.title?.toLowerCase().includes('spring') ||
      post.title?.toLowerCase().includes('django') ||
      post.title?.toLowerCase().includes('jwt'),
  },
  {
    topic: 'devops-cloud',
    match: (post) =>
      post.tags?.some((t) =>
        [
          'docker',
          'kubernetes',
          'gcp',
          'aws',
          'firebase',
          'deploy',
          'gae',
          'git',
          'github',
          'bash',
          'ssh',
        ].includes(t.toLowerCase())
      ),
  },
  {
    topic: 'dev-life',
    match: (post) =>
      post.tags?.some((t) =>
        [
          'interview',
          'review',
          'til',
          'blog',
          'career',
          'ndc',
          'conference',
          'job',
          'daily',
          'book',
          'question',
          'jekyll',
          '지킬',
          'civic hacking',
        ].includes(t.toLowerCase())
      ) ||
      post.title?.toLowerCase().includes('면접') ||
      post.title?.toLowerCase().includes('til') ||
      post.title?.toLowerCase().includes('블로그') ||
      post.title?.toLowerCase().includes('jekyll'),
  },
  {
    topic: 'algorithms',
    match: (post) =>
      post.tags?.some((t) =>
        ['leetcode', 'algorithm', 'problem-solving', 'problemsolving'].includes(t.toLowerCase())
      ),
  },
  {
    topic: 'ai-infrastructure',
    match: (post) =>
      post.tags?.some((t) =>
        ['ml', 'keras', 'machine learning', '머신러닝'].includes(t.toLowerCase())
      ),
  },
]

const TOPIC_LABELS = {
  'llm-research': 'LLM Research',
  'ai-infrastructure': 'AI Infrastructure',
  'web-frontend': 'Web Frontend',
  backend: 'Backend',
  'backend-architecture': 'Backend Architecture',
  'devops-cloud': 'DevOps & Cloud',
  'dev-life': 'Dev Life',
  algorithms: 'Algorithms',
  'software-engineering': 'Software Engineering',
  climate: 'Climate',
  uncategorized: 'Uncategorized',
}

function inferTopic(post) {
  if (post.topic) return post.topic
  for (const rule of TOPIC_RULES) {
    if (rule.match(post)) return rule.topic
  }
  return 'uncategorized'
}

// --- canonical documents ----------------------------------------------------

/**
 * One document per slug: the English version when it exists, otherwise Korean.
 * Same rule as createTagCount / createSearchIndex in contentlayer.config.ts.
 */
export function pickCanonical(docs) {
  const bySlug = new Map()
  for (const d of docs) {
    const existing = bySlug.get(d.slug)
    if (!existing || (d.language === 'en' && existing.language !== 'en')) bySlug.set(d.slug, d)
  }
  return [...bySlug.values()]
}

// --- links ------------------------------------------------------------------

const LINK_PATTERNS = [
  /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, // [[slug]] or [[slug|display]]
  /href=["']\/posts\/([^"']+)["']/g, // href="/posts/slug"
  /\]\(\/kb\/([^)]+)\)/g, // [text](/kb/slug)
]

/** Every link target mentioned in a body, in document order, not deduplicated. */
export function extractLinks(bodyRaw) {
  const out = []
  for (const re of LINK_PATTERNS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(bodyRaw)) !== null) out.push(m[1].trim())
  }
  return out
}

// --- tag graph --------------------------------------------------------------

/** Tag nodes for tags attached to at least TAG_NODE_MIN_NOTES canonical notes. */
export function buildTagGraph(posts) {
  const count = new Map()
  const membership = new Map()
  for (const p of posts) {
    const tags = new Set(
      (p.tags || []).map((t) => String(t).toLowerCase().trim()).filter((t) => t.length > 0)
    )
    membership.set(p.slug, tags)
    for (const t of tags) count.set(t, (count.get(t) || 0) + 1)
  }
  const tagNodes = [...count.entries()]
    .filter(([tag, c]) => c >= TAG_NODE_MIN_NOTES && !TAG_BLOCKLIST.includes(tag))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, c]) => ({ id: `tag:${label}`, label, count: c }))
  const ids = new Set(tagNodes.map((n) => n.id))
  const tagLinks = []
  for (const p of posts) {
    for (const t of membership.get(p.slug)) {
      if (ids.has(`tag:${t}`)) tagLinks.push({ source: p.slug, target: `tag:${t}` })
    }
  }
  return { tagNodes, tagLinks }
}

// --- build ------------------------------------------------------------------

export function buildKBData(allDocuments, now = new Date()) {
  const blogs = allDocuments.filter((p) => p.type === 'Blog' && !p.draft)
  const canonical = pickCanonical(blogs)
  const slugSet = new Set(canonical.map((p) => p.slug))

  const headCount = new Map()
  for (const p of canonical) {
    const parts = splitTitle(p.title)
    if (parts.length > 1) headCount.set(parts[0], (headCount.get(parts[0]) || 0) + 1)
  }
  // frontmatter shortTitle: English file first, then any language file of the same slug
  const overrides = new Map()
  for (const d of blogs) {
    if (!d.shortTitle) continue
    const existing = overrides.get(d.slug)
    if (!existing || (d.language === 'en' && existing.language !== 'en')) overrides.set(d.slug, d)
  }
  const overrideFor = (slug) => overrides.get(slug)?.shortTitle

  const posts = canonical.map((p) => {
    const override = overrideFor(p.slug)
    return {
      slug: p.slug,
      title: p.title,
      shortTitle: override ? clipLabel(override) : deriveShortTitle(p.title, headCount),
      date: p.date,
      tags: p.tags || [],
      topic: inferTopic(p),
      stage: p.stage || 'budding',
      summary: p.summary || '',
    }
  })
  const titleOf = new Map(posts.map((p) => [p.slug, p.title]))

  // Forward links: union over every language version of a slug, deduplicated, no self links.
  const forwardLinks = {}
  for (const slug of slugSet) forwardLinks[slug] = []
  for (const docItem of blogs) {
    const list = forwardLinks[docItem.slug]
    if (!list) continue
    for (const target of extractLinks(docItem.body?.raw || '')) {
      if (!slugSet.has(target) || target === docItem.slug || list.includes(target)) continue
      list.push(target)
    }
  }

  const backlinks = {}
  for (const [source, targets] of Object.entries(forwardLinks)) {
    for (const target of targets) {
      if (!backlinks[target]) backlinks[target] = []
      backlinks[target].push({ slug: source, title: titleOf.get(source) })
    }
  }

  const topicMap = {}
  for (const post of posts) {
    if (!topicMap[post.topic]) topicMap[post.topic] = []
    topicMap[post.topic].push(post.slug)
  }
  const topics = Object.entries(topicMap)
    .map(([id, slugs]) => ({ id, label: TOPIC_LABELS[id] || id, count: slugs.length, slugs }))
    .sort((a, b) => b.count - a.count)

  return {
    topics,
    backlinks,
    forwardLinks,
    postIndex: posts,
    graph: buildTagGraph(posts),
    generatedAt: now.toISOString(),
  }
}

export function generateKBData(allDocuments) {
  const kbData = buildKBData(allDocuments)
  writeFileSync('./app/kb-data.json', JSON.stringify(kbData, null, 2))
  console.log(
    `KB data generated: ${kbData.postIndex.length} notes, ${kbData.topics.length} topics, ${Object.keys(kbData.backlinks).length} notes with backlinks`
  )
}
