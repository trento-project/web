import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLastExecutionData } from '@state/selectors/lastExecutions';
import { updateCatalog } from '@state/actions/catalog';
import {
  updateLastExecution,
  executionRequested,
} from '@state/actions/lastExecutions';
import {
  REQUESTED_EXECUTION_STATE,
  RUNNING_STATES,
} from '@state/lastExecutions';
import ExecutionResults from './ExecutionResults';

function ExecutionResultsPage() {
  const { clusterID } = useParams();
  const dispatch = useDispatch();

  const {
    hostnames,
    cluster,
    catalog: { loading: catalogLoading, data: catalog, error: catalogError },
    lastExecution: {
      data: executionData,
      error: executionError,
      loading: executionLoading,
    },
  } = useSelector(getLastExecutionData(clusterID));

  useEffect(() => {
    if (catalog.length === 0) {
      dispatch(updateCatalog());
    }
    if (!executionData) {
      dispatch(updateLastExecution(clusterID));
    }
  }, []);

  if (!cluster) {
    return <div>Loading...</div>;
  }

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
