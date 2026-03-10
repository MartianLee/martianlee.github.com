import type { PlinyConfig } from 'pliny/config'

const siteMetadata: PlinyConfig = {
  title: "MartianLee's Dev Blog",
  author: 'MartianLee',
  headerTitle: "MartianLee's Dev Blog",
  description: 'A blog created with Next.js and Tailwind.css',
  language: 'ko-KR',
  theme: 'system', // system, dark or light
  siteUrl: 'https://martianlee.github.io/',
  siteRepo: 'https://github.com/MartianLee/martianlee.github.com',
  siteLogo: '/static/favicons/favicon.png',
  image: '/static/images/avatar.png',
  socialBanner: '/static/images/thumnail-github2.png',
  // mastodon: 'https://mastodon.social/@mastodonuser',
  email: 'martionlee@gmail.com',
  github: 'https://github.com/MartianLee',
  // twitter: 'https://twitter.com/Twitter',
  // facebook: 'https://facebook.com',
  // youtube: 'https://youtube.com',
  linkedin: 'https://linkedin.com/in/martianlee/',
  // threads: 'https://www.threads.net',
  // instagram: 'https://www.instagram.com',
  locale: 'ko-KR',
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    // umamiAnalytics: {
    //   umamiWebsiteId: process.env.NEXT_UMAMI_ID,
    // },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '',
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '',
    // },
    googleAnalytics: {
      googleAnalyticsId: 'G-M9M7LP1ZFQ',
    },
  },
  comments: {
    provider: 'giscus', // supported providers: giscus, utterances, disqus
    giscusConfig: {
      repo: (process.env.NEXT_PUBLIC_GISCUS_REPO ?? '') as `${string}/${string}`,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID ?? '',
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? '',
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? '',
      mapping: 'pathname', // supported options: pathname, url, title
      reactions: '1',
      metadata: '0',
      theme: 'light',
      darkTheme: 'transparent_dark',
      themeURL: '',
      lang: 'en',
    },
  },
  search: {
    provider: 'kbar',
    kbarConfig: {
      searchDocumentsPath: 'search.json',
    },
    // provider: 'algolia',
    // algoliaConfig: {
    //   appId: 'R2IYF7ETH7',
    //   apiKey: '599cec31baffa4868cae4e79f180729b',
    //   indexName: 'docsearch',
    // },
  },
}

export default siteMetadata
