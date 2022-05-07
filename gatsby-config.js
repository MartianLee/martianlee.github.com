/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  siteMetadata: {
    title: `MartianLee's Blog`,
    email: `martionlee@gmail.com`,
    siteUrl: `https://martianlee.github.io`,
    image: 'conents/assets/base.jpg',
    description: `Earth Driven Developer MartianLee's tech blog`,
    locale: `ko`,
    socialLinks: [
      {
        text: 'Twitter',
        link: 'https://twitter.com/earthloverdev',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/MartianLee',
      },
    ],
  },
  plugins: [
    'gatsby-plugin-emotion',
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-98236060-1',
      },
    },
    'gatsby-plugin-image',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sitemap',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/contents/posts/`,
      },
    },
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/contents/posts/`,
      },
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: ['.mdx', '.md', '.markdown'],
      },
    },
    'gatsby-plugin-sharp',
    'gatsby-plugin-emotion',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: './src/images/',
      },
      __key: 'images',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: './contents/assets/',
      },
      __key: 'images',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: './src/pages/',
      },
      __key: 'pages',
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `MartianLee's Blog`,
        short_name: `MartianLee's Blog`,
        start_url: `/`,
        background_color: `#000000`,
        theme_color: `#a2466c`,
        display: `standalone`,
        icon: `contents/assets/favicon.png`,
      },
    },
  ],
};
