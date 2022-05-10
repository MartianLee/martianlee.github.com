import styled from '@emotion/styled';
import React from 'react';
import colors from './colors';

const ReferenceWrapper = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  @media (max-width: 425px) {
    grid-template-columns: none;
    grid-template-rows: repeat(3, 1fr);
  }
  gap: 1rem;
`;
const ReferenceCard = styled.button`
  flex: 1;
  width: 100%;
  padding: 1rem;
  text-align: center;
  border: 1px solid ${colors.keyColor2};
  border-radius: 4px;
  font-size: 1rem;
`;

const A = styled.a`
  color: ${colors.keyColor1};
  text-decoration: none;
`;

function Reference() {
  return (
    <ReferenceWrapper>
      <A href="https://tomorrowuse.com" target={'_blank'}>
        <ReferenceCard>내일의쓰임</ReferenceCard>
      </A>
      <A href="https://miso.kr" target={'_blank'}>
        <ReferenceCard>MISO</ReferenceCard>
      </A>
      <A href="https://fumi.co.kr/" target={'_blank'}>
        <ReferenceCard>FUMI</ReferenceCard>
      </A>
    </ReferenceWrapper>
  );
}

export default Reference;
