import { graphql } from 'gatsby';
import * as React from 'react';

const IndexPage = ({ data }) => {
  console.log(data);
  const posts = data.allMdx.nodes;
  return (
    <main>
      <h1>성화 블로그</h1>
      {posts.map((post) => {
        return (
          <article key={`post-${post.slug}`}>
            <h2>{post.frontmatter.title}</h2>
          </article>
        );
      })}
    </main>
  );
};

export default IndexPage;

export const query = graphql`
  query Posts {
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
