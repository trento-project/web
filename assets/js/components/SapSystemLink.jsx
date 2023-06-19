import React from 'react';

import { Link } from 'react-router-dom';

function SapSystemLink({ systemType, sapSystemId, children }) {
  return sapSystemId ? (
    <Link
      key={sapSystemId}
      className="text-jungle-green-500 hover:opacity-75"
      to={`/${systemType}/${sapSystemId}`}
    >
      {children}
    </Link>
  ) : (
    <span>{children}</span>
  );
}

export default SapSystemLink;
