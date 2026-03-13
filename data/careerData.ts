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
    role: 'Software Engineer 2',
    period: '2024 - Present',
    description: 'UJET is AI-Powered Cloud Contact Center Platform for Premium CX',
    techStack: ['Rails', 'GCP', 'Node.js', 'TypeScript', 'Kubernetes'],
    imgSrc: '/static/projects/ujet-logo.svg',
    href: 'https://ujet.cx/',
  },
  {
    company: 'Stepping',
    role: 'Founder / CTO',
    period: '2021 - 2023',
    description:
      'Stepping helps companies and brands navigate complex carbon-neutral processes and climate action projects to build a sustainable future.',
    techStack: ['Next.js', 'React', 'Nest.js', 'PostgreSQL', 'AWS', '0to1'],
    imgSrc: '/static/projects/stepping-logo.png',
    href: 'https://stepping.co.kr/',
  },
  {
    company: 'Miso',
    role: 'Frontend Developer',
    period: '2020 - 2021',
    description:
      "South Korea's leading home services platform. Responsible for client app maintenance and back-office development to improve CX operations.",
    techStack: ['React', 'React Native', 'Redux', 'TypeScript'],
    imgSrc: '/static/projects/miso-logo.png',
    href: 'https://miso.kr/',
  },
]

export default careerData
