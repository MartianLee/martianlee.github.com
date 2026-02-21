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
  {
    title: 'Fish Tank Simulator (수족관 시뮬레이터)',
    description: '뽀모도로 타이머와 수족관 시뮬레이션이 결합된 도트 그래픽 방치형 생산성 도구. 집중 세션을 완료하여 물고기 알을 획득하고, 12종 이상의 다양한 물고기를 수집하며 자신만의 수족관을 성장시킵니다.',
    techStack: ['Phaser3', 'TypeScript', 'Vercel'],
    demo: 'https://phaser3-fish-tank.vercel.app/',
    featured: true,
  },
]

export default projectsData
