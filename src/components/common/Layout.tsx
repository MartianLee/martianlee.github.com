import styled from '@emotion/styled';
import React from 'react';
import Navbar from '../navigation/Navbar';
import colors from './colors';
import SEO from './Seo';

const LayoutWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;
const Main = styled.main`
  padding: calc(4rem + 5px) 0 3rem;
`;
const Footer = styled.footer`
  text-align: center;
  padding: 2rem 1rem 3rem 1rem;
  border-top: 1px solid ${colors.keyColor2};
`;

export default function Layout({ children }) {
  return (
    <LayoutWrapper>
      <SEO
        title={undefined}
        description={undefined}
        image={undefined}
        slug={undefined}
      />
      <Navbar />
      <Main>{children}</Main>
      <Footer>
        <div>
          This blog is developed by Gatsby and Copyright by&nbsp;
          <a href="https://github.com/MartianLee">@MartianLee</a>
        </div>
      </Footer>
    </LayoutWrapper>
  );
}
