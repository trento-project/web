import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setSelectedFilters } from '@state/checksResultsFilters';
import { getSelectedFilters } from '@state/selectors/checksResultsFilters';
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
import LoadingBox from '@components/LoadingBox';
import ExecutionResults from './ExecutionResults';

function ExecutionResultsPage() {
  const { clusterID } = useParams();
  const dispatch = useDispatch();

  const {
    clusterHosts,
    cluster,
    catalog: { loading: catalogLoading, data: catalog, error: catalogError },
    lastExecution: {
      data: executionData,
      error: executionError,
      loading: executionLoading,
    },
  } = useSelector(getLastExecutionData(clusterID));

  const savedFilters = useSelector(getSelectedFilters(clusterID));

  const cloudProvider = cluster?.provider;

  useEffect(() => {
    if (cloudProvider) {
      dispatch(updateCatalog({ provider: cloudProvider }));
    }
    if (!executionData) {
      dispatch(updateLastExecution(clusterID));
    }
  }, [cloudProvider]);

  if (!cluster) {
    return <LoadingBox text="Loading ..." />;
  }

  return (
    <ExecutionResults
      clusterID={clusterID}
      clusterHosts={clusterHosts}
      clusterName={cluster?.name}
      clusterScenario={cluster?.type}
      cloudProvider={cloudProvider}
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
      savedFilters={savedFilters}
      onStartExecution={(clusterId, hosts, selectedChecks, navigate) =>
        dispatch(executionRequested(clusterId, hosts, selectedChecks, navigate))
      }
      onSaveFilters={(filters) =>
        dispatch(setSelectedFilters({ resourceID: clusterID, filters }))
      }
    />
  );
}

export default ExecutionResultsPage;
