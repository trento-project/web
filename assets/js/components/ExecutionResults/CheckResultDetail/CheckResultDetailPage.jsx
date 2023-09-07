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
  isTargetCluster,
  getClusterCheckResults,
} from '../checksUtils';
import CheckDetailHeader from './CheckDetailHeader';

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

  const isHostCheck = isTargetHost(resultTargetType);
  const isClusterWideCheck = isTargetCluster(resultTargetType);

  const validateTargetResult = () => {
    switch (true) {
      case isHostCheck:
        return targetHosts.some(
          ({ hostname }) => hostname === resultTargetName
        );
      case isClusterWideCheck:
        return resultTargetName === target.name;
      default:
        return false;
    }
  };
  const validTargetID = target.id === targetID;
  const validTarget =
    isValidTargetType(resultTargetType) && validateTargetResult();

  const validCheckID = executionData?.check_results.some(
    ({ check_id }) => check_id === checkID
  );

  if (!validTargetID || !validTarget || !validCheckID) {
    return (
      <NotFound
        buttonText="Go back to last execution"
        onNavigate={() => {
          switch (true) {
            case isClusterExecution:
              navigate(`/clusters/${targetID}/executions/last`);
              break;
            case isHostExecution:
              navigate(`/hosts/${targetID}/executions/last`);
              break;
            default:
          }
        }}
      />
    );
  }

  const checkDescription = getCheckDescription(catalog, checkID);

  const getResultTargetID = () => {
    switch (true) {
      case isHostCheck:
        return (
          targetHosts.find(({ hostname }) => hostname === resultTargetName) ||
          {}
        )?.id;
      case isClusterWideCheck:
        return targetID;
      default:
        return null;
    }
  };
  const resultTargetID = getResultTargetID();

  return (
    <ExecutionContainer
      catalogLoading={catalogLoading}
      executionLoading={executionLoading}
      executionStarted={executionData?.status !== REQUESTED_EXECUTION_STATE}
      executionRunning={RUNNING_STATES.includes(executionData?.status)}
    >
      <CheckDetailHeader
        clusterID={targetID}
        checkID={checkID}
        checkDescription={checkDescription}
        targetType={resultTargetType}
        targetName={resultTargetName}
        cloudProvider={target?.provider}
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
        selectedChecks={target?.selected_checks}
        hosts={targetHosts.map(getHostID)}
        onContentRefresh={() => {
          if (catalogError) {
            dispatch(updateCatalog());
          }
          if (executionError) {
            dispatch(updateLastExecution(targetID));
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
