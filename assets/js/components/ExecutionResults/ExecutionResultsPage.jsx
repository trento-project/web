import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getCatalog } from '@state/selectors/catalog';
import { getLastExecution } from '@state/selectors/lastExecutions';
import { getCluster } from '@state/selectors';
import { updateLastExecution } from '@state/actions/lastExecutions';
import ExecutionResults from './ExecutionResults';

function ExecutionResultsPage() {
  const { clusterID } = useParams();
  const dispatch = useDispatch();
  const hostnames = useSelector((state) =>
    state.hostsList.hosts
      .filter(({ cluster_id: hostClusterID }) => hostClusterID === clusterID)
      .map(({ id, hostname }) => ({ id, hostname }))
  );
  const cluster = useSelector(getCluster(clusterID));

  const {
    loading: catalogLoading,
    data: catalog,
    error: catalogError,
  } = useSelector(getCatalog());
  const lastExecution = useSelector(getLastExecution(clusterID));

  if (!lastExecution) {
    return (
      <h1 className="font-light font-sans text-center text-4xl text-gray-700">
        No completed executions yet
      </h1>
    );
  }

  const {
    loading: executionLoading,
    data: executionData,
    error: executionError,
  } = lastExecution;

  return (
    <ExecutionResults
      clusterID={clusterID}
      hostnames={hostnames}
      clusterName={cluster?.name}
      cloudProvider={cluster?.provider}
      onCatalogRefresh={() => {
        dispatch({
          type: 'UPDATE_CATALOG',
          payload: { provider: cluster?.provider },
        });
      }}
      onLastExecutionUpdate={() => dispatch(updateLastExecution(clusterID))}
      catalogLoading={catalogLoading}
      catalog={catalog}
      catalogError={catalogError}
      executionData={executionLoading}
      ecutionData={executionData}
      executionError={executionError}
    />
  );
}

export default ExecutionResultsPage;
