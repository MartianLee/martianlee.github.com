// Bilingual UI strings. English is the SSR default (recruiter-facing / SEO);
// Korean renders client-side when the language toggle is set to "ko".
// Plain data module (no hooks) so it is importable from anywhere.

export type Lang = 'en' | 'ko'

/** Replace {name} placeholders: fill('{n} posts', { n: 69 }) → '69 posts'. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  )
}

export interface UIStrings {
  nav: { projects: string; writing: string; notes: string; about: string }
  cv: string
  footer: { location: string }
  masthead: {
    eyebrow: string
    tagline: string
    viewProjects: string
    writing: string
  }
  sections: {
    projects: string
    writing: string
    experience: string
    allProjects: string
    allPosts: string
    writingIntro: string
  }
  contact: { open: string; email: string; seoul: string; mars: string }
  list: {
    tags: string
    all: string
    newer: string
    older: string
    allTags: string
    readGauge: string
    pageOf: string
    filterByTag: string
    latestPosts: string
  }
  post: {
    backToWriting: string
    onThisPage: string
    previous: string
    next: string
    editOnGitHub: string
    studyNote: string
  }
  projectsPage: {
    eyebrow: string
    title: string
    apps: string
    games: string
    back: string
    game: string
    appTool: string
    liveDemo: string
    techStack: string
    workflow: string
    builtWithAI: string
    intro: string
    sunHint: string
    kind: string
    source: string
    figure: string
    previous: string
    next: string
  }
  about: {
    experience: string
    occupation: string
    name: string
    globeLabel: string
    litAt: string
    subsolar: string
    jezeroTime: string
    season: string
    faceSun: string
    faceJezero: string
    drag: string
  }
  hud: {
    live: string
    lmst: string
    mtc: string
    msd: string
    season: string
    light: string
    northern: string
    seasons: { spring: string; summer: string; autumn: string; winter: string }
  }
  home: { projects: string; posts: string; experience: string }
  tenure: { label: string; hint: string; now: string; readout: string }
  band: {
    posts: string
    projects: string
    tags: string
    writingLog: string
    postCount: string
    tagCount: string
    latest: string
    sideProjects: string
    projectCount: string
    appsCount: string
    gamesCount: string
  }
  notFound: {
    eyebrow: string
    noSignal: string
    title: string
    body: string
    mars: string
    home: string
    posts: string
  }
}

export const ui: Record<Lang, UIStrings> = {
  en: {
    nav: { projects: 'Projects', writing: 'Posts', notes: 'Notes', about: 'About' },
    cv: 'CV ↗',
    footer: { location: 'Seoul · UTC+9' },
    masthead: {
      eyebrow: 'Software Engineer @ UJET · ex-Founder/CTO · Seoul, open to global roles',
      tagline: 'I move fast with AI — and keep the decisions that matter human.',
      viewProjects: '↓ View projects',
      writing: 'Posts',
    },
    sections: {
      projects: '01 — Projects',
      writing: '02 — Recent posts',
      experience: '03 — Experience',
      allProjects: 'All projects →',
      allPosts: 'All posts →',
      writingIntro: 'I take large codebases apart and write down how they actually work.',
    },
    contact: {
      open: 'Open to senior / staff engineering roles — globally.',
      email: 'Email ↗',
      seoul: 'It is {time} in Seoul (UTC+9).',
      mars: 'A message to Mars would take {d} right now.',
    },
    list: {
      tags: 'Tags',
      all: 'All',
      newer: '← Newer',
      older: 'Older →',
      allTags: 'All {n} tags →',
      readGauge: '{n} min read',
      pageOf: '{current} / {total}',
      filterByTag: 'Filter by tag',
      latestPosts: 'Latest posts',
    },
    post: {
      backToWriting: '← Posts',
      onThisPage: 'On this page',
      previous: '← PREVIOUS',
      next: 'NEXT →',
      editOnGitHub: 'Edit on GitHub ↗',
      studyNote: 'Study note · analyzed with AI',
    },
    projectsPage: {
      eyebrow: 'Side projects',
      title: "Things I've built",
      apps: 'Apps & tools',
      games: 'Games',
      back: '← Projects',
      game: 'Game',
      appTool: 'App / Tool',
      liveDemo: 'Live Demo ↗',
      techStack: 'Tech stack',
      workflow: 'Workflow',
      builtWithAI: 'Built with AI',
      intro: "Things I've built.",
      sunHint: 'Your pointer is the Sun for every planet on this page.',
      kind: 'Kind',
      source: 'Source',
      figure: 'Fig. 1',
      previous: 'Previous',
      next: 'Next',
    },
    about: {
      experience: 'Experience',
      occupation: 'Software Engineer',
      name: 'SeongHwa Lee',
      globeLabel: 'Mars as lit by the Sun right now',
      litAt: 'Mars as lit at {time} UTC',
      subsolar: 'Subsolar point',
      jezeroTime: 'Jezero local time',
      season: 'Season',
      faceSun: 'Face the Sun',
      faceJezero: 'Face Jezero',
      drag: 'Drag to rotate',
    },
    hud: {
      live: 'Live · Jezero Crater 18.44°N 77.45°E',
      lmst: 'Local solar time',
      mtc: 'Coordinated Mars time',
      msd: 'Mars sol date',
      season: 'Season',
      light: 'Earth → Mars light time',
      northern: 'northern',
      seasons: { spring: 'spring', summer: 'summer', autumn: 'autumn', winter: 'winter' },
    },
    home: { projects: 'Projects', posts: 'Recent posts', experience: 'Experience' },
    tenure: {
      label: 'Career timeline, 2020 to now',
      hint: 'Bars run from the start year to the end year. Hover or tap the timeline, or focus it and use the arrow keys, to read any year.',
      now: 'Now',
      readout: '{year} · {roles}',
    },
    band: {
      posts: 'Posts',
      projects: 'Projects',
      tags: 'Tags',
      writingLog: 'Writing log',
      postCount: '{n} posts',
      tagCount: '{n} tags',
      latest: 'latest {date}',
      sideProjects: 'Side projects',
      projectCount: '{n} projects',
      appsCount: '{n} apps & tools',
      gamesCount: '{n} games',
    },
    notFound: {
      eyebrow: 'Error 404',
      noSignal: 'No signal at this address',
      title: 'Signal lost',
      body: 'There is no page at this address. It may have moved, or it was never written.',
      mars: 'Even a reply from Mars takes {d} right now. This page is not on its way.',
      home: '← Back home',
      posts: 'Browse posts',
    },
  },
  ko: {
    nav: { projects: '프로젝트', writing: '글', notes: '노트', about: '소개' },
    cv: '이력서 ↗',
    footer: { location: '서울 · UTC+9' },
    masthead: {
      eyebrow: 'UJET 소프트웨어 엔지니어 · 전 창업자/CTO · 서울, 글로벌 채용 오픈',
      tagline: 'AI로 빠르게 움직이되, 정말 중요한 결정은 사람의 몫으로 남깁니다.',
      viewProjects: '↓ 프로젝트 보기',
      writing: '글',
    },
    sections: {
      projects: '01 — 프로젝트',
      writing: '02 — 최근 글',
      experience: '03 — 경력',
      allProjects: '전체 프로젝트 →',
      allPosts: '전체 글 →',
      writingIntro: '거대한 코드베이스를 뜯어보고, 실제로 어떻게 동작하는지 기록합니다.',
    },
    contact: {
      open: '시니어 / 스태프 엔지니어 포지션이라면 국내외 어디든 열려 있습니다.',
      email: '이메일 ↗',
      seoul: '서울은 지금 {time}입니다(UTC+9).',
      mars: '지금 화성에 메시지를 보내면 {d} 걸립니다.',
    },
    list: {
      tags: '태그',
      all: '전체',
      newer: '← 최신',
      older: '이전 →',
      allTags: '태그 {n}개 전체 →',
      readGauge: '{n}분 분량',
      pageOf: '{current} / {total}',
      filterByTag: '태그로 거르기',
      latestPosts: '최근 글',
    },
    post: {
      backToWriting: '← 글 목록',
      onThisPage: '목차',
      previous: '← 이전 글',
      next: '다음 글 →',
      editOnGitHub: 'GitHub에서 편집 ↗',
      studyNote: '학습 노트 · AI와 함께 분석',
    },
    projectsPage: {
      eyebrow: '사이드 프로젝트',
      title: '제가 만든 것들',
      apps: '앱 & 도구',
      games: '게임',
      back: '← 프로젝트',
      game: '게임',
      appTool: '앱 / 도구',
      liveDemo: '라이브 데모 ↗',
      techStack: '기술 스택',
      workflow: '워크플로우',
      builtWithAI: 'AI와 함께 제작',
      intro: '직접 만든 것들입니다.',
      sunHint: '커서가 이 페이지 모든 행성의 태양입니다.',
      kind: '종류',
      source: '소스',
      figure: '그림 1',
      previous: '이전',
      next: '다음',
    },
    about: {
      experience: '경력',
      occupation: '소프트웨어 엔지니어',
      name: '이성화',
      globeLabel: '지금 태양 빛을 받는 화성',
      litAt: '{time} UTC 기준 화성',
      subsolar: '태양 직하점',
      jezeroTime: '제제로 현지 시각',
      season: '계절',
      faceSun: '해 쪽 보기',
      faceJezero: '제제로 보기',
      drag: '끌어서 돌리기',
    },
    hud: {
      live: '실시간 · 제제로 크레이터 18.44°N 77.45°E',
      lmst: '현지 태양시',
      mtc: '화성 협정시',
      msd: '화성 솔 날짜',
      season: '계절',
      light: '지구 → 화성 빛 도달 시간',
      northern: '북반구',
      seasons: { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' },
    },
    home: { projects: '프로젝트', posts: '최근 글', experience: '경력' },
    tenure: {
      label: '경력 타임라인, 2020년부터 지금까지',
      hint: '막대는 시작 연도부터 종료 연도까지입니다. 타임라인에 마우스를 올리거나 탭하고, 포커스한 뒤 방향키로 연도를 읽을 수 있습니다.',
      now: '현재',
      readout: '{year} · {roles}',
    },
    band: {
      posts: '글',
      projects: '프로젝트',
      tags: '태그',
      writingLog: '글 기록',
      postCount: '글 {n}편',
      tagCount: '태그 {n}개',
      latest: '최근 {date}',
      sideProjects: '사이드 프로젝트',
      projectCount: '프로젝트 {n}개',
      appsCount: '앱·도구 {n}개',
      gamesCount: '게임 {n}개',
    },
    notFound: {
      eyebrow: '오류 404',
      noSignal: '이 주소에서는 신호가 없습니다',
      title: '신호 끊김',
      body: '이 주소에는 페이지가 없습니다. 옮겨졌거나 아직 쓰이지 않은 페이지입니다.',
      mars: '지금은 화성에서 오는 답장도 {d} 걸립니다. 이 페이지는 오고 있지 않습니다.',
      home: '← 홈으로',
      posts: '글 둘러보기',
    },
  },
}
