// /climate hub copy. Source of truth for the page's EN/KO content.
// Rule: never use an em-dash (—) in this copy.

export type ClimateTagKind = 'plain' | 'metric' | 'own'

export interface ClimateTag {
  label: string
  kind: ClimateTagKind
}

export interface ClimateCase {
  num: string
  title: string
  desc: string
  tags: ClimateTag[]
}

export interface ClimateStrings {
  hero: {
    eyebrow: string
    title: string
    manifesto: string
    capLine: string
    role: string
    roleSub: string
    globeCaption: string
  }
  stats: { n: string; label: string }[]
  whatIBuilt: {
    heading: string
    label: string
    sub: string
    upNext: string
    cases: ClimateCase[]
  }
  howItWorked: {
    title: string
    body: string
    pills: { label: string; own?: boolean }[]
  }
  series: {
    heading: string
    label: string
    sub: string
    badge: string
    items: { num: string; title: string; desc: string }[]
  }
  cta: {
    label: string
    heading: string
  }
}

export const climateCopy: Record<'en' | 'ko', ClimateStrings> = {
  en: {
    hero: {
      eyebrow: 'Earth Driven Developer',
      title: 'I built products for the planet.',
      manifesto:
        'I believe technology should ultimately serve a sustainable Earth. Climate change is real: the concentration of CO₂ in the atmosphere keeps rising. So I built products that measure the carbon individuals and companies emit.',
      capLine:
        'As Co-founder / CTO of TomorrowUse and the only engineer on a three-person team, I built carbon-measurement & offset products end-to-end: app, infra, and CI/CD.',
      role: 'Co-founder / CTO · TomorrowUse',
      roleSub: '· 2021-2023 · product: Stepping',
      globeCaption: 'Atmospheric CO₂, accumulating',
    },
    stats: [
      { n: '~50', label: 'Cafe24 merchants subscribed' },
      {
        n: '1 dev',
        label: 'sole engineer on a team of 3 · app → infra → CI/CD · NestJS / Next.js full-stack',
      },
      { n: 'B2C + B2B', label: 'Shipped product lines' },
    ],
    whatIBuilt: {
      heading: 'What I built',
      label: 'Case studies · TomorrowUse, 2021-2023',
      sub: 'Co-founder / CTO and the only engineer on a three-person team. Each of these I designed, built, deployed, and shipped end-to-end.',
      upNext: '(upcoming)',
      cases: [
        {
          num: '01',
          title: 'A product carbon footprint calculator',
          desc: "Licensed emission factors, then built a tool: enter a product's attributes and it calculates and visualizes the carbon footprint.",
          tags: [
            { label: 'LCA', kind: 'plain' },
            { label: 'emission-factor licensing', kind: 'plain' },
            { label: 'attributes → visualization', kind: 'plain' },
          ],
        },
        {
          num: '02',
          title: 'Carbon-neutral commerce: a Cafe24 subscription SaaS',
          desc: 'An EcoCart-inspired SaaS for Cafe24: customers subscribe, the widget auto-injects into product-detail & order-complete pages, and every item sold automatically purchases a 9.8 kg CO₂e offset. Payment SDK integration, infrastructure, and CI/CD automation.',
          tags: [
            { label: '~50 merchants', kind: 'metric' },
            { label: '9.8 kg / item', kind: 'metric' },
            { label: '~100 t CO₂e / mo', kind: 'metric' },
            { label: 'payment SDK', kind: 'plain' },
            { label: 'self-built CI/CD', kind: 'own' },
          ],
        },
        {
          num: '03',
          title: 'Event-emissions offsetting (B2B)',
          desc: "Measured the carbon emitted by companies' offline promotional events and sold offset credits matching the emissions, so customers could achieve a carbon-neutral event quickly and easily.",
          tags: [
            { label: 'B2B', kind: 'plain' },
            { label: 'measurement → offset', kind: 'plain' },
          ],
        },
        {
          num: '04',
          title: "Building climate tech as the CTO of a three-person startup, and what I'd change",
          desc: 'A retrospective: the agile process of building and promoting new products, the sustainability of the team alongside the sustainability of the planet, and a critique of carbon offsetting itself.',
          tags: [
            { label: 'judgment', kind: 'plain' },
            { label: 'Verra / VCS researched', kind: 'plain' },
          ],
        },
      ],
    },
    howItWorked: {
      title: 'How I built it',
      body: 'As the only engineer on a three-person team, development speed mattered. I leaned on existing solutions and kept my focus on the business logic: emission factors licensed, payments through an SDK, and the widget deployed through the Cafe24 API without touching a single line of merchant code. The heart of the product I deployed myself: the application on PostgreSQL and AWS, with a CI/CD pipeline built on GitHub Actions. Prompt-engineering workflows from the early GPT-3 days (2021-2023) helped one person move fast.',
      pills: [
        { label: 'LCA + licensed factors' },
        { label: 'Next.js / Nest.js' },
        { label: 'Cafe24 API' },
        { label: 'payment SDK' },
        { label: 'PostgreSQL / AWS (owned)', own: true },
        { label: 'self-built CI/CD · GitHub Actions', own: true },
        { label: 'sole engineer · early-LLM prompt workflows' },
      ],
    },
    series: {
      heading: 'Carbon, from scratch',
      label: 'Learning series · upcoming',
      sub: 'The work above, explained from first principles: the knowledge you need to understand carbon neutrality.',
      badge: 'UPCOMING',
      items: [
        {
          num: '1',
          title: 'What is carbon, and why it matters',
          desc: 'CO₂e and the scale of the problem, made tangible',
        },
        {
          num: '2',
          title: 'Where carbon hides in daily life',
          desc: 'Food, travel, energy, goods: emissions where you live',
        },
        {
          num: '3',
          title: 'How carbon is measured: LCA & emission factors',
          desc: 'Cradle-to-grave, a working introduction',
        },
      ],
    },
    cta: {
      label: 'Available',
      heading: 'Open to senior / staff engineering roles, globally.',
    },
  },
  ko: {
    hero: {
      eyebrow: 'Earth Driven Developer',
      title: '지구를 위한 제품을 만들었습니다.',
      manifesto:
        '기술은 결국 지속가능한 지구를 위해 쓰여야 한다고 믿습니다. 기후변화는 현실입니다. 대기 중 CO₂ 농도는 지금도 높아지고 있습니다. 그래서 개인과 기업이 배출하는 탄소를 측정하는 제품을 만들었습니다.',
      capLine:
        '내일의쓰임(TomorrowUse)의 공동창업자/CTO로서, 3인 팀의 유일한 개발자로 탄소 측정·상쇄 제품을 앱부터 인프라, CI/CD까지 혼자 만들어 출시했습니다.',
      role: 'Co-founder / CTO · TomorrowUse',
      roleSub: '· 2021-2023 · 제품: Stepping',
      globeCaption: '대기에 쌓이는 CO₂',
    },
    stats: [
      { n: '~50', label: '구독한 Cafe24 가맹점' },
      {
        n: '1 dev',
        label: '3인 팀의 유일한 개발자 · 앱 → 인프라 → CI/CD · NestJS / Next.js 풀스택',
      },
      { n: 'B2C + B2B', label: '출시한 제품군' },
    ],
    whatIBuilt: {
      heading: '만든 것들',
      label: '케이스 스터디 · TomorrowUse, 2021-2023',
      sub: '3인 팀의 공동창업자/CTO이자 유일한 개발자로서, 아래 제품 모두를 설계부터 배포까지 직접 맡았습니다.',
      upNext: '(준비 중)',
      cases: [
        {
          num: '01',
          title: '제품 탄소발자국 계산기',
          desc: '배출계수를 라이선스로 확보한 뒤, 제품 속성을 입력하면 탄소 배출량을 계산해 시각화하는 도구를 만들었습니다.',
          tags: [
            { label: 'LCA', kind: 'plain' },
            { label: 'emission-factor licensing', kind: 'plain' },
            { label: '속성 입력 → 시각화', kind: 'plain' },
          ],
        },
        {
          num: '02',
          title: '탄소중립 커머스: Cafe24 구독형 SaaS',
          desc: 'EcoCart에서 영감을 받은 Cafe24용 SaaS입니다. 고객이 구독하면 위젯이 상품 상세·주문 완료 페이지에 자동 삽입되고, 상품 1개가 팔릴 때마다 9.8kg CO₂e가 자동으로 상쇄 구매됩니다. 결제 SDK 연동, 인프라, CI/CD 자동화.',
          tags: [
            { label: '~50 merchants', kind: 'metric' },
            { label: '9.8 kg / item', kind: 'metric' },
            { label: '~100 t CO₂e / mo', kind: 'metric' },
            { label: 'payment SDK', kind: 'plain' },
            { label: 'self-built CI/CD', kind: 'own' },
          ],
        },
        {
          num: '03',
          title: '행사 배출량 측정·상쇄 (B2B)',
          desc: '기업이 여는 오프라인 프로모션 행사의 탄소 배출량을 측정하고, 그만큼의 상쇄권을 판매했습니다. 고객사가 탄소중립 행사를 쉽고 빠르게 열 수 있도록 도왔습니다.',
          tags: [
            { label: 'B2B', kind: 'plain' },
            { label: 'measurement → offset', kind: 'plain' },
          ],
        },
        {
          num: '04',
          title: '3인 스타트업 CTO의 기후테크 개발기: 다시 한다면 바꿀 것',
          desc: '신제품을 만들고 알리는 애자일 프로세스, 지구의 지속가능성만큼 중요한 팀의 지속가능성, 그리고 탄소 상쇄라는 방식 자체를 향한 비판까지 다루는 회고입니다.',
          tags: [
            { label: '의사결정', kind: 'plain' },
            { label: 'Verra / VCS 직접 평가', kind: 'plain' },
          ],
        },
      ],
    },
    howItWorked: {
      title: '어떻게 만들었나요?',
      body: '개발자가 저 혼자인 3인 팀이라 개발의 속도가 중요했습니다. 기존의 솔루션을 활용하면서 비즈니스 로직에 집중했습니다. 배출계수는 라이선스로 확보하고, 결제는 SDK로 연동, 위젯은 Cafe24 API를 써서 가맹점 코드를 한 줄도 고치지 않고 배포했습니다. 대신 제품의 중심인 애플리케이션은 PostgreSQL과 AWS 위에 직접 배포하고, CI/CD 파이프라인도 GitHub Actions로 구축했습니다. GPT-3 초기 시절(2021-2023)의 프롬프트 엔지니어링 워크플로를 개발에 활용한 덕분에 혼자서도 빠르게 만들 수 있었습니다.',
      pills: [
        { label: 'LCA + licensed factors' },
        { label: 'Next.js / Nest.js' },
        { label: 'Cafe24 API' },
        { label: 'payment SDK' },
        { label: 'PostgreSQL / AWS (owned)', own: true },
        { label: 'self-built CI/CD · GitHub Actions', own: true },
        { label: '1인 개발 · 초기 LLM 프롬프트 워크플로' },
      ],
    },
    series: {
      heading: 'Carbon, from scratch',
      label: '학습 시리즈 · 준비 중',
      sub: '위에서 소개한 작업을 기본 원리부터 풀어 쓰는 시리즈입니다. 탄소중립에 대한 이해를 위한 지식입니다.',
      badge: '준비 중',
      items: [
        {
          num: '1',
          title: '탄소란 무엇이고, 왜 중요한가',
          desc: 'CO₂e와 문제의 규모, 손에 잡히게 풀어 보기',
        },
        {
          num: '2',
          title: '일상 속 탄소는 어디에 숨어 있나',
          desc: '음식, 이동, 에너지, 물건 등 생활 영역별 배출',
        },
        {
          num: '3',
          title: '탄소는 어떻게 측정하나: LCA와 배출계수',
          desc: '요람에서 무덤까지, 전과정평가(LCA) 입문',
        },
      ],
    },
    cta: {
      label: '이직 준비 중',
      heading: '시니어 / 스태프 엔지니어 포지션이라면 국내외 어디든 열려 있습니다.',
    },
  },
}
