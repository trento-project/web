import React, { useEffect } from 'react';
import { find, get, some } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getLastExecutionData } from '@state/selectors/lastExecutions';
import { updateCatalog } from '@state/actions/catalog';

import LoadingBox from '@components/LoadingBox';
import { TARGET_CLUSTER, TARGET_HOST, isValidTargetType } from '@lib/model';

import {
  updateLastExecution,
  executionRequested,
  hostExecutionRequested,
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
  isTargetCluster,
  getClusterCheckResults,
} from '../checksUtils';
import CheckDetailHeader from './CheckDetailHeader';

const isValidCheckID = (executionData, checkID) =>
  some(executionData?.check_results, { check_id: checkID });

const validateResultTargetName = (
  target,
  targetHosts,
  resultTargetType,
  resultTargetName
) => {
  switch (resultTargetType) {
    case TARGET_HOST:
      return some(targetHosts, { hostname: resultTargetName });
    case TARGET_CLUSTER:
      return resultTargetName === target.name;
    default:
      return false;
  }
};

const getResultTargetID = (
  targetID,
  targetHosts,
  resultTargetName,
  resultTargetType
) => {
  switch (resultTargetType) {
    case TARGET_HOST:
      return get(find(targetHosts, { hostname: resultTargetName }), 'id');
    case TARGET_CLUSTER:
      return targetID;
    default:
      return null;
  }
};

function CheckResultDetailPage({ targetType }) {
  const { targetID, checkID, resultTargetType, resultTargetName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  const clustersIDList = useSelector((state) =>
    state.clustersList.clusters.map(({ id }) => id)
  );
  const hostsIDList = useSelector((state) =>
    state.hostsList.hosts.map(({ id }) => id)
  );

  useEffect(() => {
    if (catalog.length === 0) {
      dispatch(updateCatalog());
    }
    if (!executionData) {
      dispatch(updateLastExecution(targetID));
    }
  }, []);

  const isHostExecution = isTargetHost(targetType);
  const isClusterExecution = isTargetCluster(targetType);

  if (
    isClusterExecution &&
    !clustersIDList.includes(targetID) &&
    clustersIDList.length > 0
  ) {
    return (
      <NotFound
        buttonText="Go back to clusters overview"
        onNavigate={() => navigate('/clusters')}
      />
    );
  }

  if (
    isHostExecution &&
    !hostsIDList.includes(targetID) &&
    hostsIDList.length > 0
  ) {
    return (
      <NotFound
        buttonText="Go back to hosts overview"
        onNavigate={() => navigate('/hosts')}
      />
    );
  }

  if (!target || !executionData || executionData.status === 'running') {
    return (
      <div>
        <LoadingBox text="Loading..." />
      </div>
    );
  }

  const isValidTargetID = target.id === targetID;
  const isValidResultTargetName = validateResultTargetName(
    target,
    targetHosts,
    isHostExecution ? TARGET_HOST : resultTargetType,
    resultTargetName
  );

  if (
    !isValidTargetID ||
    !isValidTargetType(resultTargetType) ||
    !isValidResultTargetName ||
    !isValidCheckID(executionData, checkID)
  ) {
    return (
      <NotFound
        buttonText="Go back to last execution"
        onNavigate={() => {
          if (isClusterExecution) {
            return navigate(`/clusters/${targetID}/executions/last`);
          }
          if (isHostExecution) {
            return navigate(`/hosts/${targetID}/executions/last`);
          }
          return null;
        }}
      />
    );
  }

  const checkDescription = getCheckDescription(catalog, checkID);

  const resultTargetID = getResultTargetID(
    targetID,
    targetHosts,
    resultTargetName,
    resultTargetType
  );

  return (
    <ExecutionContainer
      catalogLoading={catalogLoading}
      executionLoading={executionLoading}
      executionStarted={executionData?.status !== REQUESTED_EXECUTION_STATE}
      executionRunning={RUNNING_STATES.includes(executionData?.status)}
    >
      <CheckDetailHeader
        checkID={checkID}
        checkDescription={checkDescription}
        targetID={targetID}
        targetType={targetType}
        resultTargetType={resultTargetType}
        resultTargetName={resultTargetName}
        cloudProvider={target.provider}
        result={getClusterCheckResults(executionData, checkID)?.result}
      />
      <ResultsContainer
        error={catalogError || executionError}
        errorContent={[
          catalogError ? `Failed loading catalog: ${catalogError}` : null,
          executionError ? `Failed loading execution: ${executionError}` : null,
        ]}
        targetID={targetID}
        hasAlreadyChecksResults={!!(executionData || executionLoading)}
        selectedChecks={target.selected_checks}
        hosts={targetHosts.map(getHostID)}
        onContentRefresh={() => {
          if (catalogError) {
            dispatch(updateCatalog());
          }
          if (executionError) {
            dispatch(updateLastExecution(targetID));
          }
        }}
        onStartExecution={(targetId, hosts, selectedChecks, onNavigate) => {
          isTargetHost(targetType) &&
            dispatch(
              hostExecutionRequested(target, selectedChecks, onNavigate)
            );
          isTargetCluster(targetType) &&
            dispatch(
              executionRequested(targetId, hosts, selectedChecks, onNavigate)
            );
        }}
      >
        <CheckResultDetail
          checkID={checkID}
          expectations={getCheckExpectations(catalog, checkID)}
          targetID={resultTargetID}
          targetType={resultTargetType}
          executionData={executionData}
          clusterHosts={targetHosts}
        />
      </ResultsContainer>
    </ExecutionContainer>
  );
}

export default CheckResultDetailPage;
