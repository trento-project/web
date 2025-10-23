import React from 'react';
import 'intersection-observer';
import { faker } from '@faker-js/faker';
import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  SAP_SYSTEM_START,
  SAP_SYSTEM_STOP,
  DATABASE_START,
  DATABASE_STOP,
} from '@lib/operations';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import { renderWithRouter } from '@lib/test-utils';

import userEvent from '@testing-library/user-event';

import {
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
  databaseInstanceFactory,
  databaseFactory,
} from '@lib/test-utils/factories';

import {
  getDatabaseOperations,
  getDatabaseSiteOperations,
} from '@pages/DatabaseDetails/databaseOperations';

import { GenericSystemDetails } from './GenericSystemDetails';
import {
  getSapInstanceOperations,
  getSapSystemOperations,
} from './sapOperations';

expect.extend({
  toHaveMenuitem(operation, options) {
    const enabled = options?.enabled ?? false;
    let opItem;
    try {
      opItem = screen.getByRole('menuitem', { name: operation });
    } catch (error) {
      return {
        pass: false,
        message: () =>
          `Expected menuitem with name "${operation}" to be in the document, but was not found.`,
      };
    }
    const isEnabled = !opItem.hasAttribute('disabled');
    const pass = enabled ? isEnabled : !isEnabled;
    return {
      pass,
      message: () =>
        `Expected menuitem "${operation}" to be ${
          enabled ? 'enabled' : 'disabled'
        }, but it was ${isEnabled ? 'enabled' : 'disabled'}.`,
    };
  },

  toBeRunning(operation) {
    let opItem;
    try {
      opItem = screen.getByRole('menuitem', { name: operation });
    } catch (error) {
      return {
        pass: false,
        message: () =>
          `Expected menuitem with name "${operation}" to be in the document, but it was not found.`,
      };
    }

    const isDisabled = opItem.hasAttribute('disabled');
    if (!isDisabled) {
      return {
        pass: false,
        message: () =>
          `Expected menuitem "${operation}" to be disabled but it was enabled.`,
      };
    }

    const { queryByTestId } = within(opItem);
    const svgPresent = queryByTestId('eos-svg-component') !== null;
    if (!svgPresent) {
      return {
        pass: false,
        message: () =>
          `Expected menuitem "${operation}" to contain an element with testId "eos-svg-component", but none was found.`,
      };
    }

    return {
      pass: true,
      message: () =>
        `Expected menuitem "${operation}" not to be running (disabled with svg), but it was.`,
    };
  },
});

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
    expect(screen.queryByText('System Replication')).not.toBeInTheDocument();
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

  it.each([
    { systemReplication: 'Primary', value: 'True', headerAvailable: true },
    { systemReplication: null, value: 'False', headerAvailable: false },
  ])(
    'should render System Replication as $value in a database type system',
    ({ systemReplication, value, headerAvailable }) => {
      const database = databaseFactory.build({
        instances: databaseInstanceFactory.buildList(5, {
          system_replication: systemReplication,
        }),
      });

      database.hosts = hostFactory.buildList(5);

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={database}
          type={DATABASE_TYPE}
          getSiteOperations={getDatabaseSiteOperations}
        />
      );

      expect(
        screen.getByText('System Replication').nextSibling
      ).toHaveTextContent(value);

      const siteTables = screen.getAllByRole('table');
      if (headerAvailable) {
        expect(siteTables[0].previousSibling).toBeTruthy();
      } else {
        expect(siteTables[0].previousSibling).toBeFalsy();
      }
    }
  );

  it('should render System Replication data values', () => {
    const database = databaseFactory.build({
      instances: [
        databaseInstanceFactory.build({
          system_replication: 'Primary',
          system_replication_site: 'Site1',
          system_replication_tier: 1,
          system_replication_status: 'ACTIVE',
        }),
        databaseInstanceFactory.build({
          system_replication: 'Secondary',
          system_replication_site: 'Site2',
          system_replication_tier: 2,
          system_replication_status: null,
          system_replication_source_site: 'Site1',
          system_replication_mode: 'sync',
          system_replication_operation_mode: 'logreplay',
        }),
      ],
    });

    database.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={database}
        type={DATABASE_TYPE}
        getSiteOperations={getDatabaseSiteOperations}
      />
    );

    const siteTables = screen.getAllByRole('table');

    const instance1 = database.instances[0];
    const { getByText: getByTextSite1 } = within(siteTables[0].previousSibling);
    expect(getByTextSite1(instance1.system_replication_site)).toBeTruthy();
    expect(
      getByTextSite1(instance1.system_replication.toUpperCase())
    ).toBeTruthy();
    expect(getByTextSite1('Tier').nextSibling).toHaveTextContent(
      instance1.system_replication_tier.toString()
    );
    expect(getByTextSite1('Status').nextSibling).toHaveTextContent(
      instance1.system_replication_status
    );

    const instance2 = database.instances[1];
    const { getByText: getByTextSite2 } = within(siteTables[1].previousSibling);
    expect(getByTextSite2(instance2.system_replication_site)).toBeTruthy();
    expect(
      getByTextSite2(instance2.system_replication.toUpperCase())
    ).toBeTruthy();
    expect(getByTextSite2('Tier').nextSibling).toHaveTextContent(
      instance2.system_replication_tier.toString()
    );
    expect(getByTextSite2('Replicating').nextSibling).toHaveTextContent(
      instance2.system_replication_source_site
    );
    expect(getByTextSite2('Replication Mode').nextSibling).toHaveTextContent(
      instance2.system_replication_mode
    );
    expect(getByTextSite2('Operation Mode').nextSibling).toHaveTextContent(
      instance2.system_replication_operation_mode
    );
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
      operation: 'Start system',
      enabled: true,
      health: 'unknown',
    },
    {
      operation: 'Start system',
      enabled: false,
      health: 'passing',
    },
    {
      operation: 'Stop system',
      enabled: true,
      health: 'passing',
    },
    {
      operation: 'Stop system',
      enabled: false,
      health: 'unknown',
    },
  ])(
    'should show SAP system operation $operation with enabled state as $enabled',
    async ({ operation, enabled, health }) => {
      const user = userEvent.setup();

      const system = sapSystemFactory.build({
        instances: sapSystemApplicationInstanceFactory.buildList(1, {
          health,
        }),
      });

      system.hosts = hostFactory.buildList(5);

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={system}
          type={APPLICATION_TYPE}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          operationsEnabled
          getSystemOperations={getSapSystemOperations}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Operations' }));

      expect(operation).toHaveMenuitem({ enabled });
    }
  );

  it.each([
    {
      operation: 'Start database',
      enabled: true,
      health: 'unknown',
    },
    {
      operation: 'Start database',
      enabled: false,
      health: 'passing',
    },
    {
      operation: 'Stop database',
      enabled: true,
      health: 'passing',
    },
    {
      operation: 'Stop database',
      enabled: false,
      health: 'unknown',
    },
  ])(
    'should show database operation $operation with enabled state as $enabled',
    async ({ operation, enabled, health }) => {
      const user = userEvent.setup();

      const database = databaseFactory.build({
        instances: databaseInstanceFactory.buildList(1, {
          health,
        }),
      });

      database.hosts = hostFactory.buildList(5);

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={database}
          type={DATABASE_TYPE}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          operationsEnabled
          getSystemOperations={getDatabaseOperations}
          getSiteOperations={getDatabaseSiteOperations}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Operations' }));

      expect(operation).toHaveMenuitem({ enabled });
    }
  );

  it('should disable system operations if system replication is enabled', () => {
    const database = databaseFactory.build({
      instances: databaseInstanceFactory.buildList(1, {
        system_replication: 'Primary',
      }),
    });

    database.hosts = hostFactory.buildList(5);

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={database}
        type={DATABASE_TYPE}
        operationsEnabled
        getSystemOperations={getDatabaseOperations}
        getSiteOperations={getDatabaseSiteOperations}
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'Operations',
      })
    ).toBeDisabled();
  });

  it.each([
    {
      operation: 'Start database',
      enabled: true,
      health: 'unknown',
    },
    {
      operation: 'Start database',
      enabled: false,
      health: 'passing',
    },
    {
      operation: 'Stop database',
      enabled: true,
      health: 'passing',
    },
    {
      operation: 'Stop database',
      enabled: false,
      health: 'unknown',
    },
  ])(
    'should show database site operation $operation with enabled state as $enabled',
    async ({ operation, enabled, health }) => {
      const user = userEvent.setup();

      const database = databaseFactory.build({
        instances: [
          databaseInstanceFactory.build({
            health,
            system_replication: 'Primary',
            system_replication_site: 'Site1',
            system_replication_tier: 1,
          }),
          databaseInstanceFactory.build({
            system_replication: 'Secondary',
            system_replication_site: 'Site2',
            system_replication_tier: 2,
          }),
        ],
      });

      database.hosts = hostFactory.buildList(5);

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={database}
          type={DATABASE_TYPE}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          operationsEnabled
          getSystemOperations={getDatabaseOperations}
          getSiteOperations={getDatabaseSiteOperations}
        />
      );

      const siteTables = screen.getAllByRole('table');

      const { getByRole: getByRoleSite1 } = within(
        siteTables[0].previousSibling
      );
      const siteOpButton1 = getByRoleSite1('button');

      const { getByRole: getByRoleSite2 } = within(
        siteTables[1].previousSibling
      );
      const siteOpButton2 = getByRoleSite2('button');

      await user.click(siteOpButton1);

      expect(operation).toHaveMenuitem({ enabled });

      await user.click(siteOpButton2);

      const opItem2 = screen.getByRole('menuitem', {
        name: operation,
      });

      expect(opItem2).toBeInTheDocument();
    }
  );

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
    'should show instance operation $operation in running state',
    async ({ operation, menuItemText, health }) => {
      const user = userEvent.setup();
      const hosts = hostFactory.buildList(1);
      const hostID = hosts[0].id;
      const instanceNumber = '00';

      const sapSystem = sapSystemFactory.build({
        instances: [
          sapSystemApplicationInstanceFactory.build({
            health,
            host_id: hostID,
            instance_number: instanceNumber,
          }),
        ],
      });

      sapSystem.hosts = hosts;

      const runningOperations = [
        { groupID: hostID, operation, metadata: { instanceNumber } },
      ];

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

      expect(menuItemText).toBeRunning(operation);
    }
  );

  it.each([
    {
      operation: SAP_SYSTEM_START,
      menuItemText: 'Start system',
      health: 'unknown',
      type: APPLICATION_TYPE,
      getOperations: getSapSystemOperations,
    },
    {
      operation: SAP_SYSTEM_STOP,
      menuItemText: 'Stop system',
      health: 'passing',
      type: APPLICATION_TYPE,
      getOperations: getSapSystemOperations,
    },
    {
      operation: DATABASE_START,
      menuItemText: 'Start database',
      health: 'unknown',
      type: DATABASE_TYPE,
      getOperations: getDatabaseOperations,
    },
    {
      operation: DATABASE_STOP,
      menuItemText: 'Stop database',
      health: 'passing',
      type: DATABASE_TYPE,
      getOperations: getDatabaseOperations,
    },
  ])(
    'should show system/database operation $operation in running state',
    async ({ operation, menuItemText, health, type, getOperations }) => {
      const user = userEvent.setup();
      const hosts = hostFactory.buildList(1);

      const sapSystem = sapSystemFactory.build({
        instances: [
          sapSystemApplicationInstanceFactory.build({
            health,
          }),
        ],
      });

      sapSystem.hosts = hosts;

      const runningOperations = [{ groupID: sapSystem.id, operation }];

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={sapSystem}
          type={type}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          cleanUpPermittedFor={[]}
          runningOperations={runningOperations}
          getSystemOperations={getOperations}
          operationsEnabled
        />
      );

      await user.click(screen.getByRole('button', { name: 'Operations' }));

      expect(menuItemText).toBeRunning(operation);
    }
  );

  it.each([
    {
      operation: DATABASE_START,
      menuItemText: 'Start database',
      health: 'unknown',
    },
    {
      operation: DATABASE_STOP,
      menuItemText: 'Stop database',
      health: 'passing',
    },
  ])(
    'should show database site operation $operation in running state',
    async ({ operation, menuItemText, health }) => {
      const user = userEvent.setup();
      const hosts = hostFactory.buildList(1);
      const site = 'Site1';

      const database = databaseFactory.build({
        instances: [
          databaseInstanceFactory.build({
            health,
            system_replication: 'Primary',
            system_replication_site: site,
          }),
          databaseInstanceFactory.build({
            health,
            system_replication: 'Secondary',
            system_replication_site: 'Site2',
          }),
        ],
      });

      database.hosts = hosts;

      const runningOperations = [
        {
          groupID: database.id,
          operation,
          metadata: { params: { site } },
        },
      ];

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={database}
          type={DATABASE_TYPE}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          cleanUpPermittedFor={[]}
          runningOperations={runningOperations}
          getSiteOperations={getDatabaseSiteOperations}
          operationsEnabled
        />
      );

      const siteTables = screen.getAllByRole('table');

      const { getByRole: getByRoleSite1 } = within(
        siteTables[0].previousSibling
      );
      const siteOpButton1 = getByRoleSite1('button');

      const { getByRole: getByRoleSite2 } = within(
        siteTables[1].previousSibling
      );
      const siteOpButton2 = getByRoleSite2('button');

      await user.click(siteOpButton1);
      expect(menuItemText).toBeRunning(operation);

      await user.click(siteOpButton2);
      expect(menuItemText).toHaveMenuitem({ enabled: false });
    }
  );

  it.each([
    { index: 0, scenario: 'an operation in the same host' },
    { index: 1, scenario: 'system operation' },
  ])(
    'should disable instance operations if a $scenario is running',
    async ({ index }) => {
      const user = userEvent.setup();
      const hosts = hostFactory.buildList(1);
      const hostID = hosts[0].id;
      const sapSystemID = faker.string.uuid();

      const sapSystem = sapSystemFactory.build({
        id: sapSystemID,
        instances: [
          sapSystemApplicationInstanceFactory.build({
            host_id: hostID,
            sap_system_id: sapSystemID,
            health: 'passing',
          }),
        ],
      });

      sapSystem.hosts = hosts;

      // use hostID and sapSystemID as group ID to test disabled both scenarios
      const groupID = index === 0 ? hostID : sapSystemID;
      const runningOperations = [{ groupID, operation: SAP_SYSTEM_START }];

      renderWithRouter(
        <GenericSystemDetails
          title={faker.string.uuid()}
          system={sapSystem}
          type={APPLICATION_TYPE}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          cleanUpPermittedFor={[]}
          runningOperations={runningOperations}
          getInstanceOperations={getSapInstanceOperations}
          getSystemOperations={getSapSystemOperations}
          operationsEnabled
        />
      );

      const [layoutTable, _] = screen.getAllByRole('table');
      const { getByRole } = within(layoutTable);
      const opButton = getByRole('button');

      await user.click(opButton);

      expect('Start instance').toHaveMenuitem({ enabled: false });
      expect('Stop instance').toHaveMenuitem({ enabled: false });
    }
  );

  it('should disable systems operations if an instance operation is running', async () => {
    const user = userEvent.setup();
    const hosts = hostFactory.buildList(1);
    const hostID = hosts[0].id;

    const sapSystem = sapSystemFactory.build({
      instances: [
        sapSystemApplicationInstanceFactory.build({
          health: 'unknown',
          host_id: hostID,
        }),
      ],
    });

    sapSystem.hosts = hosts;

    const runningOperations = [
      { groupID: hostID, operation: SAP_INSTANCE_START },
    ];

    renderWithRouter(
      <GenericSystemDetails
        title={faker.string.uuid()}
        system={sapSystem}
        type={APPLICATION_TYPE}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        cleanUpPermittedFor={[]}
        runningOperations={runningOperations}
        getInstanceOperations={getSapInstanceOperations}
        getSystemOperations={getSapSystemOperations}
        operationsEnabled
      />
    );

    const opButton = screen.getByRole('button', { name: 'Operations' });
    await user.click(opButton);

    expect('Start system').toHaveMenuitem({ enabled: false });
    expect('Stop system').toHaveMenuitem({ enabled: false });
  });

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

        expect(label).toHaveMenuitem({ enabled: !forbidden });
      }
    );

    it.each([
      {
        forbidden: true,
        operation: SAP_SYSTEM_START,
        label: 'Start system',
        abilities: [],
        health: 'unknown',
        type: APPLICATION_TYPE,
        getOperations: getSapSystemOperations,
      },
      {
        forbidden: false,
        operation: SAP_SYSTEM_START,
        label: 'Start system',
        abilities: [{ name: 'start', resource: 'sap_system' }],
        health: 'unknown',
        type: APPLICATION_TYPE,
        getOperations: getSapSystemOperations,
      },
      {
        forbidden: true,
        operation: SAP_SYSTEM_STOP,
        label: 'Stop system',
        abilities: [],
        health: 'passing',
        type: APPLICATION_TYPE,
        getOperations: getSapSystemOperations,
      },
      {
        forbidden: false,
        operation: SAP_SYSTEM_STOP,
        label: 'Stop system',
        abilities: [{ name: 'stop', resource: 'sap_system' }],
        health: 'passing',
        type: APPLICATION_TYPE,
        getOperations: getSapSystemOperations,
      },
      {
        forbidden: true,
        operation: DATABASE_START,
        label: 'Start database',
        abilities: [],
        health: 'unknown',
        type: DATABASE_TYPE,
        getOperations: getDatabaseOperations,
      },
      {
        forbidden: false,
        operation: DATABASE_START,
        label: 'Start database',
        abilities: [{ name: 'start', resource: 'database' }],
        health: 'unknown',
        type: DATABASE_TYPE,
        getOperations: getDatabaseOperations,
      },
      {
        forbidden: true,
        operation: DATABASE_STOP,
        label: 'Stop database',
        abilities: [],
        health: 'passing',
        type: DATABASE_TYPE,
        getOperations: getDatabaseOperations,
      },
      {
        forbidden: false,
        operation: DATABASE_STOP,
        label: 'Stop database',
        abilities: [{ name: 'stop', resource: 'database' }],
        health: 'passing',
        type: DATABASE_TYPE,
        getOperations: getDatabaseOperations,
      },
    ])(
      'should forbid/authorize system/database operation $operation',
      async ({ forbidden, label, abilities, health, type, getOperations }) => {
        const user = userEvent.setup();

        // reusing a sap system for a database test, they have the same attributes
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
            type={type}
            userAbilities={abilities}
            cleanUpPermittedFor={[]}
            operationsEnabled
            getSystemOperations={getOperations}
          />
        );

        await user.click(screen.getByRole('button', { name: 'Operations' }));

        expect(label).toHaveMenuitem({ enabled: !forbidden });
      }
    );

    it.each([
      {
        forbidden: true,
        operation: DATABASE_START,
        label: 'Start database',
        abilities: [],
        health: 'unknown',
      },
      {
        forbidden: false,
        operation: DATABASE_START,
        label: 'Start database',
        abilities: [{ name: 'start', resource: 'database' }],
        health: 'unknown',
      },
      {
        forbidden: true,
        operation: DATABASE_STOP,
        label: 'Stop database',
        abilities: [],
        health: 'passing',
      },
      {
        forbidden: false,
        operation: DATABASE_STOP,
        label: 'Stop database',
        abilities: [{ name: 'stop', resource: 'database' }],
        health: 'passing',
      },
    ])(
      'should forbid/authorize database site operation $operation',
      async ({ forbidden, label, abilities, health }) => {
        const user = userEvent.setup();

        const database = databaseFactory.build({
          instances: databaseInstanceFactory.buildList(1, {
            health,
            system_replication: 'Primary',
            system_replication_site: 'Site1',
          }),
        });

        database.hosts = hostFactory.buildList(1);

        renderWithRouter(
          <GenericSystemDetails
            title={faker.string.uuid()}
            system={database}
            type={DATABASE_TYPE}
            userAbilities={abilities}
            cleanUpPermittedFor={[]}
            operationsEnabled
            getSiteOperations={getDatabaseSiteOperations}
          />
        );

        const siteTables = screen.getAllByRole('table');

        const { getByRole } = within(siteTables[0].previousSibling);
        const siteOpButton = getByRole('button');
        await user.click(siteOpButton);

        expect(label).toHaveMenuitem({ enabled: !forbidden });
      }
    );
  });
});
