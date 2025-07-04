import React from 'react';
import { screen, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { capitalize, concat, noop } from 'lodash';

import { renderWithRouter } from '@lib/test-utils';
import { clusterResourceFactory, hostFactory } from '@lib/test-utils/factories';

import { CLUSTER_MAINTENANCE_CHANGE } from '@lib/operations';
import { getResourceOperations } from './clusterOperations';
import Resources from './Resources';

describe('Resources', () => {
  it('should display standalone resources', () => {
    const resources = clusterResourceFactory.buildList(5, { parent: null });

    render(<Resources resources={resources} hosts={[]} />);

    const rows = screen.getByRole('table').querySelectorAll('tbody > tr');

    expect(rows).toHaveLength(5);

    rows.forEach((row, index) => {
      expect(row.querySelector('td:nth-child(2)')).toHaveTextContent(
        resources[index].fail_count
      );
      expect(row.querySelector('td:nth-child(3)')).toHaveTextContent(
        resources[index].id
      );
      expect(row.querySelector('td:nth-child(5)')).toHaveTextContent(
        resources[index].role
      );
      expect(row.querySelector('td:nth-child(6)')).toHaveTextContent(
        resources[index].status
      );
      expect(row.querySelector('td:nth-child(7)')).toHaveTextContent(
        capitalize(resources[index].managed)
      );
      expect(row.querySelector('td:nth-child(8)')).toHaveTextContent(
        resources[index].type
      );
    });
  });

  it('should display grouped resources', () => {
    const resources = concat(
      clusterResourceFactory.buildList(2, { parent: { id: 'group1' } }),
      clusterResourceFactory.buildList(2, { parent: { id: 'group2' } })
    );

    render(<Resources resources={resources} hosts={[]} />);

    const rows = screen.getByRole('table').querySelectorAll('tbody > tr');

    expect(rows).toHaveLength(6);

    [rows[0], rows[3]].forEach((row, index) => {
      const parentIndex = index * 2;
      expect(row.querySelector('td:nth-child(3)')).toHaveTextContent(
        resources[parentIndex].parent.id
      );
      expect(row.querySelector('td:nth-child(7)')).toHaveTextContent(
        capitalize(resources[parentIndex].parent.managed)
      );
      expect(row.querySelector('td:nth-child(8)')).toHaveTextContent(
        resources[parentIndex].type
      );
    });

    [rows[1], rows[2], rows[4], rows[5]].forEach((row, index) => {
      expect(row.querySelector('td:nth-child(3)')).toHaveTextContent(
        resources[index].id
      );
    });
  });

  it('should attach the correct host', () => {
    const hosts = hostFactory.buildList(2);
    const nodename = hosts[0].hostname;
    const resources = clusterResourceFactory.buildList(1, {
      node: nodename,
      parent: null,
    });

    renderWithRouter(<Resources resources={resources} hosts={hosts} />);

    const locationCell = screen
      .getByRole('table')
      .querySelector('tbody > tr > td:nth-child(4)');

    expect(locationCell).toHaveTextContent(nodename);
    expect(locationCell.querySelector('a')).toHaveAttribute(
      'href',
      `/hosts/${hosts[0].id}`
    );
  });

  it('should identify generic Group type', () => {
    const resources = clusterResourceFactory.buildList(1, {
      parent: { multi_state: null },
    });

    render(<Resources resources={resources} hosts={[]} />);

    const typeCell = screen
      .getByRole('table')
      .querySelector('tbody > tr > td:nth-child(8)');

    expect(typeCell).toHaveTextContent('Group');
  });

  describe('cluster resource operations', () => {
    it.each(['Resource maintenance'])(
      'should show cluster resource operations: %s',
      async (name) => {
        const user = userEvent.setup();
        const clusterID = faker.string.uuid();
        const resources = clusterResourceFactory.buildList(5, {
          parent: null,
        });

        render(
          <Resources
            resources={resources}
            hosts={[]}
            userAbilities={[{ name: 'all', resource: 'all' }]}
            getResourceOperations={getResourceOperations(
              clusterID,
              null,
              noop,
              noop
            )}
          />
        );

        const operationButtons = screen.getAllByRole('button');
        expect(operationButtons.length).toBe(5);

        await user.click(operationButtons[0]);

        expect(screen.getByRole('menuitem', { name })).toBeEnabled();
      }
    );

    it('should disable operations if some operation is running', async () => {
      const user = userEvent.setup();
      const clusterID = faker.string.uuid();
      const resources = clusterResourceFactory.buildList(5, {
        parent: null,
      });

      render(
        <Resources
          resources={resources}
          hosts={[]}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          getResourceOperations={getResourceOperations(
            clusterID,
            { group_id: '123', operation: CLUSTER_MAINTENANCE_CHANGE },
            noop,
            noop
          )}
        />
      );

      const operationButtons = screen.getAllByRole('button');

      await user.click(operationButtons[0]);

      screen
        .getAllByRole('menuitem')
        .forEach((item) => expect(item).toBeDisabled());
    });

    const runningOperationsScenarios = [
      {
        name: 'resource_maintenance running',
        runningOperation: (clusterID, { id }) => ({
          groupID: clusterID,
          operation: CLUSTER_MAINTENANCE_CHANGE,
          metadata: { params: { resource_id: id } },
        }),
        runningItem: 'Resource maintenance',
      },
    ];

    it.each(runningOperationsScenarios)(
      'should show cluster host operations running state: $name',
      async ({ runningOperation, runningItem }) => {
        const user = userEvent.setup();
        const clusterID = faker.string.uuid();
        const resources = clusterResourceFactory.buildList(5, {
          parent: null,
        });

        render(
          <Resources
            resources={resources}
            hosts={[]}
            userAbilities={[{ name: 'all', resource: 'all' }]}
            getResourceOperations={getResourceOperations(
              clusterID,
              runningOperation(clusterID, resources[0]),
              noop,
              noop
            )}
          />
        );

        const operationButtons = screen.getAllByRole('button');

        await user.click(operationButtons[0]);

        const menuItem = screen.getByRole('menuitem', {
          name: runningItem,
        });
        expect(menuItem).toBeDisabled();

        const { getByTestId } = within(menuItem);

        expect(getByTestId('eos-svg-component')).toBeInTheDocument();

        const { getAllByTestId } = within(screen.getByRole('menu'));
        expect(getAllByTestId('eos-svg-component').length).toBe(1);
      }
    );

    const userAbilitiesScenarios = [
      {
        name: 'can change resource maintenance',
        userAbilities: [{ name: 'maintenance_change', resource: 'cluster' }],
        menuItem: 'Resource maintenance',
        enabled: true,
      },
      {
        name: 'cannot change resource maintenance',
        userAbilities: [],
        menuItem: 'Resource maintenance',
        enabled: false,
      },
    ];

    it.each(userAbilitiesScenarios)(
      'should allow/forbid operations based on user abilities: $name',
      async ({ userAbilities, menuItem, enabled }) => {
        const user = userEvent.setup();
        const clusterID = faker.string.uuid();
        const resources = clusterResourceFactory.buildList(5, {
          parent: null,
        });

        render(
          <Resources
            resources={resources}
            hosts={[]}
            userAbilities={userAbilities}
            getResourceOperations={getResourceOperations(
              clusterID,
              null,
              noop,
              noop
            )}
          />
        );

        const operationButtons = screen.getAllByRole('button');

        await user.click(operationButtons[0]);

        const item = screen.getByRole('menuitem', {
          name: menuItem,
        });
        enabled ? expect(item).toBeEnabled() : expect(item).toBeDisabled();
      }
    );
  });
});
