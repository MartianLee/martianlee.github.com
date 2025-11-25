interface Career {
  company: string
  role: string
  period: string
  description: string
  techStack?: string[]
  imgSrc?: string
  href?: string
}

const careerData: Career[] = [
  {
    company: 'UJET',
    role: 'Software Engineer',
    period: '2024 - Present',
    description: 'UJET is AI-Powered Cloud Contact Center Platform for Premium CX',
    techStack: ['Rails', 'GCP', 'Node.js', 'TypeScript', 'Kubernetes'],
    imgSrc: '/static/projects/ujet-logo.svg',
    href: 'https://ujet.cx/',
  },
  {
    company: '스테핑',
    role: 'Fullstack Developer',
    period: '2021 - 2023',
    description: '스테핑은 기업·브랜드가 지속가능할 수 있도록 복잡한 탄소중립 절차와 기후행동 프로젝트를 지원합니다',
    techStack: ['Next.js', 'React', 'Nest.js', 'PostgreSQL', 'AWS'],
    imgSrc: '/static/projects/stepping-logo.png',
    href: 'https://stepping.co.kr/',
  },
  {
    company: 'Miso',
    role: 'Frontend Developer',
    period: '2020 - 2021',
    description: '대한민국 1등 홈서비스 미소에서 Client 유지보수, CX 서비스 개선을 위한 백오피스 개발 등을 담당했습니다',
    techStack: ['React', 'React Native', 'Redux', 'TypeScript'],
    imgSrc: '/static/projects/miso-logo.png',
    href: 'https://miso.kr/',
  },
]

export default careerData

