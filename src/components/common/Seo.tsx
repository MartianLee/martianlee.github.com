import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({ title, description, image, slug }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            image
          }
        }
      }
    `
  );

  const metaDescription = description || site.siteMetadata.description;
  const metaTitle = title || site.siteMetadata.title;
  const defaultImage = '/base.jpg';
  const metaImage = image ? image : defaultImage;
  const keywords =
    'MartianLee,Javascript,React,Typescript,React Native,ESG,Earth,Technoloy,리엑트';

  return (
    <Helmet
      htmlAttributes={{
        lang: `ko`,
      }}
      title={title}
      defaultTitle={site.siteMetadata.title}
      meta={[
        {
          name: `description`,
          content:
            metaDescription ??
            '투명성과 공공성을 확대하여 더 신뢰할 수 있는 사회를 만들기 위해 공익데이터를 만듭니다',
        },
        {
          name: 'keywords',
          content: keywords,
        },
        {
          property: `og:title`,
          content: metaTitle,
        },
        {
          property: `og:image`,
          content: metaImage,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `twitter:card`,
          content: 'summary_large_image',
        },
        {
          property: `twitter:title`,
          content: metaTitle,
        },
        {
          property: `twitter:image`,
          content: metaImage,
        },
        {
          property: `twitter:description`,
          content: metaDescription,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata?.author || ``,
        },
      ]}
    ></Helmet>
  );
}

export default SEO;
