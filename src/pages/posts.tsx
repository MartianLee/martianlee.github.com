import styled from '@emotion/styled';
import { GatsbyLinkProps, graphql, Link } from 'gatsby';
import * as React from 'react';
import colors from '../components/common/colors';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import { slugToTitle } from '../utils';

type Post = {
  frontmatter: {
    title: string;
    slug: string;
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
      <h2>게시글</h2>
      {posts.map((post: Post) => {
        return (
          <article key={`post-${post.frontmatter.slug}`}>
            <StyledLink to={`${slugToTitle(post.frontmatter.slug)}`}>
              <h3>{post.frontmatter.title}</h3>
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
    allMdx(sort: { frontmatter: { date: DESC } }) {
      nodes {
        frontmatter {
          title
          slug
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
