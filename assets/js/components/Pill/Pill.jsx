import React from 'react';

const Pill = ({ className, children, onClick = () => {} }) => (
  <span
    className={`${className} px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800`}
    onClick={onClick}
  >
    {children}
  </span>
);

export default Pill;
