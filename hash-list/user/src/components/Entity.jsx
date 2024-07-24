import React from 'react';
import styled from 'styled-components';
import Timeline from './Timeline';

const Main = styled.div`
  position: relative;
  height: 90%;
`;
const Sub = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 80px;
  width: 100px;
  font-weight: bold;
  background: #4661e6;
  border-radius: 10px;
`;

const Title = styled.span`
  font-size: 16px;
  color: #fff;
  text-transform: uppercase;
`;

const Entity = ({ children }) => {
  return (
    <Main>
      <Sub>
        <Title>{children}</Title>
      </Sub>
      <Timeline />
    </Main>
  );
};

export default Entity;
