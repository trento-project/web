import React from 'react';

import { Link } from 'react-router-dom';

const HostLink = ({ hostId, children }) => {
  return (
    <span
      id={`host-${hostId}`}
      className="tn-hostname text-jungle-green-500 hover:opacity-75"
    >
      <Link to={`/hosts/${hostId}`}>{children}</Link>
    </span>
  );
};

export default HostLink;
