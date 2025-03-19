import React from 'react';

import { Link } from 'react-router-dom';
import classNames from 'classnames';

import { isValidClusterType } from '@lib/model/clusters';

export const getClusterName = (cluster) => cluster?.name || cluster?.id;

function ClusterLink({ cluster }) {
  const clusterName = getClusterName(cluster);
  const truncatedClasses = classNames(
    'truncate w-32 inline-block align-middle'
  );

  if (isValidClusterType(cluster?.type)) {
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
