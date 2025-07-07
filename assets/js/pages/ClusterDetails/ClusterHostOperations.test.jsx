import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { noop } from 'lodash';

import {
  buildHostsFromAscsErsClusterDetails,
  buildSapSystemsFromAscsErsClusterDetails,
  ascsErsClusterDetailsFactory,
  hanaClusterDetailsNodesFactory,
  systemdUnitFactory,
} from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';

import {
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  CLUSTER_MAINTENANCE_CHANGE,
} from '@lib/operations';

import { getClusterHostOperations } from './clusterOperations';
import HanaClusterSite from './HanaClusterSite';
import AscsErsClusterDetails from './AscsErsClusterDetails';

const ascsErsDetails = ascsErsClusterDetailsFactory.build();
const ascsErsHosts = buildHostsFromAscsErsClusterDetails(ascsErsDetails);

const enrichPropsWithSystemdUnit = (props, unit, state) => {
  const systemdUnits = systemdUnitFactory.buildList(1, {
    name: unit,
    unit_file_state: state,
  });
  return {
    ...props,
    hosts: props.hosts?.map((node) => ({
      ...node,
      systemd_units: systemdUnits,
    })),
    nodes: props.nodes.map((node) => ({
      ...node,
      systemd_units: systemdUnits,
    })),
  };
};

describe.each([
  {
    name: 'HanaClusterSite',
    Component: HanaClusterSite,
    props: {
      nodes: hanaClusterDetailsNodesFactory.buildList(2, {
        id: faker.string.uuid(),
        resources: [],
      }),
    },
  },
  {
    name: 'AscsErsClusterDetails',
    Component: AscsErsClusterDetails,
    props: {
      hosts: ascsErsHosts,
      sapSystems: buildSapSystemsFromAscsErsClusterDetails(ascsErsDetails),
      details: ascsErsDetails,
      // nodes is used for better data extraction in test
      nodes: ascsErsDetails.sap_systems[0].nodes.map((node, idx) => ({
        ...node,
        id: ascsErsHosts[idx].id,
      })),
    },
  },
])('cluster hosts operations: $name', ({ Component, props }) => {
  it.each([
    {
      name: 'Node maintenance',
    },
    {
      name: 'Enable pacemaker at boot',
      enrichedProps: enrichPropsWithSystemdUnit(
        props,
        'pacemaker.service',
        'disabled'
      ),
    },
    {
      name: 'Disable pacemaker at boot',
      enrichedProps: enrichPropsWithSystemdUnit(
        props,
        'pacemaker.service',
        'enabled'
      ),
    },
  ])(
    'should show cluster host operations: %s',
    async ({ name, enrichedProps }) => {
      const user = userEvent.setup();
      const clusterID = faker.string.uuid();

      const resolvedProps = enrichedProps || props;

      renderWithRouter(
        <Component
          {...resolvedProps}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          getClusterHostOperations={getClusterHostOperations(
            clusterID,
            null,
            noop,
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

      expect(screen.getByRole('menuitem', { name })).toBeEnabled();
    }
  );

  it('should disable operations if some operation is running', async () => {
    const user = userEvent.setup();
    const clusterID = faker.string.uuid();

    renderWithRouter(
      <Component
        {...props}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        getClusterHostOperations={getClusterHostOperations(
          clusterID,
          { group_id: '123', operation: PACEMAKER_ENABLE },
          noop,
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

    screen
      .getAllByRole('menuitem')
      .forEach((item) => expect(item).toBeDisabled());
  });

  const runningOperationsScenarios = [
    {
      name: 'node_maintenance running',
      runningOperation: (clusterID, { name }) => ({
        groupID: clusterID,
        operation: CLUSTER_MAINTENANCE_CHANGE,
        metadata: { params: { node_id: name } },
      }),
      runningItem: 'Node maintenance',
    },
    {
      name: 'pacemaker_enable running',
      runningOperation: (clusterID, { id }) => ({
        groupID: clusterID,
        operation: PACEMAKER_ENABLE,
        metadata: { hostID: id },
      }),
      runningItem: 'Enable pacemaker at boot',
    },
    {
      name: 'pacemaker_disable running',
      runningOperation: (clusterID, { id }) => ({
        groupID: clusterID,
        operation: PACEMAKER_DISABLE,
        metadata: { hostID: id },
      }),
      runningItem: 'Disable pacemaker at boot',
    },
  ];

  it.each(runningOperationsScenarios)(
    'should show cluster host operations running state: $name',
    async ({ runningOperation, runningItem }) => {
      const user = userEvent.setup();
      const clusterID = faker.string.uuid();
      const { nodes } = props;

      renderWithRouter(
        <Component
          {...props}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          getClusterHostOperations={getClusterHostOperations(
            clusterID,
            runningOperation(clusterID, nodes[0]),
            noop,
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
      name: 'can enable pacemaker',
      userAbilities: [{ name: 'pacemaker_enable', resource: 'cluster' }],
      menuItem: 'Enable pacemaker at boot',
      enrichedProps: enrichPropsWithSystemdUnit(
        props,
        'pacemaker.service',
        'disabled'
      ),
      enabled: true,
    },
    {
      name: 'cannot enable pacemaker',
      userAbilities: [],
      menuItem: 'Enable pacemaker at boot',
      enrichedProps: enrichPropsWithSystemdUnit(
        props,
        'pacemaker.service',
        'disabled'
      ),
      enabled: false,
    },
    {
      name: 'can disable pacemaker',
      userAbilities: [{ name: 'pacemaker_disable', resource: 'cluster' }],
      menuItem: 'Disable pacemaker at boot',
      enrichedProps: enrichPropsWithSystemdUnit(
        props,
        'pacemaker.service',
        'enabled'
      ),
      enabled: true,
    },
    {
      name: 'cannot disable pacemaker',
      userAbilities: [],
      menuItem: 'Disable pacemaker at boot',
      enrichedProps: enrichPropsWithSystemdUnit(
        props,
        'pacemaker.service',
        'enabled'
      ),
      enabled: false,
    },
    {
      name: 'can change node maintenance',
      userAbilities: [{ name: 'maintenance_change', resource: 'cluster' }],
      menuItem: 'Node maintenance',
      enabled: true,
    },
    {
      name: 'cannot change node maintenance',
      userAbilities: [],
      menuItem: 'Node maintenance',
      enabled: false,
    },
  ];

  it.each(userAbilitiesScenarios)(
    'should allow/forbid operations based on user abilities: $name',
    async ({ userAbilities, menuItem, enabled, enrichedProps }) => {
      const user = userEvent.setup();
      const clusterID = faker.string.uuid();

      const resolvedProps = enrichedProps || props;

      renderWithRouter(
        <Component
          {...resolvedProps}
          userAbilities={userAbilities}
          getClusterHostOperations={getClusterHostOperations(
            clusterID,
            null,
            noop,
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

      const item = screen.getByRole('menuitem', {
        name: menuItem,
      });
      enabled ? expect(item).toBeEnabled() : expect(item).toBeDisabled();
    }
  );
});
