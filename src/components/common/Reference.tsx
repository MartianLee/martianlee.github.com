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
  grid-template-columns: minmax(180px, auto) 1fr;
  @media (max-width: 526px) {
    grid-template-columns: none;
    grid-template-rows: repeat(1, 1fr);
  }
  gap: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  align-items: center; ;
`;

function Reference() {
  return (
    <ReferenceWrapper>
      <h3>현재</h3>
      <Current>
        <A href="https://tomorrowuse.com" target={'_blank'}>
          <ReferenceCard>내일의쓰임</ReferenceCard>
        </A>
        <div>Cofunder & Product Owner & Fullstack Developer</div>
      </Current>
      <h3>과거</h3>
      <Current>
        <A href="https://miso.kr" target={'_blank'}>
          <ReferenceCard>MISO</ReferenceCard>
        </A>
        <div>Frontend Developer</div>
      </Current>
      <Current>
        <A href="https://fumi.co.kr/" target={'_blank'}>
          <ReferenceCard>FUMI</ReferenceCard>
        </A>
        <div>Software Engineer</div>
      </Current>
    </ReferenceWrapper>
  );
}

export default Reference;
