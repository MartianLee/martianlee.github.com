import styled from '@emotion/styled';
import { graphql, Link } from 'gatsby';
import * as React from 'react';
import colors from '../components/common/colors';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import { slugToTitle } from '../utils';

type Post = {
  slug: string;
  frontmatter: {
    title: string;
    author: string;
    categories: string;
    crawlertitle: string;
    date: Date;
    layout: string;
    summary: string;
    tags: [];
  };
};

const StyledLink = styled((props) => <Link {...props} />)`
  color: ${colors.keyColor1};
`;

const IndexPage = ({ data }) => {
  const posts = data.allMdx.nodes;
  return (
    <Layout>
      <Header />
      <h1>Posts</h1>
      {posts.map((post: Post) => {
        return (
          <article key={`post-${post.slug}`}>
            <StyledLink to={`${slugToTitle(post.slug)}`}>
              <h2>{post.frontmatter.title}</h2>
            </StyledLink>
          </article>
        );
      })}
    </Layout>
  );
};

export default IndexPage;

export const query = graphql`
  query PostList {
    allMdx(sort: { fields: frontmatter___date, order: DESC }) {
      nodes {
        slug
        frontmatter {
          title
          author
          categories
          crawlertitle
          date
          layout
          summary
          tags
        }
      }
    }
  }
`;
