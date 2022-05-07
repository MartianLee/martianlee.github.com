import styled from '@emotion/styled';
import React from 'react';

const HeaderWrapper = styled.header`
  text-align: center;
`;

function Header() {
  return (
    <HeaderWrapper>
      <h1>Welcome to MartianLee's Blog</h1>
    </HeaderWrapper>
  );
}

export default Header;
