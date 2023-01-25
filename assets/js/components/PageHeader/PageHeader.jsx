import React from 'react';

function PageHeader({ children }) {
  return (
    <h1
      className="text-3xl pb-2"
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '700px',
        width: '700px',
        display: 'inline-block',
      }}
    >
      {children}
    </h1>
  );
}

export default PageHeader;
