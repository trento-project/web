import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getCluster } from '@state/selectors';

import BackButton from '@components/BackButton';
import { getClusterName } from '@components/ClusterLink';
import { ClusterInfoBox } from '@components/ClusterDetails';
import WarningBanner from '@components/Banners/WarningBanner';
import ChecksSelectionNew from './ChecksSelectionNew';
import { UNKNOWN_PROVIDER } from './ClusterSettings';

export function ClusterSettingsNew() {
  const { clusterID } = useParams();

  const cluster = useSelector(getCluster(clusterID));

  if (!cluster) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full px-2 sm:px-0">
      <BackButton url={`/clusters_new/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      <div className="flex mb-2">
        <h1 className="text-3xl w-1/2">
          <span className="font-medium">Checks Selection for </span>{' '}
          <span className="font-bold truncate w-60 inline-block align-top">
            {getClusterName(cluster)}
          </span>
        </h1>
      </div>
      <ClusterInfoBox haScenario={cluster.type} provider={cluster.provider} />
      {cluster.provider === UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following catalog is valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      <ChecksSelectionNew clusterId={clusterID} cluster={cluster} />
    </div>
  );
}
