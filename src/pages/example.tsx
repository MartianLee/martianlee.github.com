import React from 'react';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';

type Props = {};

const example = (props: Props) => {
  return (
    <Layout>
      <Header />
      <h2>컴포넌트 예시</h2>
      <div></div>
    </Layout>
  );
};

export default example;
