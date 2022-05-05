import React from 'react';

import { Link } from 'react-router-dom';

const truncatedLength = 14; // Using 14 as it cuts the uuid format after the 2nd -
export const getClusterName = (cluster) => {
  return cluster?.name || cluster?.id.slice(0, truncatedLength) + '...';
};

const ClusterLink = ({ cluster }) => {
  const clusterName = getClusterName(cluster);

  if (cluster?.type == 'hana_scale_up' || cluster?.type == 'hana_scale_out') {
    return (
      <Link
        className="text-jungle-green-500 hover:opacity-75"
        to={`/clusters/${cluster.id}`}
      >
        {clusterName}
      </Link>
    );
  }

  return <span>{clusterName}</span>;
};

export default ClusterLink;
