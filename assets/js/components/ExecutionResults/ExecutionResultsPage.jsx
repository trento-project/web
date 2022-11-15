import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import ExecutionResults from './ExecutionResults';

const ExecutionResultsPage = () => {
  const { clusterID, executionID } = useParams();
  const dispatch = useDispatch();
  const hostnames = useSelector((state) =>
    state.hostsList.hosts.map(({ id, hostname }) => ({ id, hostname }))
  );
  const cluster = useSelector((state) =>
    state.clustersList.clusters.find((cluster) => cluster.id === clusterID)
  );

  return (
    <ExecutionResults
      clusterID={clusterID}
      executionID={executionID}
      hostnames={hostnames}
      clusterName={cluster?.name}
      onCatalogRefresh={() => {
        dispatch({
          type: 'UPDATE_CATALOG',
          payload: { provider: cluster?.provider },
        });
      }}
    />
  );
};

export default ExecutionResultsPage;
