import React from 'react';
import { screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';

import {
  catalogFactory,
  catalogCheckFactory,
  hostnameFactory,
  addCriticalExpectation,
  addPassingExpectation,
  agentCheckResultFactory,
  checksExecutionCompletedFactory,
  checkResultFactory,
  withEmptyExpectations,
} from '@lib/test-utils/factories';
import '@testing-library/jest-dom/extend-expect';
import { UNKNOWN_PROVIDER } from '@components/ClusterDetails/ClusterSettings';
import ExecutionResults from './ExecutionResults';

const prepareStateData = (checkExecutionStatus) => {
  const hostnames = hostnameFactory.buildList(2);
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

  const { check_id: checkID1 } = checkResult1;
  const { check_id: checkID2 } = checkResult2;

  const targets = [
    { agent_id: agentID1, checks: [checkID1, checkID2] },
    { agent_id: agentID2, checks: [checkID1, checkID2] },
  ];

  const executionResult = checksExecutionCompletedFactory.build({
    check_results: [checkResult1, checkResult2],
    targets,
    result: 'critical',
  });

  const { group_id: clusterID } = executionResult;

  const { loading, catalog, error } = catalogFactory.build({
    loading: false,
    catalog: [
      catalogCheckFactory.build({ id: checkID1 }),
      catalogCheckFactory.build({ id: checkID2 }),
    ],
    error: null,
  });

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
    executionStarted: executionData?.status !== 'requested',
    error,
    targets,
    hostnames,
    checks: [checkID1, checkID2],
    executionLoading,
    executionData,
    executionError,
  };
};

describe('ExecutionResults', () => {
  it('should render ExecutionResults with successfully fetched results', async () => {
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: () => null,
      disconnect: () => null,
    }));

    const user = userEvent.setup();

    const {
      clusterID,
      hostnames,
      checks: [checkID1, checkID2],
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionStarted,
      executionError,
    } = prepareStateData('passing');

    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        clusterName="test-cluster"
        clusterScenario="hana_scale_up"
        cloudProvider="azure"
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        executionStarted={executionStarted}
        catalogError={error}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
      />
    );

    expect(screen.getByText('test-cluster')).toBeTruthy();
    expect(screen.getByText('HANA scale-up')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText(hostnames[0].hostname)).toBeTruthy();
    expect(screen.getByText(hostnames[1].hostname)).toBeTruthy();
    expect(screen.getAllByText(checkID1)).toHaveLength(2);
    expect(screen.getAllByText(checkID2)).toHaveLength(2);
    expect(screen.getAllByText('2/2 expectations passed')).toBeTruthy();
    expect(screen.getAllByText('1/2 expectations failed')).toBeTruthy();

    const [{ remediation }] = catalog;
    expect(screen.queryByText(remediation)).not.toBeInTheDocument();
    await user.click(screen.getAllByText(checkID1)[0]);
    expect(screen.getByText(remediation)).toBeVisible();
  });

  it('should render the execution starting dialog, when an execution is not started yet', () => {
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
    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        catalogError={error}
        executionStarted={false}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
      />
    );

    screen.getByText('Checks execution starting...');
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
      executionStarted,
    } = prepareStateData('running');

    const { container } = renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        catalogError={error}
        executionStarted={executionStarted}
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

  it('should render ChecksSelectionHints when executionData is null or executionLoading is false', async () => {
    const executionData = null;
    const executionLoading = false;

    renderWithRouter(
      <ExecutionResults
        clusterID={faker.datatype.uuid()}
        clusterName={faker.animal.cat()}
        clusterScenario={faker.animal.cat()}
        cloudProvider={faker.animal.cat()}
        hostnames={[]}
        catalogLoading={false}
        catalog={[]}
        executionStarted
        catalogError={null}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={false}
        clusterSelectedChecks={[]}
      />
    );
    const hintText = screen.getByText(
      'It looks like you have not configured any checks for the current cluster. Select your desired checks to be executed.'
    );
    expect(hintText).toBeInTheDocument();
    const svgText = screen.getByText('Select Checks now');
    expect(svgText).toBeInTheDocument();
  });

  it("should render ExecutionResults with successfully filtered 'passing' results", async () => {
    const {
      clusterID,
      hostnames,
      checks: [checkID1, checkID2],
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionError,
      executionStarted,
    } = prepareStateData('passing');

    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        clusterName="test-cluster"
        clusterScenario="hana_scale_up"
        cloudProvider="azure"
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        executionStarted={executionStarted}
        catalogError={error}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
      />,
      { route: `/clusters/${clusterID}/executions/last?health=passing` }
    );

    expect(screen.getByText('test-cluster')).toBeTruthy();
    expect(screen.getByText('HANA scale-up')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText(hostnames[0].hostname)).toBeTruthy();
    expect(screen.getByText(hostnames[1].hostname)).toBeTruthy();
    expect(screen.getAllByText(checkID1)).toHaveLength(2);
    expect(screen.queryByText(checkID2)).toBeNull();
    expect(screen.getAllByText('2/2 expectations passed')).toBeTruthy();
  });

  it("should render ExecutionResults with successfully filtered 'passing' and 'ciritcal' results", async () => {
    const {
      clusterID,
      hostnames,
      checks: [checkID1, checkID2],
      loading,
      catalog,
      executionStarted,
      error,
      executionLoading,
      executionData,
      executionError,
    } = prepareStateData('passing');

    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        clusterName="test-cluster"
        clusterScenario="hana_scale_up"
        cloudProvider="azure"
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        executionStarted={executionStarted}
        catalogError={error}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
      />,
      {
        route: `/clusters/${clusterID}/executions/last?health=passing&health=critical
    `,
      }
    );

    expect(screen.getByText('test-cluster')).toBeTruthy();
    expect(screen.getByText('HANA scale-up')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText(hostnames[0].hostname)).toBeTruthy();
    expect(screen.getByText(hostnames[1].hostname)).toBeTruthy();
    expect(screen.getAllByText(checkID1)).toHaveLength(2);
    expect(screen.getAllByText(checkID2)).toHaveLength(2);
    expect(screen.getAllByText('2/2 expectations passed')).toBeTruthy();
    expect(screen.getAllByText('1/2 expectations failed')).toBeTruthy();
  });

  it('given provider is VMware, should render ExecutionResults with warning banner', async () => {
    const {
      clusterID,
      hostnames,
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionError,
      executionStarted,
    } = prepareStateData('passing');

    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        clusterName="test-cluster"
        clusterScenario="hana_scale_up"
        cloudProvider="vmware"
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        executionStarted={executionStarted}
        catalogError={error}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
      />,
      { route: `/clusters/${clusterID}/executions/last?health=passing` }
    );

    expect(screen.getByText('VMware')).toBeTruthy();
    expect(
      screen.getByText(
        'Configuration checks for HANA scale-up performance optimized clusters on VMware are still in experimental phase. Please use results with caution.'
      )
    ).toBeTruthy();
  });

  it('given provider is unknown, should render ExecutionResults with warning banner', async () => {
    const {
      clusterID,
      hostnames,
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionError,
      executionStarted,
    } = prepareStateData('passing');

    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        clusterName="test-cluster"
        clusterScenario="hana_scale_up"
        cloudProvider={UNKNOWN_PROVIDER}
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        executionStarted={executionStarted}
        catalogError={error}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
      />,
      { route: `/clusters/${clusterID}/executions/last?health=passing` }
    );

    expect(screen.getByText('Provider not recognized')).toBeTruthy();
    expect(
      screen.getByText(
        /The following catalog is valid for on-premise bare metal platforms.*If you are running your HANA cluster on a different platform, please use results with caution/
      )
    ).toBeTruthy();
  });
});
