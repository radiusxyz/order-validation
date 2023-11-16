import React from 'react';
import { styled } from 'styled-components';

const IconWrapper = styled.div`
  color: #fff;
  width: 24px;
  height: auto;
  align-items: center;
  &:hover {
    cursor: pointer;
  }
`;

const PlayPause = ({ isPlaying, onClick }) => {
  return isPlaying ? (
    <IconWrapper onClick={onClick}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='orange'
        strokeWidth={1.5}
        stroke='currentColor'
        className='w-6 h-6'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
    </IconWrapper>
  ) : (
    <IconWrapper>
      <svg
        onClick={onClick}
        xmlns='http://www.w3.org/2000/svg'
        fill='green'
        viewBox='0 0 24 24'
        strokeWidth={1.5}
        stroke='currentColor'
        className='w-6 h-6'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z'
        />
      </svg>
    </IconWrapper>
  );
};

export default PlayPause;
