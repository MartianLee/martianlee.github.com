import styled from '@emotion/styled';
import { graphql, Link } from 'gatsby';
import * as React from 'react';
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

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: grey;
  color: white;
  font-size: 1rem;
  border-radius: 4px;
`;

const Warning = styled.div`
  text-align: center;
  font-size: 2rem;
`;

const IndexPage = ({ data }) => {
  const posts = data.allMdx.nodes;
  return (
    <Layout>
      <Header />
      <Warning>
        <h2>공사중입니다!</h2>
      </Warning>
      <h2>최근 글</h2>
      {posts.map((post: Post) => {
        return (
          <article key={`post-${post.slug}`}>
            <Link to={`posts/${slugToTitle(post.slug)}`}>
              <h2>{post.frontmatter.title}</h2>
            </Link>
          </article>
        );
      })}
      <Link to="/posts">
        <Button>더 보기</Button>
      </Link>
    </Layout>
  );
};

export default IndexPage;

export const query = graphql`
  query Posts {
    allMdx(sort: { fields: frontmatter___date, order: DESC }, limit: 5) {
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
