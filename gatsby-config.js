const path = require('path');

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
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // You can add multiple tracking ids and a pageview event will be fired for all of them.
        trackingIds: [
          'G-M9M7LP1ZFQ', // Google Analytics / GA
        ],
        // This object gets passed directly to the gtag config command
        // This config will be shared across all trackingIds
        gtagConfig: {
          optimize_id: 'OPT_CONTAINER_ID',
          anonymize_ip: true,
          cookie_expires: 0,
        },
        // This object is used for configuration specific to this plugin
        pluginConfig: {
          // Puts tracking script in the head instead of the body
          head: false,
          // Setting this parameter is also optional
          respectDNT: true,
          // Avoids sending pageview hits from custom paths
          exclude: [],
          // Delays processing pageview events on route update (in milliseconds)
          delayOnRouteUpdate: 1,
        },
      },
    },
    'gatsby-plugin-image',
    'gatsby-plugin-react-helmet-async',
    'gatsby-plugin-sitemap',
    // {
    //   resolve: 'gatsby-plugin-page-creator',
    //   options: {
    //     path: `${__dirname}/contents/posts/`,
    //   },
    // },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        defaultLayouts: {
          default: path.resolve('./src/templates/post-details.tsx'),
        },
        extensions: ['.mdx', '.md', '.markdown'],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/contents/posts/`,
      },
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/contents/posts`,
      },
    },
    `gatsby-transformer-remark`,
    'gatsby-plugin-sharp',
    'gatsby-plugin-emotion',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: './contents/images/',
      },
      __key: 'images',
    },
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
