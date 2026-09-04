interface Career {
  company: string
  role: string
  roleKo?: string
  period: string
  description: string
  descriptionKo?: string
  techStack?: string[]
  imgSrc?: string
  href?: string
}

const careerData: Career[] = [
  {
    company: 'UJET',
    role: 'Software Engineer 2',
    roleKo: '소프트웨어 엔지니어 2',
    period: '2024 - Present',
    description: 'UJET is AI-Powered Cloud Contact Center Platform for Premium CX',
    descriptionKo: 'UJET은 프리미엄 CX를 위한 AI 기반 클라우드 컨택센터 플랫폼입니다',
    techStack: ['Rails', 'GCP', 'Node.js', 'TypeScript', 'Kubernetes'],
    imgSrc: '/static/projects/ujet-logo.svg',
    href: 'https://ujet.cx/',
  },
  {
    company: 'TomorrowUse',
    role: 'Co-founder / CTO',
    roleKo: '공동창업자 / CTO',
    period: '2021 - 2023',
    description:
      'Climate-tech startup (product: Stepping). Sole engineer on a three-person founding team; built carbon-measurement and offset products end-to-end: app, infra, and CI/CD.',
    descriptionKo:
      '기후테크 스타트업입니다(제품: Stepping). 3인 창업팀의 유일한 개발자로 탄소 측정·상쇄 제품을 앱부터 인프라, CI/CD까지 만들어 출시했습니다.',
    techStack: ['Next.js', 'React', 'Nest.js', 'PostgreSQL', 'AWS', '0to1'],
    imgSrc: '/static/projects/stepping-logo.png',
    href: '/climate',
  },
  {
    company: 'Miso',
    role: 'Frontend Developer',
    roleKo: '프론트엔드 개발자',
    period: '2020 - 2021',
    description:
      "South Korea's leading home services platform. Responsible for client app maintenance and back-office development to improve CX operations.",
    descriptionKo:
      '대한민국 대표 홈서비스 플랫폼입니다. CX 운영 개선을 위한 클라이언트 앱 유지보수와 백오피스 개발을 담당했습니다.',
    techStack: ['React', 'React Native', 'Redux', 'TypeScript'],
    imgSrc: '/static/projects/miso-logo.png',
    href: 'https://miso.kr/',
  },
]

export default careerData
