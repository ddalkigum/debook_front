import React from 'react';
import styled from 'styled-components';
import { config } from '../../config';

const Block = styled.div`
  width: 100%;
  height: auto;
  min-height: 100vh;
  display: flex;
  text-align: center;
  align-items: center;
`;

const Inner = styled.div`
  width: 100%;
  height: auto;

  img {
    width: 4rem;
    height: 4rem;
    margin-bottom: 2rem;
  }
`;

const NotFound = () => {
  return (
    <Block>
      <Inner>
        <img src={config.image.iconLarge} />
        <h2>페이지를 찾을 수 없습니다</h2>
      </Inner>
    </Block>
  );
};

export default NotFound;
