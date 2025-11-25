interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
  techStack?: string[]
  github?: string
  demo?: string
  featured?: boolean
}

const projectsData: Project[] = [
  {
    title: '칭찬할고양',
    description: '매일 자신을 칭찬하는 습관을 만들어주는 칭찬 일기 앱. 긍정적인 마인드셋을 위한 일상 기록 서비스입니다.',
    techStack: ['React Native', 'Firebase', 'TypeScript'],
    demo: 'https://play.google.com/store/apps/details?id=com.teiroleema.cheercat3',
    imgSrc: '/static/projects/cheercat.png',
    featured: true,
  },
  {
    title: '지구침략자',
    description: 'Phaser3 기반 슈팅 게임. 지구를 침략하는 외계인을 물리치는 클래식 아케이드 스타일 게임입니다.',
    techStack: ['Phaser3', 'TypeScript', 'Rollup', 'Vercel'],
    demo: 'https://phaser3-rollup-typescript-vercel.vercel.app/',
    imgSrc: '/static/projects/earth-invaders.png',
    featured: true,
  },
  {
    title: 'Shoulder Check',
    description: '가방 무게를 계산하고 관리할 수 있는 웹 애플리케이션. 건강한 어깨를 위한 스마트한 가방 무게 체크 서비스입니다.',
    techStack: ['React', 'TypeScript', 'Next.js'],
    demo: 'https://www.shoulder-check.cloud/',
    imgSrc: '/static/projects/shoulder-check.png',
    featured: true,
  },
]

export default projectsData
