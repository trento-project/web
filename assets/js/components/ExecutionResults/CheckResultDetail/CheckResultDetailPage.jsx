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
  RUNNING_EXECUTION_STATE,
  REQUESTED_EXECUTION_STATE,
  RUNNING_STATES,
} from '@state/lastExecutions';
import ExecutionContainer from '@components/ExecutionResults/ExecutionContainer';
import ResultsContainer from '@components/ExecutionResults/ResultsContainer';
import CheckResultDetail from './CheckResultDetail';
import { getCheckDescription } from '../checksUtils';
import CheckDetailHeader from './CheckDetailHeader';

function CheckResultDetailPage() {
  const { clusterID, checkID, targetType, targetName } = useParams();

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
    dispatch(updateCatalog());
  }, []);

  useEffect(() => {
    if (executionData?.status !== RUNNING_EXECUTION_STATE) {
      dispatch(updateLastExecution(clusterID));
    }
  }, []);

  if (!cluster) {
    return <div>Loading...</div>;
  }

  const checkDescription = getCheckDescription(catalog, checkID);

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
        hosts={hostnames.map((item) => item.id)}
        onContentRefresh={() => {
          if (catalogError) {
            dispatch(updateCatalog());
          }
          if (executionError) {
            dispatch(updateLastExecution(clusterID));
          }
        }}
        onStartExecution={(clusterId, hosts, selectedChecks, navigate) =>
          dispatch(
            executionRequested(clusterId, hosts, selectedChecks, navigate)
          )
        }
      >
        <CheckResultDetail
          clusterID={clusterID}
          checkID={checkID}
          checkDescription={checkDescription}
          targetType={targetType}
          targetName={targetName}
          executionData={executionData}
        />
      </ResultsContainer>
    </ExecutionContainer>
  );
}

export default CheckResultDetailPage;
