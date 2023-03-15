import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getCatalog } from '@state/selectors/catalog';
import { getLastExecution } from '@state/selectors/lastExecutions';
import { getCluster, getClusterHostNames } from '@state/selectors/cluster';
import { updateCatalog } from '@state/actions/catalog';
import {
  updateLastExecution,
  executionRequested,
} from '@state/actions/lastExecutions';
import {
  RUNNING_EXECUTION_STATE,
  REQUESTED_EXECUTION_STATE,
  RUNNING_STATES,
} from '@state/lastExecutions';
import ExecutionResults from './ExecutionResults';

function ExecutionResultsPage() {
  const { clusterID } = useParams();
  const dispatch = useDispatch();
  const hostnames = useSelector(getClusterHostNames(clusterID));
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
      clusterName={cluster?.name}
      clusterScenario={cluster?.type}
      cloudProvider={cluster?.provider}
      onCatalogRefresh={() => dispatch(updateCatalog())}
      onLastExecutionUpdate={() => dispatch(updateLastExecution(clusterID))}
      catalogLoading={catalogLoading}
      catalog={catalog}
      catalogError={catalogError}
      executionLoading={executionLoading}
      executionStarted={executionData?.status !== REQUESTED_EXECUTION_STATE}
      executionRunning={RUNNING_STATES.includes(executionData?.status)}
      executionData={executionData}
      executionError={executionError}
      clusterSelectedChecks={cluster?.selected_checks}
      onStartExecution={(clusterId, hosts, selectedChecks, navigate) =>
        dispatch(executionRequested(clusterId, hosts, selectedChecks, navigate))
      }
    />
  );
}

export default ExecutionResultsPage;
