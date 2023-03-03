import React from 'react';
import { screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';

import {
  catalogFactory,
  catalogCheckFactory,
  hostnameFactory,
  addCriticalExpectation,
  addPassingExpectation,
  checksExecutionCompletedFactory,
  emptyCheckResultFactory,
} from '@lib/test-utils/factories';
import '@testing-library/jest-dom/extend-expect';
import ExecutionResults from './ExecutionResults';

const prepareStateData = (checkExecutionStatus) => {
  const checkID1 = faker.datatype.uuid();
  const checkID2 = faker.datatype.uuid();

  const hostnames = hostnameFactory.buildList(2);
  const [{ id: agent1 }, { id: agent2 }] = hostnames;
  const targets = [agent1, agent2];

  let checkResult1 = emptyCheckResultFactory.build({
    checkID: checkID1,
    targets,
    result: 'passing',
  });
  checkResult1 = addPassingExpectation(checkResult1, 'expect');
  checkResult1 = addPassingExpectation(checkResult1, 'expect');
  checkResult1 = addPassingExpectation(checkResult1, 'expect_same');

  let checkResult2 = emptyCheckResultFactory.build({
    checkID: checkID2,
    targets,
    result: 'critical',
  });
  checkResult2 = addPassingExpectation(checkResult2, 'expect');
  checkResult2 = addCriticalExpectation(checkResult2, 'expect');

  const executionResult = checksExecutionCompletedFactory.build({
    check_results: [checkResult1, checkResult2],
    targets,
    result: 'critical',
  });

  const { group_id: clusterID } = executionResult;

  const aCheckDescription = faker.lorem.sentence();
  const anotherCheckDescription = faker.lorem.sentence();
  const { loading, catalog, error } = catalogFactory.build({
    loading: false,
    catalog: [
      catalogCheckFactory.build({
        id: checkID1,
        description: aCheckDescription,
      }),
      catalogCheckFactory.build({
        id: checkID2,
        description: anotherCheckDescription,
      }),
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

    const clusterName = 'test-cluster';
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
        clusterName={clusterName}
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

    expect(screen.getAllByText(clusterName)).toHaveLength(2);
    expect(screen.getAllByText(hostnames[0].hostname)).toHaveLength(2);
    expect(screen.getAllByText(hostnames[1].hostname)).toHaveLength(2);
    expect(
      screen.getAllByText('Value is the same on all targets')
    ).toHaveLength(1);
    expect(screen.getAllByText('2/2 Expectations met.')).toHaveLength(2);
    expect(screen.getAllByText('1/2 Expectations met.')).toHaveLength(2);

    const mainTable = screen.getByRole('table');
    const tableRows = mainTable.querySelectorAll('tbody > tr');

    expect(tableRows).toHaveLength(2 * executionData.check_results.length);

    expect(tableRows[0]).toHaveTextContent(checkID1);
    expect(tableRows[1]).toHaveTextContent(clusterName);
    expect(tableRows[1]).toHaveTextContent('Value is the same on all targets');
    expect(tableRows[1]).toHaveTextContent(hostnames[0].hostname);
    expect(tableRows[1]).toHaveTextContent('2/2 Expectations met.');

    expect(tableRows[2]).toHaveTextContent(checkID2);
    expect(tableRows[3]).toHaveTextContent(hostnames[1].hostname);
    expect(tableRows[3]).toHaveTextContent('1/2 Expectations met');
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

    expect(screen.getAllByText('test-cluster')).toHaveLength(2);
    expect(screen.getByText('HANA scale-up')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText(hostnames[0].hostname)).toBeTruthy();
    expect(screen.getByText(hostnames[1].hostname)).toBeTruthy();
    expect(screen.getAllByText(checkID1)).toHaveLength(1);
    expect(screen.queryByText(checkID2)).toBeNull();
  });

  it("should render ExecutionResults with successfully filtered 'passing' and 'critical' results", async () => {
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

    expect(screen.getAllByText('test-cluster')).toHaveLength(2);
    expect(screen.getByText('HANA scale-up')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getAllByText(hostnames[0].hostname)).toHaveLength(2);
    expect(screen.getAllByText(hostnames[1].hostname)).toHaveLength(2);
    expect(screen.getAllByText(checkID1)).toHaveLength(1);
    expect(screen.getAllByText(checkID2)).toHaveLength(1);
  });
});
