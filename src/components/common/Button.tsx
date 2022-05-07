import styled from '@emotion/styled';
import React from 'react';

const ButtonWrapper = styled.button`
  padding: 32px;
  background-color: hotpink;
  font-size: 24px;
  border-radius: 4px;
  color: black;
  font-weight: bold;
  &:hover {
    color: white;
  }
`;

function Button({ children }) {
  return <ButtonWrapper>{children}</ButtonWrapper>;
}

export default Button;
