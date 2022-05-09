import styled from '@emotion/styled';
import React from 'react';
import colors from './colors';

const ReferenceWrapper = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;
const ReferenceCard = styled.div`
  flex: 1;
  padding: 1rem;
  text-align: center;
  border: 1px solid ${colors.keyColor2};
  border-radius: 4px;
`;

function Reference() {
  return (
    <ReferenceWrapper>
      <a href="https://tomorrowuse.com" target={'_blank'}>
        <ReferenceCard>내일의쓰임</ReferenceCard>
      </a>
      <a href="https://miso.kr" target={'_blank'}>
        <ReferenceCard>MISO</ReferenceCard>
      </a>
      <a href="https://fumi.co.kr/" target={'_blank'}>
        <ReferenceCard>FUMI</ReferenceCard>
      </a>
    </ReferenceWrapper>
  );
}

export default Reference;
