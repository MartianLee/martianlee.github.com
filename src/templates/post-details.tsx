import React from 'react';
import { graphql } from 'gatsby';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import Layout from '../components/common/Layout';
import styled from '@emotion/styled';

const H1 = ({ children }) => <h1>{children}</h1>;
const H2 = ({ children }) => <h2>{children}</h2>;
const H3 = ({ children }) => <h3>{children}</h3>;
const PWrapper = styled.p`
  line-height: 1.5rem;
`;
const P = ({ children }) => <PWrapper>{children}</PWrapper>;
const CodeWrapper = styled.code`
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: #fbfbf8;
  padding: 1rem 0.5rem;
`;
const CODE = ({ children }) => <CodeWrapper>{children}</CodeWrapper>;
const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  code: CODE,
};
const Head = styled.div`
  padding-top: 1rem;
`;
const Body = styled.section`
  padding: 0.5rem;
`;

export default function ProjectDetails({ data, pageContext }) {
  const { body, frontmatter } = data.mdx;
  const { title, summary, featuredImg, tags, date }: { date: string } = frontmatter;
  const [publishDate, publishTime] = new Date(
    date.replace(' ', 'T').replace(' ', '')
  )
    .toISOString()
    .split('T');

  return (
    <Layout>
      <Head>
        <h1>{title}</h1>
        Published: {publishDate} {publishTime.split('.')[0]}
      </Head>
      <Body>
        <MDXProvider components={components}>
          <MDXRenderer>{body}</MDXRenderer>
        </MDXProvider>
      </Body>
    </Layout>
  );
}

export const query = graphql`
  query ProjectsPage($title: String) {
    mdx(frontmatter: { title: { eq: $title } }) {
      body
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
