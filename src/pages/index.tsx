import * as React from 'react';
import styled from '@emotion/styled';
import { graphql, Link } from 'gatsby';
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

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #222222;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  border-radius: 4px;
`;

const Warning = styled.div`
  text-align: center;
  font-size: 2rem;
`;
const Contents = styled.div`
  padding: 0 1rem;
`;

const StyledLink = styled((props) => <Link {...props} />)`
  color: ${colors.keyColor1};
`;

const IndexPage = ({ data }) => {
  const posts = data.allMdx.nodes;
  return (
    <Layout>
      <Header />
      <Contents>
        <h2>최근 글</h2>
        {posts.map((post: Post) => {
          return (
            <article key={`post-${post.frontmatter.slug}`}>
              <StyledLink to={`posts/${slugToTitle(post.frontmatter.slug)}`}>
                <h3>{post.frontmatter.title}</h3>
              </StyledLink>
            </article>
          );
        })}
        <StyledLink to="/posts">
          <Button>더 보기</Button>
        </StyledLink>
      </Contents>
    </Layout>
  );
};

export default IndexPage;

export const query = graphql`
  query Posts {
    allMdx(sort: { frontmatter: { date: DESC } }, limit: 5) {
      nodes {
        frontmatter {
          slug
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
