import styled from '@emotion/styled';
import { graphql, Link, useStaticQuery } from 'gatsby';
import React from 'react';

const ButtonWrapper = styled.ul`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 1rem;
  margin: 0;
  list-style-type: none;
`;
const Button = styled.li`
  padding: 0.5rem 1rem;
  background-color: lightgrey;
  color: white;
  font-size: 1rem;
  border-radius: 4px;
`;
const Home = styled.li`
  flex: 1;
`;

const StyledLink = styled((props) => <Link {...props} />)`
  color: black;
  text-decoration: none;
`;

function Navbar() {
  const data = useStaticQuery(graphql`
    query SiteInfo {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  const { title } = data.site.siteMetadata;
  return (
    <nav>
      <ButtonWrapper>
        <Home>
          <StyledLink to="/">{title}</StyledLink>
        </Home>
        <Button>
          <StyledLink to="/about">About</StyledLink>
        </Button>
        <Button>
          <StyledLink to="/posts">Posts</StyledLink>
        </Button>
      </ButtonWrapper>
    </nav>
  );
}

export default Navbar;
