import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import {
  catalogFactory,
  catalogCheckFactory,
  hostFactory,
  checksExecutionCompletedFactory,
  emptyCheckResultFactory,
  addPassingExpectExpectation,
  addPassingExpectSameExpectation,
  addCriticalExpectExpectation,
  catalogExpectExpectationFactory,
  catalogExpectSameExpectationFactory,
  agentsCheckResultsWithHostname,
  clusterFactory,
} from '@lib/test-utils/factories';
import '@testing-library/jest-dom';
import { UNKNOWN_PROVIDER } from '@lib/model';
import ExecutionResults from './ExecutionResults';

const prepareStateData = (checkExecutionStatus) => {
  const checkID1 = faker.string.uuid();
  const checkID2 = faker.string.uuid();

  const clusterHosts = hostFactory.buildList(2);
  const [{ id: agent1 }, { id: agent2 }] = clusterHosts;
  const targets = [agent1, agent2];

  const expectationName1 = faker.company.name();
  const expectationName2 = faker.company.name();
  const expectationName3 = faker.company.name();
  const expectationName4 = faker.company.name();
  const expectationName5 = faker.company.name();

  let checkResult1 = emptyCheckResultFactory.build({
    checkID: checkID1,
    targets,
    result: 'passing',
  });
  checkResult1 = addPassingExpectExpectation(checkResult1, expectationName1);
  checkResult1 = addPassingExpectExpectation(checkResult1, expectationName2);
  checkResult1 = addPassingExpectSameExpectation(
    checkResult1,
    expectationName3
  );

  let checkResult2 = emptyCheckResultFactory.build({
    checkID: checkID2,
    targets,
    result: 'critical',
  });
  checkResult2 = addPassingExpectExpectation(checkResult2, expectationName4);
  checkResult2 = addCriticalExpectExpectation(checkResult2, expectationName5);

  const checkResults = [checkResult1, checkResult2].map((checkResult) => ({
    ...checkResult,
    agents_check_results: agentsCheckResultsWithHostname(
      checkResult.agents_check_results,
      clusterHosts
    ),
  }));

  const executionResult = checksExecutionCompletedFactory.build({
    check_results: checkResults,
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
        expectations: [
          catalogExpectExpectationFactory.build({
            name: expectationName1,
          }),
          catalogExpectExpectationFactory.build({
            name: expectationName2,
          }),
          catalogExpectSameExpectationFactory.build({
            name: expectationName3,
          }),
        ],
      }),
      catalogCheckFactory.build({
        id: checkID2,
        description: anotherCheckDescription,
        expectations: [
          catalogExpectExpectationFactory.build({
            name: expectationName4,
          }),
          catalogExpectExpectationFactory.build({
            name: expectationName5,
          }),
        ],
      }),
    ],
    error: null,
  });

  const lastExecution = {
    executionLoading: false,
    executionData: {
      ...executionResult,
      status: checkExecutionStatus,
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
    loading,
    catalog,
    executionStarted: executionData?.status !== 'requested',
    error,
    targets,
    clusterHosts,
    checks: [checkID1, checkID2],
    executionLoading,
    executionData,
    executionError,
  };
};

describe('ExecutionResults', () => {
  it('should render ExecutionResults with successfully fetched results', async () => {
    const clusterName = 'test-cluster';
    const {
      clusterID,
      clusterHosts,
      checks: [checkID1, checkID2],
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionStarted,
      executionError,
    } = prepareStateData('passing');

    const target = clusterFactory.build({
      id: clusterID,
      name: clusterName,
      type: 'hana_scale_up',
      provider: 'azure',
    });

    renderWithRouter(
      <ExecutionResults
        targetID={clusterID}
        targetName={clusterName}
        targetType="cluster"
        target={target}
        targetHosts={clusterHosts}
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
    expect(screen.getAllByText(clusterHosts[0].hostname)).toHaveLength(2);
    expect(screen.getAllByText(clusterHosts[1].hostname)).toHaveLength(2);
    expect(
      screen.getAllByText(/Value `.*` is the same on all targets/)
    ).toHaveLength(1);
    expect(screen.getAllByText('2/2 Expectations met.')).toHaveLength(2);
    expect(screen.getAllByText('1/2 Expectations met.')).toHaveLength(2);
    expect(screen.getByText(checkID1)).toHaveTextContent(checkID1);
    expect(screen.getByText(checkID2)).toHaveTextContent(checkID2);
    expect(screen.getByText(catalog[0].description)).toBeInTheDocument();
    expect(screen.getByText(catalog[1].description)).toBeInTheDocument();
  });

  it('should render the execution starting dialog, when an execution is not started yet', () => {
    const {
      clusterID,
      clusterHosts,
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionError,
    } = prepareStateData('running');
    const target = clusterFactory.build({
      id: clusterID,
    });

    renderWithRouter(
      <ExecutionResults
        targetID={clusterID}
        targetType="cluster"
        target={target}
        targetHosts={clusterHosts}
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
      clusterHosts,
      loading,
      catalog,
      error,
      executionLoading,
      executionData,
      executionError,
      executionStarted,
    } = prepareStateData('running');

    renderWithRouter(
      <ExecutionResults
        targetID={clusterID}
        targetType="cluster"
        targetHosts={clusterHosts}
        catalogLoading={loading}
        catalog={catalog}
        catalogError={error}
        executionStarted={executionStarted}
        executionLoading={executionLoading}
        executionRunning
        executionData={executionData}
        executionError={executionError}
      />
    );
    screen.getByText('Checks execution running...');
  });

  it('should render ChecksSelectionHints when executionData is null or executionLoading is false', async () => {
    const executionData = null;
    const executionLoading = false;

    const target = clusterFactory.build({
      type: faker.animal.cat(),
      provider: faker.animal.cat(),
    });

    renderWithRouter(
      <ExecutionResults
        targetID={faker.string.uuid()}
        targetName={faker.animal.cat()}
        targetType="cluster"
        target={target}
        targetHosts={[]}
        catalogLoading={false}
        catalog={[]}
        executionStarted
        catalogError={null}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={false}
        targetSelectedChecks={[]}
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
      clusterHosts,
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
        targetID={clusterID}
        targetName="test-cluster"
        targetType="cluster"
        target={{
          provider: 'azure',
          type: 'hana_scale_up',
        }}
        targetHosts={clusterHosts}
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
    expect(screen.getByText('HANA Scale Up')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText(clusterHosts[0].hostname)).toBeTruthy();
    expect(screen.getByText(clusterHosts[1].hostname)).toBeTruthy();
    expect(screen.getAllByText(checkID1)).toHaveLength(1);
    expect(screen.queryByText(checkID2)).toBeNull();
  });

  it("should render ExecutionResults with saved 'passing' filter", async () => {
    const {
      clusterID,
      clusterHosts,
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
        targetID={clusterID}
        targetName="test-cluster"
        targetType="cluster"
        target={{
          provider: 'azure',
          type: 'hana_scale_up',
        }}
        targetHosts={clusterHosts}
        catalogLoading={loading}
        catalog={catalog}
        executionStarted={executionStarted}
        catalogError={error}
        executionLoading={executionLoading}
        executionData={executionData}
        executionError={executionError}
        savedFilters={['passing']}
      />
    );

    expect(screen.getAllByText('test-cluster')).toHaveLength(2);
    expect(screen.getByText('HANA Scale Up')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getByText(clusterHosts[0].hostname)).toBeTruthy();
    expect(screen.getByText(clusterHosts[1].hostname)).toBeTruthy();
    expect(screen.getAllByText(checkID1)).toHaveLength(1);
    expect(screen.queryByText(checkID2)).toBeNull();
  });

  it("should render ExecutionResults with successfully filtered 'passing' and 'critical' results", async () => {
    const {
      clusterID,
      clusterHosts,
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
        targetID={clusterID}
        targetName="test-cluster"
        targetType="cluster"
        target={{
          provider: 'azure',
          type: 'hana_scale_up',
        }}
        targetHosts={clusterHosts}
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
    expect(screen.getByText('HANA Scale Up')).toBeTruthy();
    expect(screen.getByText('Azure')).toBeTruthy();
    expect(screen.getAllByText(clusterHosts[0].hostname)).toHaveLength(2);
    expect(screen.getAllByText(clusterHosts[1].hostname)).toHaveLength(2);
    expect(screen.getAllByText(checkID1)).toHaveLength(1);
    expect(screen.getAllByText(checkID2)).toHaveLength(1);
  });

  it('given provider is unknown, should render ExecutionResults with warning banner', async () => {
    const {
      clusterID,
      clusterHosts,
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
        targetID={clusterID}
        targetName="test-cluster"
        targetType="cluster"
        target={{
          provider: UNKNOWN_PROVIDER,
          type: 'hana_scale_up',
        }}
        targetHosts={clusterHosts}
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
        /The following results are valid for on-premise bare metal platforms.*If you are running your HANA cluster on a different platform, please use results with caution/
      )
    ).toBeTruthy();
  });

  it('should open remediation modal when clicking on checkID and close it when clicking outside', async () => {
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: () => null,
      disconnect: () => null,
    }));

    const {
      clusterID,
      clusterHosts,
      loading,
      catalog,
      executionError,
      executionStarted,
      executionData,
      checks,
    } = prepareStateData('completed');

    const target = clusterFactory.build({
      id: clusterID,
    });

    renderWithRouter(
      <ExecutionResults
        targetID={clusterID}
        targetType="cluster"
        targetHosts={clusterHosts}
        target={target}
        catalogLoading={loading}
        catalog={catalog}
        executionLoading={loading}
        executionStarted={executionStarted}
        executionData={executionData}
        executionError={executionError}
        targetSelectedChecks={checks}
      />
    );

    const { id: checkID, remediation } = catalog[0];
    expect(screen.getByText(checkID).textContent).toBe(checks[0]);
    expect(screen.queryByText(remediation)).not.toBeInTheDocument();
    await userEvent.click(screen.getByText(checkID));
    expect(screen.queryByText(remediation)).toBeInTheDocument();
  });

  it('should not open remediation modal when clicking on description', async () => {
    const {
      clusterID,
      clusterHosts,
      loading,
      catalog,
      executionError,
      executionStarted,
      executionData,
      checks,
    } = prepareStateData('completed');

    const target = clusterFactory.build({
      id: clusterID,
    });

    renderWithRouter(
      <ExecutionResults
        targetID={clusterID}
        targetType="cluster"
        targetHosts={clusterHosts}
        target={target}
        catalogLoading={loading}
        catalog={catalog}
        executionLoading={loading}
        executionStarted={executionStarted}
        executionData={executionData}
        executionError={executionError}
        targetSelectedChecks={checks}
      />
    );

    const { remediation, description } = catalog[0];
    expect(screen.getByText(description).textContent).toBe(description);
    userEvent.click(screen.getByText(description));
    expect(screen.queryByText(remediation)).not.toBeInTheDocument();
  });
});
