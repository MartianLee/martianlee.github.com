import { writeFileSync } from 'fs'

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
        ['architecture', 'ai-agent', 'llm', 'langchain', 'ollama', 'rust', 'cdp', 'browser-automation'].includes(
          t.toLowerCase()
        )
      ) || post.title?.toLowerCase().includes('아키텍처 분석'),
  },
  {
    topic: 'web-frontend',
    match: (post) =>
      post.tags?.some((t) =>
        [
          'react', 'reactjs', 'angular', 'angularjs', 'vue', 'vue.js', 'next.js',
          'css', 'react-native', 'frontend', 'front-end', 'gatsby',
          'javascript', 'typescript',
        ].includes(t.toLowerCase())
      ),
  },
  {
    topic: 'backend',
    match: (post) =>
      post.tags?.some((t) =>
        [
          'rails', 'django', 'spring', 'spring-boot', 'postgresql',
          'node.js', 'ruby', 'java', 'jwt',
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
          'docker', 'kubernetes', 'gcp', 'aws', 'firebase', 'deploy', 'gae',
          'git', 'github', 'bash', 'ssh',
        ].includes(t.toLowerCase())
      ),
  },
  {
    topic: 'dev-life',
    match: (post) =>
      post.tags?.some((t) =>
        [
          'interview', 'review', 'til', 'blog', 'career', 'ndc',
          'conference', 'job', 'daily', 'book', 'question',
          'jekyll', '지킬', 'civic hacking',
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
  'devops-cloud': 'DevOps & Cloud',
  'dev-life': 'Dev Life',
  algorithms: 'Algorithms',
  uncategorized: 'Uncategorized',
}

function inferTopic(post) {
  if (post.topic) return post.topic
  for (const rule of TOPIC_RULES) {
    if (rule.match(post)) return rule.topic
  }
  return 'uncategorized'
}

export function generateKBData(allBlogs) {
  const posts = allBlogs
    .filter((p) => p.type === 'Blog' && !p.draft)
    .map((p) => ({
      slug: p.slug || p._raw?.flattenedPath?.replace(/^.+?(\/)/, ''),
      title: p.title,
      date: p.date,
      tags: p.tags || [],
      topic: p.topic,
      stage: p.stage || 'budding',
      summary: p.summary || '',
      body: p.body?.raw || '',
    }))

  // Assign topics
  const topicMap = {}
  for (const post of posts) {
    post.topic = inferTopic(post)
    if (!topicMap[post.topic]) {
      topicMap[post.topic] = []
    }
    topicMap[post.topic].push(post.slug)
  }

  // Scan for [[wiki-links]] and internal /posts/ links to build backlinks
  const backlinks = {}
  const forwardLinks = {}
  const slugSet = new Set(posts.map((p) => p.slug))

  for (const post of posts) {
    forwardLinks[post.slug] = []

    // Match [[slug]] or [[slug|display]]
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
    let match
    while ((match = wikiLinkRegex.exec(post.body)) !== null) {
      const targetSlug = match[1].trim()
      if (slugSet.has(targetSlug) && targetSlug !== post.slug) {
        forwardLinks[post.slug].push(targetSlug)
        if (!backlinks[targetSlug]) backlinks[targetSlug] = []
        backlinks[targetSlug].push({
          slug: post.slug,
          title: post.title,
        })
      }
    }

    // Also match internal href="/posts/SLUG" links
    const hrefRegex = /href=["']\/posts\/([^"']+)["']/g
    while ((match = hrefRegex.exec(post.body)) !== null) {
      const targetSlug = match[1].trim()
      if (slugSet.has(targetSlug) && targetSlug !== post.slug) {
        forwardLinks[post.slug].push(targetSlug)
        if (!backlinks[targetSlug]) backlinks[targetSlug] = []
        backlinks[targetSlug].push({
          slug: post.slug,
          title: post.title,
        })
      }
    }

    // Also match markdown links to /kb/SLUG, e.g. [text](/kb/some-slug)
    const kbLinkRegex = /\]\(\/kb\/([^)]+)\)/g
    while ((match = kbLinkRegex.exec(post.body)) !== null) {
      const targetSlug = match[1].trim()
      if (slugSet.has(targetSlug) && targetSlug !== post.slug) {
        forwardLinks[post.slug].push(targetSlug)
        if (!backlinks[targetSlug]) backlinks[targetSlug] = []
        backlinks[targetSlug].push({
          slug: post.slug,
          title: post.title,
        })
      }
    }
  }

  // Deduplicate backlinks
  for (const slug of Object.keys(backlinks)) {
    const seen = new Set()
    backlinks[slug] = backlinks[slug].filter((bl) => {
      if (seen.has(bl.slug)) return false
      seen.add(bl.slug)
      return true
    })
  }

  // Deduplicate forwardLinks
  for (const slug of Object.keys(forwardLinks)) {
    forwardLinks[slug] = [...new Set(forwardLinks[slug])]
  }

  const topics = Object.entries(topicMap)
    .map(([id, slugs]) => ({
      id,
      label: TOPIC_LABELS[id] || id,
      count: slugs.length,
      slugs,
    }))
    .sort((a, b) => b.count - a.count)

  // Post index (lightweight, for sidebar/listing)
  const postIndex = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    topic: p.topic,
    stage: p.stage,
    tags: p.tags,
    summary: p.summary,
  }))

  const kbData = {
    topics,
    backlinks,
    forwardLinks,
    postIndex,
    generatedAt: new Date().toISOString(),
  }

  writeFileSync('./app/kb-data.json', JSON.stringify(kbData, null, 2))
  console.log(
    `KB data generated: ${posts.length} notes, ${topics.length} topics, ${Object.keys(backlinks).length} notes with backlinks`
  )
}
