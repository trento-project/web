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
  hostExecutionRequested,
} from '@state/actions/lastExecutions';

import {
  REQUESTED_EXECUTION_STATE,
  RUNNING_STATES,
} from '@state/lastExecutions';
import LoadingBox from '@components/LoadingBox';
import ExecutionResults from './ExecutionResults';
import { getTargetName, isTargetCluster, isTargetHost } from './checksUtils';

function ExecutionResultsPage({ targetType }) {
  const { targetID } = useParams();
  const dispatch = useDispatch();

  const {
    targetHosts,
    target,
    catalog: { loading: catalogLoading, data: catalog, error: catalogError },
    lastExecution: {
      data: executionData,
      error: executionError,
      loading: executionLoading,
    },
  } = useSelector((state) => getLastExecutionData(state, targetID, targetType));

  const savedFilters = useSelector(getSelectedFilters(targetID));

  const isCluster = isTargetCluster(targetType);
  const isHost = isTargetHost(targetType);

  const cloudProvider = target?.provider;
  const clusterType = isCluster ? target?.type : null;

  useEffect(() => {
    if (cloudProvider) {
      dispatch(
        updateCatalog({
          provider: cloudProvider,
          target_type: targetType,
          ...(clusterType ? { cluster_type: clusterType } : {}),
        })
      );
    }
    if (!executionData) {
      dispatch(updateLastExecution(targetID));
    }
  }, [cloudProvider]);

  if (!target) {
    return <LoadingBox text="Loading ..." />;
  }

  return (
    <ExecutionResults
      targetID={targetID}
      targetName={getTargetName(target, targetType)}
      targetType={targetType}
      target={target}
      targetHosts={targetHosts}
      onCatalogRefresh={() => dispatch(updateCatalog())}
      onLastExecutionUpdate={() => dispatch(updateLastExecution(targetID))}
      catalogLoading={catalogLoading}
      catalog={catalog}
      catalogError={catalogError}
      executionLoading={executionLoading}
      executionStarted={executionData?.status !== REQUESTED_EXECUTION_STATE}
      executionRunning={RUNNING_STATES.includes(executionData?.status)}
      executionData={executionData}
      executionError={executionError}
      targetSelectedChecks={target.selected_checks}
      savedFilters={savedFilters}
      onStartExecution={(targetId, hosts, selectedChecks, navigate) => {
        isHost &&
          dispatch(hostExecutionRequested(target, selectedChecks, navigate));
        isCluster &&
          dispatch(
            executionRequested(targetId, hosts, selectedChecks, navigate)
          );
      }}
      onSaveFilters={(filters) =>
        dispatch(setSelectedFilters({ resourceID: targetID, filters }))
      }
    />
  );
}

export default ExecutionResultsPage;
