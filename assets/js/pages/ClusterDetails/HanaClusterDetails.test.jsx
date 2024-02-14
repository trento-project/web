import React from 'react';
import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import {
  clusterFactory,
  hostFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';

import HanaClusterDetails from './HanaClusterDetails';

describe('HanaClusterDetails component', () => {
  const executionId = faker.string.uuid();
  const scenarios = [
    {
      name: 'Execution is being loaded from wanda',
      selectedChecks: ['some'],
      hasSelectedChecks: true,
      lastExecution: { data: null, loading: true, error: null },
    },
    {
      name: 'No checks were selected',
      selectedChecks: [],
      hasSelectedChecks: false,
      lastExecution: {
        data: checksExecutionCompletedFactory.build({
          execution_id: executionId,
        }),
        loading: false,
        error: null,
      },
    },
    {
      name: 'Execution is still running',
      selectedChecks: ['A123'],
      hasSelectedChecks: true,
      lastExecution: {
        data: checksExecutionRunningFactory.build({
          execution_id: executionId,
        }),
        loading: false,
        error: null,
      },
    },
    {
      name: 'Execution has been requested',
      selectedChecks: ['A123'],
      hasSelectedChecks: true,
      lastExecution: {
        data: {
          execution_id: executionId,
          status: 'requested',
        },
        loading: false,
        error: null,
      },
    },
  ];

  it.each(scenarios)(
    'should disable starting a new execution when $name',
    ({ selectedChecks, hasSelectedChecks, lastExecution }) => {
      const hanaCluster = clusterFactory.build({
        type: 'hana_scale_out',
      });

      const {
        clusterID,
        clusterName,
        cib_last_written: cibLastWritten,
        type: clusterType,
        sid,
        provider,
        details,
      } = hanaCluster;

      const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

      renderWithRouter(
        <HanaClusterDetails
          clusterID={clusterID}
          clusterName={clusterName}
          selectedChecks={selectedChecks}
          hasSelectedChecks={hasSelectedChecks}
          hosts={hosts}
          clusterType={clusterType}
          cibLastWritten={cibLastWritten}
          sid={sid}
          provider={provider}
          sapSystems={[]}
          details={details}
          lastExecution={lastExecution}
        />
      );

      expect(screen.getByText('Start Execution')).toBeDisabled();
    }
  );

  it('should show correctly the SID and a link to the SAP system', () => {
    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    const sapSystems = sapSystemFactory.buildList(2, { sid });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={sapSystems}
        details={details}
        lastExecution={null}
      />
    );

    const sidContainer = screen.getByText('SID').nextSibling;

    expect(sidContainer).toHaveTextContent(sid);
    expect(sidContainer.querySelector('a')).toHaveAttribute(
      'href',
      `/databases/${sapSystems[0].id}`
    );
  });

  it('should show the SID even if the sap systems enriched data is not available', () => {
    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={[]}
        details={details}
        lastExecution={null}
      />
    );

    const sidContainer = screen.getByText('SID').nextSibling;

    expect(sidContainer).toHaveTextContent(sid);
    expect(sidContainer.querySelector('a')).toBeNull();
  });

  it('should display a host link in the site details if the host is registered', () => {
    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build();

    const { nodes } = details;
    const registeredClusterNode = nodes[0];

    const host = hostFactory.build({
      hostname: registeredClusterNode.name,
      cluster_id: clusterID,
    });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={[host]}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={[]}
        details={details}
        lastExecution={null}
      />
    );

    const registeredHostContainer = screen.getByText(
      registeredClusterNode.name
    );

    expect(registeredHostContainer).toHaveAttribute(
      'href',
      `/hosts/${host.id}`
    );
  });

  it('should display the cluster maintenance mode', async () => {
    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build({ details: { maintenance_mode: true } });

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={[]}
        details={details}
        lastExecution={null}
      />
    );

    expect(screen.getByText('Cluster maintenance')).toBeInTheDocument();
    expect(
      screen.getByText('Cluster maintenance').nextSibling
    ).toHaveTextContent('True');
  });

  it('should display the HANA cluster sites', () => {
    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    const {
      sites: [{ name: siteName1 }, { name: siteName2 }],
    } = details;

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={[]}
        details={details}
        lastExecution={null}
      />
    );

    expect(screen.getByText(siteName1)).toBeInTheDocument();
    expect(screen.getByText(siteName2)).toBeInTheDocument();
  });

  it('should display infos about node details', async () => {
    const {
      clusterID,
      clusterName,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sid,
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    const {
      nodes: [{ attributes, resources }],
    } = details;

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        clusterName={clusterName}
        selectedChecks={[]}
        hasSelectedChecks={false}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        sid={sid}
        provider={provider}
        sapSystems={[]}
        details={details}
        lastExecution={null}
      />
    );

    await userEvent.click(screen.getAllByText('Details')[0]);

    expect(screen.getByText('Site Details')).toBeInTheDocument();
    expect(screen.getByText('Attributes')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();

    Object.keys(resources[0]).forEach((key) => {
      expect(screen.getByText(key)).toBeInTheDocument();
      screen.getAllByText(resources[0][key]).forEach((element) => {
        expect(element).toBeInTheDocument();
      });
    });

    Object.keys(attributes).forEach((key) => {
      screen.getAllByText(key).forEach((element) => {
        expect(element).toBeInTheDocument();
      });

      screen.getAllByText(attributes[key]).forEach((element) => {
        expect(element).toBeInTheDocument();
      });
    });
  });

  const suggestionScenarios = [
    {
      selectedChecks: [],
      hasSelectedChecks: false,
      suggestionExpectation: (tooltipSuggestion) => {
        tooltipSuggestion.toBeVisible();
      },
    },
    {
      selectedChecks: [faker.string.uuid()],
      hasSelectedChecks: true,
      suggestionExpectation: (tooltipSuggestion) => {
        tooltipSuggestion.not.toBeInTheDocument();
      },
    },
  ];

  it.each(suggestionScenarios)(
    'should suggest to the user to select some checks only when the selection is empty',
    async ({ selectedChecks, hasSelectedChecks, suggestionExpectation }) => {
      const user = userEvent.setup();

      const {
        clusterID,
        clusterName,
        cib_last_written: cibLastWritten,
        type: clusterType,
        sid,
        provider,
        details,
      } = clusterFactory.build();

      const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

      renderWithRouter(
        <HanaClusterDetails
          clusterID={clusterID}
          clusterName={clusterName}
          selectedChecks={selectedChecks}
          hasSelectedChecks={hasSelectedChecks}
          hosts={hosts}
          clusterType={clusterType}
          cibLastWritten={cibLastWritten}
          sid={sid}
          provider={provider}
          sapSystems={[]}
          details={details}
          lastExecution={null}
        />
      );

      const startExecutionButton = screen.getByText('Start Execution');
      await user.hover(startExecutionButton);
      suggestionExpectation(
        expect(screen.queryByText('Select some Checks first!'))
      );
    }
  );
});
