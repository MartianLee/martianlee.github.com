import React from 'react';
import { graphql } from 'gatsby';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import Layout from '../components/common/Layout';
import styled from '@emotion/styled';

const H1 = ({ children }) => <h1>{children}</h1>;
const H2 = ({ children }) => <h2>{children}</h2>;
const H3 = ({ children }) => <h3>{children}</h3>;
const P = ({ children }) => <p>{children}</p>;
const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
};
const Body = styled.section`
  padding: 0.5rem;
`;

export default function ProjectDetails({ data, pageContext }) {
  const { title, summary, featuredImg, tags } = data.mdx.frontmatter;
  return (
    <Layout>
      <h1>{title}</h1>
      Wrote at {data.mdx.frontmatter.date}
      <Body>
        <MDXProvider components={components}>
          <MDXRenderer>{data.mdx.body}</MDXRenderer>
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
