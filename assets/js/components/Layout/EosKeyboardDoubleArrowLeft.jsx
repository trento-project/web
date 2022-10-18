import React from 'react';

const EosKeyboardDoubleArrowLeft = ({ className, flip }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      transform={flip && 'scale(-1,1)'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.41 16.59L6.83 12L11.41 7.41L10 6L4 12L10 18L11.41 16.59Z" />
      <path d="M17.41 16.59L12.83 12L17.41 7.41L16 6L10 12L16 18L17.41 16.59Z" />
    </svg>
  );
};

export default EosKeyboardDoubleArrowLeft;
