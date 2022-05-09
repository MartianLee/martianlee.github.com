import styled from '@emotion/styled';
import React from 'react';
import colors from './colors';

const HeaderWrapper = styled.header`
  text-align: center;
  background: repeating-linear-gradient(
    -20deg,
    ${colors.keyColor1},
    ${colors.keyColor2} 20%,
    ${colors.keyColor3} 20%,
    ${colors.keyColor4} 40%
  );
  padding: 1rem;
  margin: 0 -1rem;
`;
const HeaderText = styled.h1`
  color: ${colors.white};
  font-weight: bold;
  -webkit-text-stroke: 0.5px ${colors.keyColor1};
`;

function Header() {
  return (
    <HeaderWrapper>
      <HeaderText>Welcome to MartianLee's Blog</HeaderText>
    </HeaderWrapper>
  );
}

export default Header;
