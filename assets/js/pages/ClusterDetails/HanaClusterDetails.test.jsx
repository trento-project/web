import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import {
  clusterFactory,
  hanaClusterDetailsNodesFactory,
  hostFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';

import HanaClusterDetails from './HanaClusterDetails';

describe('HanaClusterDetails component', () => {
  it('should show correctly the SID and a link to the SAP system', () => {
    const {
      clusterID,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sap_instances: [{ sid }],
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    const sapSystems = sapSystemFactory.buildList(2, { sid });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        clusterSids={[sid]}
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
      cib_last_written: cibLastWritten,
      type: clusterType,
      sap_instances: [{ sid }],
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        provider={provider}
        sapSystems={[{ sid }]}
        clusterSids={[sid]}
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
      cib_last_written: cibLastWritten,
      type: clusterType,
      sap_instances: [{ sid }],
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
        hosts={[host]}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        clusterSids={[sid]}
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
      cib_last_written: cibLastWritten,
      type: clusterType,
      sap_instances: [{ sid }],
      provider,
      details,
    } = clusterFactory.build({ details: { maintenance_mode: true } });

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        clusterSids={[sid]}
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
      cib_last_written: cibLastWritten,
      type: clusterType,
      sap_instances: [{ sid }],
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
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        clusterSids={[sid]}
        provider={provider}
        sapSystems={[]}
        details={details}
        lastExecution={null}
      />
    );

    expect(screen.getByText(siteName1)).toBeInTheDocument();
    expect(screen.getByText(siteName2)).toBeInTheDocument();
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  it('should display not sited nodes in the Other table', () => {
    const {
      clusterID,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sap_instances: [{ sid }],
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(3, { cluster_id: clusterID });

    const updatedNodes = details.nodes.concat(
      hanaClusterDetailsNodesFactory.build({ site: null })
    );

    const updatedDetails = { ...details, ...{ nodes: updatedNodes } };

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        clusterSids={[sid]}
        provider={provider}
        sapSystems={[]}
        details={updatedDetails}
        lastExecution={null}
      />
    );

    expect(screen.queryByText('Other')).toBeInTheDocument();
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBe(3);

    expect(tables[2].querySelectorAll('tbody > tr')).toHaveLength(1);
  });

  it('should display infos about node details', async () => {
    const {
      clusterID,
      cib_last_written: cibLastWritten,
      type: clusterType,
      sap_instances: [{ sid }],
      provider,
      details,
    } = clusterFactory.build();

    const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

    const {
      nodes: [{ attributes }],
    } = details;

    renderWithRouter(
      <HanaClusterDetails
        clusterID={clusterID}
        hosts={hosts}
        clusterType={clusterType}
        cibLastWritten={cibLastWritten}
        clusterSids={[sid]}
        provider={provider}
        sapSystems={[]}
        details={details}
        lastExecution={null}
      />
    );

    await userEvent.click(screen.getAllByText('Details')[0]);

    expect(screen.getByText('Node Details')).toBeInTheDocument();
    expect(screen.getByText('Attributes')).toBeInTheDocument();

    Object.keys(attributes).forEach((key) => {
      screen.getAllByText(key).forEach((element) => {
        expect(element).toBeInTheDocument();
      });

      screen.getAllByText(attributes[key]).forEach((element) => {
        expect(element).toBeInTheDocument();
      });
    });
  });

  it.each([
    {
      arch: 'angi',
      tooltip: 'Angi architecture',
      scenario: 'performance_optimized',
      label: 'HANA Scale Up Perf. Opt.',
    },
    {
      arch: 'classic',
      tooltip: 'Classic architecture',
      scenario: 'performance_optimized',
      label: 'HANA Scale Up Perf. Opt.',
    },
    {
      arch: 'classic',
      tooltip: 'Classic architecture',
      scenario: 'cost_optimized',
      label: 'HANA Scale Up Cost Opt.',
    },
    {
      arch: 'classic',
      tooltip: 'Classic architecture',
      scenario: 'unknown',
      label: 'HANA Scale Up',
    },
  ])(
    'should show cluster type with $arch architecture',
    async ({ arch, tooltip, scenario, label }) => {
      const user = userEvent.setup();

      const {
        clusterID,
        cib_last_written: cibLastWritten,
        type: clusterType,
        sap_instances: [{ sid }],
        provider,
        details,
      } = clusterFactory.build({
        type: 'hana_scale_up',
        details: { architecture_type: arch, hana_scenario: scenario },
      });

      const hosts = hostFactory.buildList(2, { cluster_id: clusterID });

      renderWithRouter(
        <HanaClusterDetails
          clusterID={clusterID}
          hosts={hosts}
          clusterType={clusterType}
          cibLastWritten={cibLastWritten}
          clusterSids={[sid]}
          provider={provider}
          sapSystems={[]}
          details={details}
          lastExecution={null}
        />
      );
      const icon = screen.getByText(label).children.item(0);
      await user.hover(icon);
      expect(screen.getByText(tooltip, { exact: false })).toBeInTheDocument();
    }
  );
});
