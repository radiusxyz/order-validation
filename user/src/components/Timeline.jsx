import React from 'react';
import { styled } from 'styled-components';

const Line = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  background: #647196;
  height: 100%;
  border-radius: 0 0 5px 5px;
`;

const Timeline = () => {
  return <Line />;
};

export default Timeline;
