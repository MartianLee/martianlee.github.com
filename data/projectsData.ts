export interface Project {
  title: string
  slug: string
  kind: string
  kindKo?: string
  description: string
  descriptionKo?: string
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
    kindKo: '웹 서비스',
    description:
      'A lunch-recommendation service for office workers. It auto-collects nearby restaurants (discoverable via the OpenClaw skill-optimized API) and suggests a fresh lunch every day based on your visit history and ratings.',
    descriptionKo:
      '직장인을 위한 점심 추천 서비스입니다. 주변 식당을 자동으로 수집(OpenClaw 스킬 최적화 API로 탐색 가능)하고, 방문 이력과 평점을 바탕으로 매일 새로운 점심을 추천합니다.',
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
    kindKo: '모바일 앱',
    description:
      'A daily journaling app that builds the habit of praising yourself every day — a small ritual for a positive mindset.',
    descriptionKo:
      '매일 스스로를 칭찬하는 습관을 길러주는 일기 앱입니다. 긍정적인 마음가짐을 위한 작은 의식이죠.',
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
    kindKo: '아케이드 게임',
    description:
      'A Phaser3 arcade shooter. Fend off the aliens invading Earth, classic arcade style.',
    descriptionKo:
      'Phaser3로 만든 아케이드 슈팅 게임입니다. 지구를 침공하는 외계인을 고전 아케이드 방식으로 막아냅니다.',
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
    kindKo: '방치형 게임',
    description:
      'A pixel-art idle productivity tool that blends a Pomodoro timer with an aquarium sim. Complete focus sessions to earn fish eggs, collect 12+ species, and grow your own tank.',
    descriptionKo:
      '뽀모도로 타이머와 아쿠아리움 시뮬레이션을 결합한 픽셀아트 방치형 생산성 도구입니다. 집중 세션을 완료해 물고기 알을 얻고, 12종 이상을 모아 나만의 수조를 키웁니다.',
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
    kindKo: '웹 앱',
    description:
      'A web app to calculate and track bag weight — a smart bag-weight checker for healthier shoulders.',
    descriptionKo:
      '가방 무게를 계산하고 추적하는 웹 앱입니다. 어깨 건강을 위한 똑똑한 가방 무게 체커예요.',
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
    kindKo: '타워 디펜스',
    description:
      'A 2.5D roguelite tower-defense prototype built in Godot 4.6, designed around unit combos, tag synergies, real-time placement, and meta-progression.',
    descriptionKo:
      'Godot 4.6으로 만든 2.5D 로그라이트 타워 디펜스 프로토타입입니다. 유닛 조합, 태그 시너지, 실시간 배치, 메타 프로그레션을 중심으로 설계했습니다.',
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
    kindKo: 'macOS 앱',
    description:
      'A macOS desktop app that tracks all your side projects in one window. For each GitHub repo it surfaces release stage, staleness detection, interest tags, and mood-matching, using the authenticated gh CLI and local git as data sources. Ships with an English/Korean UI.',
    descriptionKo:
      '모든 사이드 프로젝트를 한 창에서 추적하는 macOS 데스크톱 앱입니다. GitHub 레포별로 릴리스 단계, 방치 감지, 관심 태그, 무드 매칭을 인증된 gh CLI와 로컬 git을 데이터 소스로 제공합니다. 영어/한국어 UI를 지원합니다.',
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
