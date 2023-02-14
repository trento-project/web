import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getCatalog } from '@state/selectors/catalog';
import { getLastExecution } from '@state/selectors/lastExecutions';
import { getCluster } from '@state/selectors/cluster';
import { updateCatalog } from '@state/actions/catalog';
import {
  updateLastExecution,
  executionRequested,
} from '@state/actions/lastExecutions';
import {
  RUNNING_EXECUTION_STATE,
  REQUESTED_EXECUTION_STATE,
} from '@state/lastExecutions';
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

  useEffect(() => {
    dispatch(updateCatalog());
  }, []);

  useEffect(() => {
    if (lastExecution?.data?.status !== RUNNING_EXECUTION_STATE) {
      dispatch(updateLastExecution(clusterID));
    }
  }, []);

  if (!cluster) {
    return <div>Loading...</div>;
  }

  const {
    data: executionData,
    error: executionError,
    loading: executionLoading,
  } = lastExecution || {};
  return (
    <ExecutionResults
      clusterID={clusterID}
      hostnames={hostnames}
      executionStarted={executionData?.status !== REQUESTED_EXECUTION_STATE}
      clusterName={cluster?.name}
      clusterScenario={cluster?.type}
      cloudProvider={cluster?.provider}
      onCatalogRefresh={() => dispatch(updateCatalog())}
      onLastExecutionUpdate={() => dispatch(updateLastExecution(clusterID))}
      catalogLoading={catalogLoading}
      catalog={catalog}
      catalogError={catalogError}
      executionLoading={executionLoading}
      executionData={executionData}
      executionError={executionError}
      clusterSelectedChecks={cluster?.selected_checks}
      onStartExecution={(clusterId, hosts, selectedChecks) =>
        dispatch(executionRequested(clusterId, hosts, selectedChecks))
      }
    />
  );
}

export default ExecutionResultsPage;
