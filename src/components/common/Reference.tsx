import styled from '@emotion/styled';
import React from 'react';
import colors from './colors';

const ReferenceWrapper = styled.section``;
const ReferenceCard = styled.button`
  flex: 1;
  width: 100%;
  padding: 1rem;
  text-align: center;
  border: 1px solid ${colors.keyColor2};
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
`;

const A = styled.a`
  color: ${colors.keyColor1};
  text-decoration: none;
`;
const Current = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr 1fr;
  @media (max-width: 425px) {
    grid-template-columns: none;
    grid-template-rows: repeat(3, 1fr);
  }
  gap: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  align-items: center; ;
`;

function Reference() {
  return (
    <ReferenceWrapper>
      <Current>
        현재
        <A href="https://tomorrowuse.com" target={'_blank'}>
          <ReferenceCard>내일의쓰임</ReferenceCard>
        </A>
      </Current>
      <Current>
        과거
        <A href="https://miso.kr" target={'_blank'}>
          <ReferenceCard>MISO</ReferenceCard>
        </A>
        <A href="https://fumi.co.kr/" target={'_blank'}>
          <ReferenceCard>FUMI</ReferenceCard>
        </A>
      </Current>
    </ReferenceWrapper>
  );
}

export default Reference;
