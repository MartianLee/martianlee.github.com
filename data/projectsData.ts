interface Project {
  title: string
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
    description:
      '직장인을 위한 점심 추천 서비스. OpenClaw로 조회 가능한 주변 식당 자동 수집과 방문 기록/평점을 기반으로 매일 새로운 점심 메뉴를 추천합니다.',
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
    title: '칭찬할고양',
    description:
      '매일 자신을 칭찬하는 습관을 만들어주는 칭찬 일기 앱. 긍정적인 마인드셋을 위한 일상 기록 서비스입니다.',
    category: 'non-game',
    techStack: ['React Native', 'Firebase', 'TypeScript'],
    demo: 'https://play.google.com/store/apps/details?id=com.teiroleema.cheercat3',
    imgSrc: '/static/projects/cheercat.png',
    featured: true,
  },
  {
    title: '지구침략자',
    description:
      'Phaser3 기반 슈팅 게임. 지구를 침략하는 외계인을 물리치는 클래식 아케이드 스타일 게임입니다.',
    category: 'game',
    techStack: ['Phaser3', 'TypeScript', 'Rollup', 'Vercel'],
    workflow: ['Vercel Git Deploy'],
    aiTools: ['GPT (Prompt Copy-Paste Start, ~2023)', 'Augment Code (Minor Support, mid-2025)'],
    demo: 'https://phaser3-rollup-typescript-vercel.vercel.app/',
    imgSrc: '/static/projects/earth-invaders.png',
    featured: true,
  },
  {
    title: 'Fish Tank Simulator (수족관 시뮬레이터)',
    description:
      '뽀모도로 타이머와 수족관 시뮬레이션이 결합된 도트 그래픽 방치형 생산성 도구. 집중 세션을 완료하여 물고기 알을 획득하고, 12종 이상의 다양한 물고기를 수집하며 자신만의 수족관을 성장시킵니다.',
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
    description:
      '가방 무게를 계산하고 관리할 수 있는 웹 애플리케이션. 건강한 어깨를 위한 스마트한 가방 무게 체크 서비스입니다.',
    category: 'non-game',
    techStack: ['React', 'TypeScript', 'Next.js'],
    demo: 'https://www.shoulder-check.cloud/',
    imgSrc: '/static/projects/shoulder-check.png',
    featured: true,
  },
  {
    title: 'First Defense',
    description:
      'Godot 4.6 기반 2.5D 로그라이크 타워 디펜스 프로토타입. 유닛 조합, 태그 시너지, 실시간 배치, 메타 성장을 중심으로 설계했습니다.',
    category: 'game',
    techStack: ['Godot 4.6', 'GDScript', 'GitHub Pages'],
    workflow: ['GitHub Actions: Godot Web Export', 'GitHub Pages Auto Deploy'],
    aiTools: ['Gemini CLI (Primary Build)', 'Claude CLI (Follow-up Improvements)'],
    demo: 'https://martianlee.github.io/godot-first-defense/',
    github: 'https://github.com/MartianLee/godot-first-defense',
    imgSrc: '/static/projects/first-defense-thumbnail.png',
    featured: true,
  },
]

export default projectsData
