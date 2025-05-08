import React from 'react';
import { concat } from 'lodash';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { clusterFactory } from '@lib/test-utils/factories';
import ClusterMaintenanceChangeModal from './ClusterMaintenanceChangeModal';

describe('ClusterMaintenanceChangeModal', () => {
  it('should show correct title and description', async () => {
    await act(async () => {
      render(<ClusterMaintenanceChangeModal isOpen />);
    });

    expect(screen.getByText('Cluster Maintenance')).toBeInTheDocument();
    expect(
      screen.getByText('Update cluster, node or resource maintenance state')
    ).toBeInTheDocument();
  });

  it('should forbid choosing and applying solution until accepting the checkbox', async () => {
    await act(async () => {
      render(<ClusterMaintenanceChangeModal isOpen />);
    });

    expect(screen.getByText('Apply')).toBeDisabled();
    expect(screen.getByText('Select a cluster resource')).toBeDisabled();
  });

  it('should render available nodes and resources in HANA clusters', async () => {
    const user = userEvent.setup();
    const { details } = clusterFactory.build();
    const { nodes, stopped_resources: stoppedResources } = details;
    const { resources: resources1 } = nodes[0];
    const { resources: resources2 } = nodes[1];
    const resources = concat(resources1, resources2, stoppedResources);

    await act(async () => {
      render(<ClusterMaintenanceChangeModal clusterDetails={details} isOpen />);
    });

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Apply')).toBeDisabled();

    await user.click(screen.getByText('Select a cluster resource'));

    expect(screen.getByText('Cluster (full maintenance)')).toBeInTheDocument();
    nodes.forEach(({ name }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
    resources.forEach(({ id }) => {
      expect(screen.getByText(id)).toBeInTheDocument();
    });
  });

  it('should render available nodes and resources in ASCS/ERS clusters', async () => {
    const user = userEvent.setup();
    const { details } = clusterFactory.build({ type: 'ascs_ers' });
    const { sap_systems: sapSystems, stopped_resources: stoppedResources } =
      details;
    const { nodes } = sapSystems[0];
    const { resources: resources1 } = nodes[0];
    const { resources: resources2 } = nodes[1];
    const resources = concat(resources1, resources2, stoppedResources);

    await act(async () => {
      render(<ClusterMaintenanceChangeModal clusterDetails={details} isOpen />);
    });

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Apply')).toBeDisabled();

    await user.click(screen.getByText('Select a cluster resource'));

    expect(screen.getByText('Cluster (full maintenance)')).toBeInTheDocument();
    nodes.forEach(({ name }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
    resources.forEach(({ id }) => {
      expect(screen.getByText(id)).toBeInTheDocument();
    });
  });

  it.each([{ maintenance: true }, { maintenance: false }])(
    'should set cluster maintenance initially as $maintenance',
    async ({ maintenance }) => {
      const user = userEvent.setup();
      const { details } = clusterFactory.build({
        details: { maintenance_mode: maintenance },
      });

      await act(async () => {
        render(
          <ClusterMaintenanceChangeModal clusterDetails={details} isOpen />
        );
      });

      await user.click(screen.getByRole('checkbox'));
      expect(screen.getByText('Apply')).toBeDisabled();
      await user.click(screen.getByText('Select a cluster resource'));
      await user.click(screen.getByText('Cluster (full maintenance)'));
      if (maintenance) {
        expect(screen.getByRole('switch')).toBeChecked();
      } else {
        expect(screen.getByRole('switch')).not.toBeChecked();
      }
    }
  );

  it.each([
    { scope: 'cluster', optionIndex: 1, params: { maintenance: true } },
    {
      scope: 'node',
      optionIndex: 2,
      params: { maintenance: true, node_id: expect.anything() },
    },
    {
      scope: 'resource',
      optionIndex: 4,
      params: {
        maintenance: expect.anything(),
        resource_id: expect.anything(),
      },
    },
  ])('should request operation for $scope', async ({ optionIndex, params }) => {
    const user = userEvent.setup();
    const mockOnRequest = jest.fn();
    const { details } = clusterFactory.build();

    await act(async () => {
      render(
        <ClusterMaintenanceChangeModal
          clusterDetails={details}
          isOpen
          onRequest={mockOnRequest}
        />
      );
    });

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Select a cluster resource'));
    await user.click(screen.getAllByRole('option')[optionIndex]);
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockOnRequest).toBeCalledWith(params);
  });
});
