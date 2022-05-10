import styled from '@emotion/styled';
import { graphql, Link, useStaticQuery } from 'gatsby';
import React from 'react';
import colors from '../common/colors';

const Navigation = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 960px;
  background: ${colors.white};
  border-bottom: 1px solid ${colors.keyColor2};
`;
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
  font-weight: 500;
`;
const Home = styled.li`
  font-weight: 700;
  flex: 1;
  color: ${colors.keyColor3};
`;

const StyledLink = styled((props) => <Link {...props} />)`
  color: ${colors.keyColor3};
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
    <Navigation>
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
    </Navigation>
  );
}

export default Navbar;
