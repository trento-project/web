import React from 'react';

function Arrow({ children, onClick }) {
  return (
    <div
      aria-hidden="true"
      role="button"
      className="cursor-pointer"
      onClick={() => onClick()}
    >
      {children}
    </div>
  );
}

export default Arrow;
