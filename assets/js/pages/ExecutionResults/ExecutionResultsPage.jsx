import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setSelectedFilters } from '@state/checksResultsFilters';
import { getSelectedFilters } from '@state/selectors/checksResultsFilters';
import { getLastExecutionData } from '@state/selectors/lastExecutions';
import { updateCatalog } from '@state/catalog';

import {
  REQUESTED_EXECUTION_STATE,
  RUNNING_STATES,
  updateLastExecution,
  executionRequested,
  hostExecutionRequested,
} from '@state/lastExecutions';
import LoadingBox from '@common/LoadingBox';
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
  const hostArch = target?.arch;

  useEffect(() => {
    if (cloudProvider) {
      dispatch(
        updateCatalog({
          provider: cloudProvider,
          arch: target.arch,
          target_type: targetType,
          ...(clusterType ? { cluster_type: clusterType } : {}),
          ...(isHost && hostArch ? { arch: hostArch } : {}),
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
      onStartExecution={(targetId, hosts, selectedChecks) => {
        isHost && dispatch(hostExecutionRequested(target, selectedChecks));
        isCluster &&
          dispatch(executionRequested(targetId, hosts, selectedChecks));
      }}
      onSaveFilters={(filters) =>
        dispatch(setSelectedFilters({ resourceID: targetID, filters }))
      }
    />
  );
}

export default ExecutionResultsPage;
