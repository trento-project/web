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
  checksExecutionCompletedFactory,
  emptyCheckResultFactory,
} from '@lib/test-utils/factories';
import '@testing-library/jest-dom/extend-expect';
import { UNKNOWN_PROVIDER } from '@components/ClusterDetails/ClusterSettings';
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

    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        hostnames={hostnames}
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

  it('should open remediation modal when clicking on checkID and close it when clicking outside', async () => {
    const {
      clusterID,
      hostnames,
      loading,
      catalog,
      executionError,
      executionStarted,
      executionResult,
      checks,
    } = prepareStateData('completed');

    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        executionLoading={loading}
        executionStarted={executionStarted}
        executionData={executionResult}
        executionError={executionError}
        clusterSelectedChecks={checks}
      />
    );

    const { id: checkID, remediation } = catalog[0];
    expect(screen.getByText(checkID).textContent).toBe(checks[0]);
    expect(screen.queryByText(remediation)).not.toBeInTheDocument();
    await userEvent.click(screen.getByText(checkID));
    expect(screen.queryByText(remediation)).toBeInTheDocument();
    await userEvent.click(document.body);
    expect(screen.queryByText(remediation)).not.toBeInTheDocument();
  });

  it('should not open remediation modal when clicking on description', async () => {
    const {
      clusterID,
      hostnames,
      loading,
      catalog,
      executionError,
      executionStarted,
      executionResult,
      checks,
    } = prepareStateData('completed');

    renderWithRouter(
      <ExecutionResults
        clusterID={clusterID}
        hostnames={hostnames}
        catalogLoading={loading}
        catalog={catalog}
        executionLoading={loading}
        executionStarted={executionStarted}
        executionData={executionResult}
        executionError={executionError}
        clusterSelectedChecks={checks}
      />
    );

    const { remediation, description } = catalog[0];
    expect(screen.getByText(description).textContent).toBe(description);
    userEvent.click(screen.getByText(description));
    expect(screen.queryByText(remediation)).not.toBeInTheDocument();
  });
});
