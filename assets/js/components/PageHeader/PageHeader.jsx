import React from 'react';

function PageHeader({ children }) {
  return <h1 className="text-3xl pb-2 truncate w-3/4">{children}</h1>;
}

export default PageHeader;
