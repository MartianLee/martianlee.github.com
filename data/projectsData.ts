interface Project {
  title: string
  slug: string
  kind: string
  description: string
  category: 'game' | 'non-game'
  href?: string
  imgSrc?: string
  techStack?: string[]
  workflow?: string[]
  aiTools?: string[]
  github?: string
  demo?: string
  featured?: boolean
}

const projectsData: Project[] = [
  {
    title: 'More Munch',
    slug: 'more-munch',
    kind: 'Web Service',
    description:
      'A lunch-recommendation service for office workers. It auto-collects nearby restaurants (discoverable via the OpenClaw skill-optimized API) and suggests a fresh lunch every day based on your visit history and ratings.',
    category: 'non-game',
    techStack: [
      'NestJS 11',
      'TypeScript',
      'SQLite',
      'Kakao/Naver API Integration',
      'OpenClaw Skill-Optimized API',
      'Docker Compose',
    ],
    workflow: ['Docker Compose Deploy', 'API-First + Swagger'],
    aiTools: ['Claude CLI (Primary Build)', 'OpenClaw Skill Integration'],
    github: 'https://github.com/MartianLee/project-more-munch',
    featured: true,
  },
  {
    title: 'CheerCat',
    slug: 'cheercat',
    kind: 'Mobile App',
    description:
      'A daily journaling app that builds the habit of praising yourself every day — a small ritual for a positive mindset.',
    category: 'non-game',
    techStack: ['React Native', 'Firebase', 'TypeScript'],
    demo: 'https://play.google.com/store/apps/details?id=com.teiroleema.cheercat3',
    imgSrc: '/static/projects/cheercat.png',
    featured: true,
  },
  {
    title: 'Earth Invaders',
    slug: 'earth-invaders',
    kind: 'Arcade Game',
    description:
      'A Phaser3 arcade shooter. Fend off the aliens invading Earth, classic arcade style.',
    category: 'game',
    techStack: ['Phaser3', 'TypeScript', 'Rollup', 'Vercel'],
    workflow: ['Vercel Git Deploy'],
    aiTools: ['GPT (Prompt Copy-Paste Start, ~2023)', 'Augment Code (Minor Support, mid-2025)'],
    demo: 'https://phaser3-rollup-typescript-vercel.vercel.app/',
    imgSrc: '/static/projects/earth-invaders.png',
    featured: true,
  },
  {
    title: 'Fish Tank Simulator',
    slug: 'fish-tank-simulator',
    kind: 'Idle Game',
    description:
      'A pixel-art idle productivity tool that blends a Pomodoro timer with an aquarium sim. Complete focus sessions to earn fish eggs, collect 12+ species, and grow your own tank.',
    category: 'game',
    techStack: ['Phaser3', 'TypeScript', 'Vercel'],
    workflow: ['Vercel Git Deploy'],
    aiTools: ['Augment Code + GPT-5/5.1 (Conversational Iteration, Oct 2025)'],
    demo: 'https://phaser3-fish-tank.vercel.app/',
    imgSrc: '/static/projects/phaser3-fish-tank.jpg',
    featured: true,
  },
  {
    title: 'Shoulder Check',
    slug: 'shoulder-check',
    kind: 'Web App',
    description:
      'A web app to calculate and track bag weight — a smart bag-weight checker for healthier shoulders.',
    category: 'non-game',
    techStack: ['React', 'TypeScript', 'Next.js'],
    demo: 'https://www.shoulder-check.cloud/',
    imgSrc: '/static/projects/shoulder-check.png',
    featured: true,
  },
  {
    title: 'First Defense',
    slug: 'first-defense',
    kind: 'Tower Defense',
    description:
      'A 2.5D roguelite tower-defense prototype built in Godot 4.6, designed around unit combos, tag synergies, real-time placement, and meta-progression.',
    category: 'game',
    techStack: ['Godot 4.6', 'GDScript', 'GitHub Pages'],
    workflow: ['GitHub Actions: Godot Web Export', 'GitHub Pages Auto Deploy'],
    aiTools: ['Gemini CLI (Primary Build)', 'Claude CLI (Follow-up Improvements)'],
    demo: 'https://martianlee.github.io/godot-first-defense/',
    github: 'https://github.com/MartianLee/godot-first-defense',
    imgSrc: '/static/projects/first-defense-thumbnail.png',
    featured: true,
  },
  {
    title: 'Side Project Tracker',
    slug: 'side-project-tracker',
    kind: 'macOS App',
    description:
      'A macOS desktop app that tracks all your side projects in one window. For each GitHub repo it surfaces release stage, staleness detection, interest tags, and mood-matching, using the authenticated gh CLI and local git as data sources. Ships with an English/Korean UI.',
    category: 'non-game',
    techStack: ['Tauri v2', 'React', 'TypeScript', 'Vite', 'Rust'],
    workflow: ['npm run tauri build (.app)'],
    aiTools: ['Claude Code (Opus, Subagent-Driven TDD)'],
    github: 'https://github.com/MartianLee/side-project-tracker',
    imgSrc: '/static/projects/side-project-tracker.png',
    featured: true,
  },
]

export default projectsData
