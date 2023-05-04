import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getLastExecutionData } from '@state/selectors/lastExecutions';
import { updateCatalog } from '@state/actions/catalog';

import LoadingBox from '@components/LoadingBox';
import { isValidTargetType } from '@lib/model';

import {
  updateLastExecution,
  executionRequested,
} from '@state/actions/lastExecutions';
import {
  REQUESTED_EXECUTION_STATE,
  RUNNING_STATES,
} from '@state/lastExecutions';
import { getHostID } from '@state/selectors/cluster';
import ExecutionContainer from '@components/ExecutionResults/ExecutionContainer';
import NotFound from '@components/NotFound';
import ResultsContainer from '@components/ExecutionResults/ResultsContainer';
import CheckResultDetail from './CheckResultDetail';

import {
  getCheckDescription,
  getCheckExpectations,
  isTargetHost,
  getClusterCheckResults,
} from '../checksUtils';
import CheckDetailHeader from './CheckDetailHeader';

function CheckResultDetailPage() {
  const { clusterID, checkID, targetType, targetName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  const clustersIDList = useSelector((state) =>
    state.clustersList.clusters.map((clusterObj) => clusterObj.id)
  );

  useEffect(() => {
    if (catalog.length === 0) {
      dispatch(updateCatalog());
    }
    if (!executionData) {
      dispatch(updateLastExecution(clusterID));
    }
  }, []);

  if (!clustersIDList.includes(clusterID) && clustersIDList.length > 0) {
    return (
      <NotFound
        buttonText="Go back to cluster overview"
        onNavigate={() => navigate('/clusters/')}
      />
    );
  }

  if (!cluster || !executionData || executionData.status === 'running') {
    return (
      <div>
        <LoadingBox text="Loading..." />
      </div>
    );
  }

  const targetHost = isTargetHost(targetType);
  const validClusterID = cluster.id === clusterID;
  const validTarget =
    isValidTargetType(targetType) &&
    (targetHost
      ? clusterHosts.some(({ hostname }) => hostname === targetName)
      : targetName === cluster.name);

  const validCheckID = executionData?.check_results.some(
    ({ check_id }) => check_id === checkID
  );

  if (!validClusterID || !validTarget || !validCheckID) {
    return (
      <NotFound
        buttonText="Go back to last execution"
        onNavigate={() => navigate(`/clusters/${clusterID}/executions/last`)}
      />
    );
  }

  const checkDescription = getCheckDescription(catalog, checkID);

  const targetID = isTargetHost(targetType)
    ? (clusterHosts.find(({ hostname }) => hostname === targetName) || {})?.id
    : clusterID;

  return (
    <ExecutionContainer
      catalogLoading={catalogLoading}
      executionLoading={executionLoading}
      executionStarted={executionData?.status !== REQUESTED_EXECUTION_STATE}
      executionRunning={RUNNING_STATES.includes(executionData?.status)}
    >
      <CheckDetailHeader
        clusterID={clusterID}
        checkID={checkID}
        checkDescription={checkDescription}
        targetType={targetType}
        targetName={targetName}
        cloudProvider={cluster?.provider}
        result={getClusterCheckResults(executionData, checkID)?.result}
      />
      <ResultsContainer
        error={catalogError || executionError}
        errorContent={[
          catalogError ? `Failed loading catalog: ${catalogError}` : null,
          executionError ? `Failed loading execution: ${executionError}` : null,
        ]}
        clusterID={clusterID}
        hasAlreadyChecksResults={!!(executionData || executionLoading)}
        selectedChecks={cluster?.selected_checks}
        hosts={clusterHosts.map(getHostID)}
        onContentRefresh={() => {
          if (catalogError) {
            dispatch(updateCatalog());
          }
          if (executionError) {
            dispatch(updateLastExecution(clusterID));
          }
        }}
        onStartExecution={(clusterId, hosts, selectedChecks, onNavigate) =>
          dispatch(
            executionRequested(clusterId, hosts, selectedChecks, onNavigate)
          )
        }
      >
        <CheckResultDetail
          checkID={checkID}
          expectations={getCheckExpectations(catalog, checkID)}
          targetID={targetID}
          targetType={targetType}
          executionData={executionData}
          clusterHosts={clusterHosts}
        />
      </ResultsContainer>
    </ExecutionContainer>
  );
}

export default CheckResultDetailPage;
