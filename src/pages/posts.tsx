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

const IndexPage = ({ data }) => {
  const posts = data.allMdx.nodes;
  return (
    <Layout>
      <Header />
      {posts.map((post: Post) => {
        return (
          <article key={`post-${post.slug}`}>
            <Link to={`${slugToTitle(post.slug)}`}>
              <h2>{post.frontmatter.title}</h2>
            </Link>
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
