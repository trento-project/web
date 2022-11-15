import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import ExecutionResults from './ExecutionResults';

const ExecutionResultsPage = () => {
  const { clusterID, executionID } = useParams();
  const dispatch = useDispatch();
  const hostnames = useSelector((state) =>
    state.hostList.hosts.map(({ id, hostname }) => ({ id, hostname }))
  );
  const { name: clusterName, provider: clusterCloudProvider } = useSelector(
    (state) => state.clustersList.find((cluster) => cluster.id === clusterID)
  );

  return (
    <ExecutionResults
      clusterID={clusterID}
      executionID={executionID}
      hostnames={hostnames}
      clusterName={clusterName}
      onCatalogRefresh={() => {
        dispatch({
          type: 'UPDATE_CATALOG',
          payload: { provider: clusterCloudProvider },
        });
      }}
    />
  );
};

export default ExecutionResultsPage;
