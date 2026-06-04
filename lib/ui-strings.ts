// Bilingual UI strings. English is the SSR default (recruiter-facing / SEO);
// Korean renders client-side when the language toggle is set to "ko".
// Plain data module (no hooks) so it is importable from anywhere.

export type Lang = 'en' | 'ko'

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
  contact: { open: string; email: string }
  list: { tags: string; all: string; newer: string; older: string }
  post: {
    backToWriting: string
    onThisPage: string
    previous: string
    next: string
    editOnGitHub: string
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
  }
  about: { experience: string; occupation: string }
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
    },
    list: { tags: 'Tags', all: 'All', newer: '← Newer', older: 'Older →' },
    post: {
      backToWriting: '← Posts',
      onThisPage: 'On this page',
      previous: '← PREVIOUS',
      next: 'NEXT →',
      editOnGitHub: 'Edit on GitHub ↗',
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
    },
    about: { experience: 'Experience', occupation: 'Software Engineer' },
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
      open: '시니어 / 스태프 엔지니어 포지션을 글로벌하게 찾고 있습니다.',
      email: '이메일 ↗',
    },
    list: { tags: '태그', all: '전체', newer: '← 최신', older: '이전 →' },
    post: {
      backToWriting: '← 글 목록',
      onThisPage: '목차',
      previous: '← 이전 글',
      next: '다음 글 →',
      editOnGitHub: 'GitHub에서 편집 ↗',
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
    },
    about: { experience: '경력', occupation: '소프트웨어 엔지니어' },
  },
}
