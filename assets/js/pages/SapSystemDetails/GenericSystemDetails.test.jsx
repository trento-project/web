import React from 'react';
import 'intersection-observer';
import { faker } from '@faker-js/faker';
import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SAP_INSTANCE_START, SAP_INSTANCE_STOP } from '@lib/operations';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import { renderWithRouter } from '@lib/test-utils';

import userEvent from '@testing-library/user-event';

import {
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';

import { GenericSystemDetails } from './GenericSystemDetails';
import { getSapInstanceOperations } from './sapOperations';

describe('GenericSystemDetails', () => {
  it('should render correctly', () => {
    const title = faker.string.uuid();
    const sapSystem = sapSystemFactory.build({
      ensa_version: 'ensa1',
      instances: sapSystemApplicationInstanceFactory.buildList(5),
    });

    sapSystem.hosts = hostFactory.buildList(5);

    const { sid, application_instances: applicationInstances } = sapSystem;
    const { features } = applicationInstances[0];

    renderWithRouter(
      <GenericSystemDetails
        title={title}
        system={sapSystem}
        type={APPLICATION_TYPE}
      />
    );

    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText('Application server')).toBeTruthy();
    expect(screen.getByText(sid)).toBeTruthy();
    expect(screen.getByText('ENSA1')).toBeTruthy();
    features.split('|').forEach((role) => {
      expect(screen.queryAllByText(role)).toBeTruthy();
    });
  });

  it('should render a not found label if system is not there', () => {
    const title = faker.string.uuid();
    renderWithRouter(
      <GenericSystemDetails title={title} type={APPLICATION_TYPE} />
    );

    expect(screen.getByText('Not Found')).toBeTruthy();
  });

  it('should not render ENSA version if it is not available', () => {
    const sapSystem = sapSystemFactory.build({
      ensa_version: 'no_ensa',
      instances: sapSystemApplicationInstanceFactory.buildList(5),
    });

    sapSystem.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={sapSystem}
        type={APPLICATION_TYPE}
      />
    );

    expect(screen.getByText('ENSA version').nextSibling).toHaveTextContent('-');
  });

  it('should render a cleanup button and correct health icon when absent instances exist', () => {
    const sapSystem = sapSystemFactory.build({
      instances: sapSystemApplicationInstanceFactory.buildList(5),
    });

    sapSystem.instances[0].absent_at = faker.date.past().toISOString();
    sapSystem.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={sapSystem}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        cleanUpPermittedFor={['cleanup:application_instance']}
        type={APPLICATION_TYPE}
      />
    );

    expect(screen.queryByRole('button', { name: 'Clean up' })).toBeVisible();
    const [_sapSystemIcon, health, _cleanUpIcon] =
      screen.getAllByTestId('eos-svg-component');
    expect(health).toHaveClass('fill-black');
  });

  it.each([
    {
      type: APPLICATION_TYPE,
      text: 'In the case of an ASCS instance',
    },
    {
      type: DATABASE_TYPE,
      text: 'In the case of the last database instance',
    },
  ])('should clean up an instance on request', async ({ type, text }) => {
    const user = userEvent.setup();
    const mockedCleanUp = jest.fn();

    const sapSystem = sapSystemFactory.build({
      instances: sapSystemApplicationInstanceFactory.buildList(2),
    });

    sapSystem.instances[0].absent_at = faker.date.past().toISOString();
    sapSystem.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={sapSystem}
        type={type}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        cleanUpPermittedFor={['cleanup:application_instance']}
        onInstanceCleanUp={mockedCleanUp}
      />
    );

    const cleanUpButton = screen.queryByRole('button', {
      name: 'Clean up',
    });
    await user.click(cleanUpButton);
    expect(
      screen.getByText(text, {
        exact: false,
      })
    ).toBeInTheDocument();

    const cleanUpModalButton = screen.getAllByRole('button', {
      name: 'Clean up',
    })[0];
    await user.click(cleanUpModalButton);
    expect(mockedCleanUp).toHaveBeenCalledWith(sapSystem.instances[0]);
  });

  it('should show instance operations', async () => {
    const user = userEvent.setup();

    const sapSystem = sapSystemFactory.build({
      instances: [
        sapSystemApplicationInstanceFactory.build({ health: 'passing' }),
        sapSystemApplicationInstanceFactory.build({ health: 'unknown' }),
      ],
    });

    sapSystem.hosts = hostFactory.buildList(1);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={sapSystem}
        type={APPLICATION_TYPE}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        cleanUpPermittedFor={[]}
        getInstanceOperations={getSapInstanceOperations}
        operationsEnabled
      />
    );

    const [layoutTable, _] = screen.getAllByRole('table');
    const { getAllByRole } = within(layoutTable);
    const [opButton1, opButton2] = getAllByRole('button');

    await user.click(opButton1);

    const startInstance1 = screen.getByRole('menuitem', {
      name: 'Start instance',
    });
    const stopInstance1 = screen.getByRole('menuitem', {
      name: 'Stop instance',
    });

    expect(startInstance1).toBeInTheDocument();
    expect(stopInstance1).toBeInTheDocument();
    expect(startInstance1).toBeDisabled();
    expect(stopInstance1).toBeEnabled();

    await user.click(opButton2);

    const startInstance2 = screen.getByRole('menuitem', {
      name: 'Start instance',
    });
    const stopInstance2 = screen.getByRole('menuitem', {
      name: 'Stop instance',
    });

    expect(startInstance2).toBeInTheDocument();
    expect(stopInstance2).toBeInTheDocument();
    expect(startInstance2).toBeEnabled();
    expect(stopInstance2).toBeDisabled();
  });

  it.each([
    {
      operation: SAP_INSTANCE_START,
      menuItemText: 'Start instance',
      health: 'unknown',
    },
    {
      operation: SAP_INSTANCE_STOP,
      menuItemText: 'Stop instance',
      health: 'passing',
    },
  ])(
    'should show $operation operation in running state',
    async ({ operation, menuItemText, health }) => {
      const user = userEvent.setup();
      const hosts = hostFactory.buildList(1);
      const hostID = hosts[0].id;

      const sapSystem = sapSystemFactory.build({
        instances: [
          sapSystemApplicationInstanceFactory.build({
            health,
            host_id: hostID,
          }),
        ],
      });

      sapSystem.hosts = hosts;

      const runningOperations = [{ groupID: hostID, operation }];

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={sapSystem}
          type={APPLICATION_TYPE}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          cleanUpPermittedFor={[]}
          runningOperations={runningOperations}
          getInstanceOperations={getSapInstanceOperations}
          operationsEnabled
        />
      );

      const [layoutTable, _] = screen.getAllByRole('table');
      const { getByRole } = within(layoutTable);
      const opButton = getByRole('button');

      await user.click(opButton);

      const menuItem = screen.getByRole('menuitem', {
        name: menuItemText,
      });

      expect(menuItem).toBeDisabled();
      const { getByTestId } = within(menuItem);
      expect(getByTestId('eos-svg-component')).toBeInTheDocument();
    }
  );

  it('should show forbidden operation modal', async () => {
    const user = userEvent.setup();
    const mockCleanForbiddenOperation = jest.fn();

    const hosts = hostFactory.buildList(1);
    const hostID = hosts[0].id;

    const sapSystem = sapSystemFactory.build({
      instances: [
        sapSystemApplicationInstanceFactory.build({ host_id: hostID }),
      ],
    });

    sapSystem.hosts = hosts;

    const forbiddenOperation = SAP_INSTANCE_START;
    const runningOperations = [
      {
        groupID: hostID,
        operation: forbiddenOperation,
        forbidden: true,
        errors: ['error1', 'error2'],
      },
    ];

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={sapSystem}
        type={APPLICATION_TYPE}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        cleanUpPermittedFor={[]}
        runningOperations={runningOperations}
        onCleanForbiddenOperation={mockCleanForbiddenOperation}
        getInstanceOperations={getSapInstanceOperations}
        operationsEnabled
      />
    );

    expect(screen.getByText('Operation Forbidden')).toBeInTheDocument();
    expect(
      screen.getByText('SAP instance start', { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText('error1')).toBeInTheDocument();
    expect(screen.getByText('error2')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', {
      name: 'Close',
    });
    await user.click(closeButton);
    expect(mockCleanForbiddenOperation).toHaveBeenCalled();
  });

  describe('forbidden actions', () => {
    it('should forbid instance cleanup', async () => {
      const user = userEvent.setup();
      const mockedCleanUp = jest.fn();

      const sapSystem = sapSystemFactory.build({
        instances: sapSystemApplicationInstanceFactory.buildList(2),
      });

      sapSystem.instances[0].absent_at = faker.date.past().toISOString();
      sapSystem.hosts = hostFactory.buildList(5);

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={sapSystem}
          type={APPLICATION_TYPE}
          userAbilities={[]}
          cleanUpPermittedFor={['cleanup:application_instance']}
          onInstanceCleanUp={mockedCleanUp}
        />
      );

      const cleanUpButton = screen.getByText('Clean up').closest('button');

      expect(cleanUpButton).toBeDisabled();

      await user.click(cleanUpButton);

      await user.hover(cleanUpButton);

      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeVisible();
    });

    it.each([
      {
        forbidden: true,
        operation: SAP_INSTANCE_START,
        label: 'Start instance',
        abilities: [],
        health: 'unknown',
      },
      {
        forbidden: false,
        operation: SAP_INSTANCE_START,
        label: 'Start instance',
        abilities: [{ name: 'start', resource: 'application_instance' }],
        health: 'unknown',
      },
      {
        forbidden: true,
        operation: SAP_INSTANCE_STOP,
        label: 'Stop instance',
        abilities: [],
        health: 'passing',
      },
      {
        forbidden: false,
        operation: SAP_INSTANCE_STOP,
        label: 'Stop instance',
        abilities: [{ name: 'stop', resource: 'application_instance' }],
        health: 'passing',
      },
    ])(
      'should forbid/authorize instance operation $operation',
      async ({ forbidden, label, abilities, health }) => {
        const user = userEvent.setup();

        const sapSystem = sapSystemFactory.build({
          instances: sapSystemApplicationInstanceFactory.buildList(1, {
            health,
          }),
        });

        sapSystem.hosts = hostFactory.buildList(1);

        renderWithRouter(
          <GenericSystemDetails
            title={faker.string.uuid()}
            system={sapSystem}
            type={APPLICATION_TYPE}
            userAbilities={abilities}
            cleanUpPermittedFor={[]}
            getInstanceOperations={getSapInstanceOperations}
            operationsEnabled
          />
        );

        const [layoutTable, _] = screen.getAllByRole('table');
        const { getByRole } = within(layoutTable);
        const opButton = getByRole('button');

        await user.click(opButton);
        const menuitem = screen.getByRole('menuitem', { name: label });

        if (forbidden) {
          expect(menuitem).toBeDisabled();
        } else {
          expect(menuitem).toBeEnabled();
        }
      }
    );
  });
});
