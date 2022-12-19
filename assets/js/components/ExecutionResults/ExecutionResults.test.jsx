import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithRouter } from '@lib/test-utils';
import {
  addCriticalExpectation,
  addPassingExpectation,
  agentCheckResultFactory,
  checksExecutionCompletedFactory,
  checkResultFactory,
  withEmptyExpectations,
} from '@lib/test-utils/factories/executions';
import { catalogFactory, hostnameFactory } from '@lib/test-utils/factories';

import ExecutionResults from './ExecutionResults';

const prepareStateData = (checkExecutionStatus) => {
  const hostnames = hostnameFactory.buildList(4);
  const [{ id: agentID1 }, { id: agentID2 }] = hostnames;
  const agentCheckResult1 = agentCheckResultFactory.build({
    agent_id: agentID1,
  });
  const agentCheckResult2 = agentCheckResultFactory.build({
    agent_id: agentID2,
  });
  const agentCheckResult3 = agentCheckResultFactory.build({
    agent_id: agentID1,
  });
  const agentCheckResult4 = agentCheckResultFactory.build({
    agent_id: agentID2,
  });
  let checkResult1 = checkResultFactory.build({
    agents_check_results: [agentCheckResult1, agentCheckResult2],
    result: 'passing',
  });

  checkResult1 = withEmptyExpectations(checkResult1);
  checkResult1 = addPassingExpectation(checkResult1, 'expect');
  checkResult1 = addPassingExpectation(checkResult1, 'expect_same');

  let checkResult2 = checkResultFactory.build({
    agents_check_results: [agentCheckResult3, agentCheckResult4],
    result: 'critical',
  });

  checkResult2 = withEmptyExpectations(checkResult2);
  checkResult2 = addPassingExpectation(checkResult2, 'expect');
  checkResult2 = addCriticalExpectation(checkResult2, 'expect');

  const executionResult = checksExecutionCompletedFactory.build({
    check_results: [checkResult1, checkResult2],
    result: 'critical',
  });

  const {
    group_id: clusterID,
    check_results: [{ check_id: checkID1 }, { check_id: checkID2 }],
  } = executionResult;

  const { loading, catalog, error } = catalogFactory.build({
    loading: false,
    catalog: [
      catalogFactory.build({ id: checkID1 }),
      catalogFactory.build({ id: checkID2 }),
    ],
    error: null,
  });

  const targets = [
    { agent_id: agentID1, checks: [checkID1, checkID2] },
    { agent_id: agentID2, checks: [checkID1, checkID2] },
  ];

  const lastExecution = {
    executionLoading: false,
    executionData: {
      status: checkExecutionStatus,
      targets,
      check_results: [checkResult1, checkResult2],
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
    checkID1,
    checkID2,
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
      checkID1,
      checkID2,
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionError,
    } = prepareStateData('passing');

    renderWithRouter(
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

    expect(screen.getByText(hostnames[0].hostname)).toBeTruthy();
    expect(screen.getByText(hostnames[1].hostname)).toBeTruthy();
    expect(screen.getAllByText(checkID1)).toHaveLength(2);
    expect(screen.getAllByText(checkID2)).toHaveLength(2);
    expect(screen.getAllByText('2/2 expectations passed')).toBeTruthy();
    expect(screen.getAllByText('1/2 expectations failed')).toBeTruthy();
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

    const { container } = renderWithRouter(
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
    const svgEl = container.querySelector("[data-testid='eos-svg-component']");
    const transform = svgEl.getAttribute('transform');
    expect(svgEl.classList.toString()).toContain(
      'inline-block fill-jungle-green-500'
    );
    expect(transform).toEqual('rotate(0) translate(0, 0) scale(1, 1)');
  });
});
