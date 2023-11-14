import React from 'react';
import { styled } from 'styled-components';
import PlayPause from './PlayPause';
import axios from 'axios';

const Main = styled.div`
  background: #4661e6;
  border-radius: 3px;
  padding: 5px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-width: 200px;
`;

const Text = styled.span`
  color: #fff;
`;

const Action = ({ children, handleAction, isRunning }) => {
  return (
    <Main>
      <Text>{children}</Text>
      <PlayPause onClick={handleAction} isPlaying={isRunning} />
    </Main>
  );
};

export default Action;
