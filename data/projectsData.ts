interface Project {
  title: string,
  description: string,
  href?: string,
  imgSrc?: string,
}

const projectsData: Project[] = [
  // {
  //   title: 'A Search Engine',
  //   description: `What if you could look up any information in the world? Webpages, images, videos
  //   and more. Google has many features to help you find exactly what you're looking
  //   for.`,
  //   imgSrc: '/static/images/google.png',
  //   href: 'https://www.google.com',
  // },
  // {
  //   title: 'The Time Machine',
  //   description: `Imagine being able to travel back in time or to the future. Simple turn the knob
  //   to the desired date and press "Go". No more worrying about lost keys or
  //   forgotten headphones with this simple yet affordable solution.`,
  //   imgSrc: '/static/images/time-machine.jpg',
  //   href: '/blog/the-time-machine',
  // },
  {
    title: '스테핑',
    description: `스테핑은 기업·브랜드가 지속가능할 수 있도록 복잡한 탄소중립 절차와 기후행동 프로젝트를 지원합니다`,
    imgSrc: '/static/projects/stepping-logo.png',
    href: 'https://stepping.co.kr/',
  },
  {
    title: 'Miso',
    description: `대한민국 1등 홈서비스 미소에서 Client 유지보수, CX 서비스 개선을 위한 백오피스 개발 등을 담당했습니다`,
    imgSrc: '/static/projects/miso-logo.png',
    href: 'https://miso.kr/',
  },
]

export default projectsData
