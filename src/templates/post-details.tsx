import React, { ReactNode } from 'react';
import { graphql } from 'gatsby';
import { MDXProvider } from '@mdx-js/react';
import Layout from '../components/common/Layout';
import styled from '@emotion/styled';
import { Components } from '@mdx-js/react/lib';

const H1 = styled.h1``;
const H2 = styled.h2`
  margin: 2rem 0 1rem;
`;
const H3 = styled.h3``;
const P = styled.p`
  line-height: 1.5rem;
`;
const CodeWrapper = styled.code``;
const CODE = styled.code`
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: #fbfbf4;
  padding: 1rem 1rem;
  line-height: 1.1rem;
  border: 1px solid #999999;
  border-radius: 8px;
  margin: 0.5rem auto;
`;
const components: Components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  code: CODE,
};
const Head = styled.div`
  padding: 2.5rem 1rem 0.5rem 1rem;
  background: #e9e9e9;
`;
const Body = styled.section`
  padding: 1rem;
  line-height: 1.4rem;
`;
const ReleaseDate = styled.div`
  text-align: right;
`;

type Props = {
  data: any;
  pageContext: any;
  children: ReactNode;
};
export default function ProjectDetails({ data, pageContext, children }: Props) {
  const { frontmatter } = data.mdx;
  const {
    title,
    summary,
    featuredImg,
    tags,
    date,
  }: { title: string; summary: any; featuredImg: string; tags: any; date: string } =
    frontmatter;
  const [publishDate, publishTime] = new Date(
    date.replace(' ', 'T').replace(' ', '')
  )
    .toLocaleString()
    .split('T');

  return (
    <Layout>
      <Head>
        <h1>{title}</h1>
        <ReleaseDate>발행일: {publishDate}</ReleaseDate>
      </Head>
      <Body>
        <MDXProvider components={components}>{children}</MDXProvider>
      </Body>
    </Layout>
  );
}

export const query = graphql`
  query ProjectsPage($title: String) {
    mdx(frontmatter: { title: { eq: $title } }) {
      frontmatter {
        author
        categories
        crawlertitle
        date
        layout
        summary
        tags
        title
      }
    }
  }
`;
