import styled from '@emotion/styled';
import React from 'react';
import Navbar from '../navigation/Navbar';
import SEO from './Seo';

const LayoutWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;
const Main = styled.main`
  padding: calc(4rem - 3px) 1rem 4rem;
`;
const Footer = styled.footer`
  text-align: center;
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
        <div>This blog is developed by Gatsby and Copyright by @MartianLee</div>
      </Footer>
    </LayoutWrapper>
  );
}
