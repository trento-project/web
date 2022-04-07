import React from 'react';

import { Link } from 'react-router-dom';

const ClusterLink = ({ cluster, children }) => {
  if (cluster?.type == 'hana_scale_up' || cluster?.type == 'hana_scale_out') {
    return (
      <Link
        className="text-jungle-green-500 hover:opacity-75"
        to={`/clusters/${cluster.id}`}
      >
        {children}
      </Link>
    );
  }

  return <span>{children}</span>;
};

export default ClusterLink;
