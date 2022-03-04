import React from 'react';

const Pill = ({ children }) => (
  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
    {children}
  </span>
);

export default Pill;
