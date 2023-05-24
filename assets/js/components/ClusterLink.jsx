import React from 'react';

import { Link } from 'react-router-dom';
import classNames from 'classnames';

const KNOWN_TYPES = ['hana_scale_up', 'hana_scale_out', 'ascs_ers'];

export const getClusterName = (cluster) => cluster?.name || cluster?.id;

function ClusterLink({ cluster }) {
  const clusterName = getClusterName(cluster);
  const truncatedClasses = classNames(
    'truncate w-32 inline-block align-middle'
  );

  if (KNOWN_TYPES.includes(cluster?.type)) {
    return (
      <Link
        className="text-jungle-green-500 hover:opacity-75"
        to={`/clusters/${cluster.id}`}
      >
        <span className={truncatedClasses}>{clusterName}</span>
      </Link>
    );
  }

  return <span className={truncatedClasses}>{clusterName}</span>;
}

export default ClusterLink;
