import React from 'react';

function Arrow({ children, onClick, ...rest }) {
  return (
    <div
      aria-hidden="true"
      role="button"
      className="cursor-pointer"
      onClick={() => onClick()}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Arrow;
