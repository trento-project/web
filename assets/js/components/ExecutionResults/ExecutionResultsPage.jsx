import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getCluster } from '@state/selectors';

import ExecutionResults from './ExecutionResults';

function ExecutionResultsPage() {
  const { clusterID, executionID } = useParams();
  const dispatch = useDispatch();
  const hostnames = useSelector((state) => state.hostsList.hosts
    .filter(({ cluster_id: hostClusterID }) => hostClusterID === clusterID)
    .map(({ id, hostname }) => ({ id, hostname })));
  const cluster = useSelector(getCluster(clusterID));

  return (
    <ExecutionResults
      clusterID={clusterID}
      executionID={executionID}
      hostnames={hostnames}
      clusterName={cluster?.name}
      cloudProvider={cluster?.provider}
      onCatalogRefresh={() => {
        dispatch({
          type: 'UPDATE_CATALOG',
          payload: { provider: cluster?.provider },
        });
      }}
    />
  );
}

export default ExecutionResultsPage;
