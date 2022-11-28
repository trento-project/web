import React from 'react';

import { Link } from 'react-router-dom';

function SapSystemLink({ systemType, sapSystemId, children }) {
  return (
    <Link
      key={sapSystemId}
      className="text-jungle-green-500 hover:opacity-75"
      to={`/${systemType}/${sapSystemId}`}
    >
      {children}
    </Link>
  );
}

export default SapSystemLink;
