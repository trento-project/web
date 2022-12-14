import React from 'react';
import { renderWithRouter } from '@lib/test-utils';
import {
  agentCheckResultFactory,
  checksExecutionCompletedFactory,
  checkResultFactory,
  expectationResultFactory,
} from '@lib/test-utils/factories/executions';
import { catalogFactory, hostnameFactory } from '@lib/test-utils/factories';

import ExecutionResults from './ExecutionResults';

const prepareStateData = (checkExecutionStatus) => {
  const hostnames = hostnameFactory.buildList(2);
  const [{ id: agentID1 }, { id: agentID2 }] = hostnames;
  const agent1 = agentCheckResultFactory.build({ agent_id: agentID1 });
  const agent2 = agentCheckResultFactory.build({ agent_id: agentID2 });
  const agents = [agent1, agent2];
  const checkResults = checkResultFactory.buildList(1, {
    agents_check_results: [agent1, agent2],
  });
  const executionResult = checksExecutionCompletedFactory.build({
    check_results: checkResults,
    result: 'passing',
  });

  const {
    group_id: clusterID,
    check_results: [{ check_id: checkID }],
  } = executionResult;

  const { loading, catalog, error } = catalogFactory.build({
    loading: false,
    catalog: [catalogFactory.build({ id: checkID })],
    error: null,
  });

  const targets = [
    { agent_id: agentID1, checks: [catalog[0].id] },
    { agent_id: agentID2, checks: [catalog[0].id] },
  ];

  const checkResult = checkResultFactory.build({
    check_id: checkID,
    result: 'passing',
    agents_check_results: [agent1, agent2],
    expectation_results: expectationResultFactory.buildList(2, {
      result: true,
    }),
  });

  const lastExecution = {
    executionLoading: false,
    executionData: {
      status: checkExecutionStatus,
      targets,
      check_results: [checkResult],
    },
    error: '',
  };

  const {
    executionLoading,
    executionData,
    error: executionError,
  } = lastExecution;

  return {
    clusterID,
    executionResult,
    loading,
    catalog,
    error,
    targets,
    hostnames,
    checkID,
    agents,
    checkResult,
    executionLoading,
    executionData,
    executionError,
  };
};

describe('ExecutionResults', () => {
  it('should render ExecutionResults with successfully fetched results', async () => {
    const {
      clusterID,
      hostnames,
      checkID,
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionError,
    } = prepareStateData('passing');

    const { getByText, getAllByText } = renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        clusterName="test-cluster"
        cloudProvider="test-provider"
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        catalogError={error}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
      />
    );

    expect(getByText(hostnames[0].hostname)).toBeTruthy();
    expect(getByText(hostnames[1].hostname)).toBeTruthy();
    expect(getAllByText(checkID)).toHaveLength(2);
    expect(getAllByText('2/2 expectations passed')).toBeTruthy();
  });

  it('should render ExecutionResults with running state', async () => {
    const {
      clusterID,
      hostnames,
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionError,
    } = prepareStateData('running');

    const { getByText } = renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        catalogError={error}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
      />
    );

    expect(getByText('Check execution currently running...')).toBeTruthy();
  });
});
