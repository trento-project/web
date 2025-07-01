import React from 'react';
import { screen, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { noop } from 'lodash';

import {
  hanaClusterDetailsNodesFactory,
  hanaClusterSiteFactory,
} from '@lib/test-utils/factories';

import {
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  CLUSTER_MAINTENANCE_CHANGE,
} from '@lib/operations';

import { getClusterHostOperations } from './clusterOperations';
import HanaClusterSite from './HanaClusterSite';

describe('HanaClusterSite', () => {
  const scenarios = [
    {
      srHealthState: '4',
      pillClass: 'fill-jungle-green-500',
    },
    {
      srHealthState: '1',
      pillClass: 'fill-red-500',
    },
    {
      srHealthState: '0',
      pillClass: 'fill-gray-500',
    },
  ];

  it.each(scenarios)(
    'should display the correct health state',
    ({ srHealthState, pillClass }) => {
      const { name, state } = hanaClusterSiteFactory.build();
      const { container } = render(
        <HanaClusterSite
          name={name}
          state={state}
          srHealthState={srHealthState}
        />
      );
      expect(screen.getByText(name)).toBeTruthy();
      expect(screen.getByText(state)).toBeTruthy();

      const svgEl = container.querySelector(
        "[data-testid='eos-svg-component']"
      );
      expect(svgEl).toHaveClass(pillClass);
    }
  );

  it('should show the nodes', () => {
    const {
      name,
      state,
      sr_healt_state: srHealthState,
    } = hanaClusterSiteFactory.build();
    const nodes = hanaClusterDetailsNodesFactory.buildList(3, {
      resources: [],
    });
    render(
      <HanaClusterSite
        name={name}
        nodes={nodes}
        state={state}
        srHealthState={srHealthState}
      />
    );

    expect(
      screen.getByRole('table').querySelectorAll('tbody > tr')
    ).toHaveLength(3);
  });

  it('should show nameserver and indexserver roles', () => {
    const {
      name,
      state,
      sr_healt_state: srHealthState,
    } = hanaClusterSiteFactory.build();
    const nodes = hanaClusterDetailsNodesFactory.buildList(1, {
      resources: [],
    });
    render(
      <HanaClusterSite
        name={name}
        nodes={nodes}
        state={state}
        srHealthState={srHealthState}
      />
    );

    expect(
      screen.getByRole('table').querySelectorAll('thead > tr > th').item(1)
    ).toHaveTextContent('Nameserver');

    expect(
      screen.getByRole('table').querySelectorAll('thead > tr > th').item(2)
    ).toHaveTextContent('Indexserver');

    expect(
      screen.getByRole('table').querySelectorAll('tbody > tr > td').item(1)
    ).toHaveTextContent('Slave');

    expect(
      screen.getByRole('table').querySelectorAll('tbody > tr > td').item(2)
    ).toHaveTextContent('Master');
  });

  describe('cluster hosts operations', () => {
    const clusterHostsOperationsScenarios = [
      {
        name: 'enabled when no other operation is running',
        runningOperation: null,
        expectedOperationEnabled: true,
      },
      {
        name: 'disabled when a pacemaker_enable is running',
        runningOperation: { group_id: '123', operation: PACEMAKER_ENABLE },
        expectedOperationEnabled: false,
      },
      {
        name: 'disabled when a pacemaker_disable is running',
        runningOperation: { group_id: '123', operation: PACEMAKER_DISABLE },
        expectedOperationEnabled: false,
      },
      {
        name: 'disabled when a cluster maintenance change is running',
        runningOperation: {
          group_id: '123',
          operation: CLUSTER_MAINTENANCE_CHANGE,
        },
        expectedOperationEnabled: false,
      },
    ];

    it.each(clusterHostsOperationsScenarios)(
      'should show cluster host operations: $name',
      async ({ runningOperation, expectedOperationEnabled }) => {
        const user = userEvent.setup();
        const clusterID = faker.string.uuid();

        const nodes = hanaClusterDetailsNodesFactory.buildList(2, {
          resources: [],
        });

        render(
          <HanaClusterSite
            nodes={nodes}
            userAbilities={[{ name: 'all', resource: 'all' }]}
            getClusterHostOperations={getClusterHostOperations(
              clusterID,
              runningOperation,
              noop,
              noop
            )}
          />
        );

        const nodesTable = screen.getByRole('table');

        const { getAllByRole } = within(nodesTable);

        const [
          operationBtnHost1,
          _detailsBtnHost1,
          _operationBtnHost2,
          _detailsBtnHost2,
        ] = getAllByRole('button');

        await user.click(operationBtnHost1);

        const enablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Enable pacemaker at boot',
        });
        const disablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Disable pacemaker at boot',
        });

        expect(enablePacemakerHost1).toBeVisible();
        expect(disablePacemakerHost1).toBeVisible();
        if (expectedOperationEnabled) {
          expect(enablePacemakerHost1).toBeEnabled();
          expect(disablePacemakerHost1).toBeEnabled();
        } else {
          expect(enablePacemakerHost1).toBeDisabled();
          expect(disablePacemakerHost1).toBeDisabled();
        }
      }
    );

    const runningOperationsScenarios = [
      {
        name: 'pacemaker_enable running',
        runningOperation: (clusterID, { id }) => ({
          groupID: clusterID,
          operation: PACEMAKER_ENABLE,
          metadata: { hostID: id },
        }),
        expectedEnablePacemakerRunning: true,
        expectedDisablePacemakerRunning: false,
      },
      {
        name: 'pacemaker_disable running',
        runningOperation: (clusterID, { id }) => ({
          groupID: clusterID,
          operation: PACEMAKER_DISABLE,
          metadata: { hostID: id },
        }),
        expectedEnablePacemakerRunning: false,
        expectedDisablePacemakerRunning: true,
      },
      {
        name: 'cluster maintenance change running',
        runningOperation: (clusterID) => ({
          groupID: clusterID,
          operation: CLUSTER_MAINTENANCE_CHANGE,
        }),
        expectedEnablePacemakerRunning: false,
        expectedDisablePacemakerRunning: false,
      },
    ];

    it.each(runningOperationsScenarios)(
      'should show cluster host operations running state: $name',
      async ({
        runningOperation,
        expectedEnablePacemakerRunning,
        expectedDisablePacemakerRunning,
      }) => {
        const user = userEvent.setup();
        const clusterID = faker.string.uuid();

        const host = hanaClusterDetailsNodesFactory.build({ resources: [] });

        render(
          <HanaClusterSite
            nodes={[host]}
            userAbilities={[{ name: 'all', resource: 'all' }]}
            getClusterHostOperations={getClusterHostOperations(
              clusterID,
              runningOperation(clusterID, host),
              noop,
              noop
            )}
          />
        );

        const nodesTable = screen.getByRole('table');

        const { getAllByRole } = within(nodesTable);

        const [operationBtnHost1, _detailsBtnHost1] = getAllByRole('button');

        await user.click(operationBtnHost1);

        const enablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Enable pacemaker at boot',
        });
        const disablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Disable pacemaker at boot',
        });

        expect(enablePacemakerHost1).toBeDisabled();
        expect(disablePacemakerHost1).toBeDisabled();

        const { queryByTestId: enablePacemakerIconFinder } =
          within(enablePacemakerHost1);

        expectedEnablePacemakerRunning
          ? expect(
              enablePacemakerIconFinder('eos-svg-component')
            ).toBeInTheDocument()
          : expect(enablePacemakerIconFinder('eos-svg-component')).toBeNull();

        const { queryByTestId: disablePacemakerIconFinder } = within(
          disablePacemakerHost1
        );

        expectedDisablePacemakerRunning
          ? expect(
              disablePacemakerIconFinder('eos-svg-component')
            ).toBeInTheDocument()
          : expect(disablePacemakerIconFinder('eos-svg-component')).toBeNull();
      }
    );

    const userAbilitiesScenarios = [
      {
        name: 'no abilities, all operations forbidden',
        userAbilities: [],
        enablePacemakerAllowed: false,
        disablePacemakerAllowed: false,
      },
      {
        name: 'can only enable pacemaker',
        userAbilities: [{ name: 'pacemaker_enable', resource: 'cluster' }],
        enablePacemakerAllowed: true,
        disablePacemakerAllowed: false,
      },
      {
        name: 'can only disable pacemaker',
        userAbilities: [{ name: 'pacemaker_disable', resource: 'cluster' }],
        enablePacemakerAllowed: false,
        disablePacemakerAllowed: true,
      },
      {
        name: 'admin can perform all operations',
        userAbilities: [{ name: 'all', resource: 'all' }],
        enablePacemakerAllowed: true,
        disablePacemakerAllowed: true,
      },
      {
        name: 'can perform all operations with relevant abilities',
        userAbilities: [
          { name: 'pacemaker_enable', resource: 'cluster' },
          { name: 'pacemaker_disable', resource: 'cluster' },
        ],
        enablePacemakerAllowed: true,
        disablePacemakerAllowed: true,
      },
    ];

    it.each(userAbilitiesScenarios)(
      'should allow/forbid operations based on user abilities: $name',
      async ({
        userAbilities,
        enablePacemakerAllowed,
        disablePacemakerAllowed,
      }) => {
        const user = userEvent.setup();
        const clusterID = faker.string.uuid();

        const nodes = hanaClusterDetailsNodesFactory.buildList(2, {
          resources: [],
        });

        const runningOperation = null;

        render(
          <HanaClusterSite
            nodes={nodes}
            userAbilities={userAbilities}
            getClusterHostOperations={getClusterHostOperations(
              clusterID,
              runningOperation,
              noop,
              noop
            )}
          />
        );

        const nodesTable = screen.getByRole('table');

        const { getAllByRole } = within(nodesTable);

        const [
          operationBtnHost1,
          _detailsBtnHost1,
          _operationBtnHost2,
          _detailsBtnHost2,
        ] = getAllByRole('button');

        await user.click(operationBtnHost1);

        const enablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Enable pacemaker at boot',
        });
        const disablePacemakerHost1 = screen.getByRole('menuitem', {
          name: 'Disable pacemaker at boot',
        });

        enablePacemakerAllowed
          ? expect(enablePacemakerHost1).toBeEnabled()
          : expect(enablePacemakerHost1).toBeDisabled();
        disablePacemakerAllowed
          ? expect(disablePacemakerHost1).toBeEnabled()
          : expect(disablePacemakerHost1).toBeDisabled();
      }
    );
  });
});
