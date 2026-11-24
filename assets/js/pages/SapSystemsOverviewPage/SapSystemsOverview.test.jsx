// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';

import {
  clusterFactory,
  clusteredSapInstanceFactory,
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import { filterTable, clearFilter } from '@lib/test-utils/table';
import { readViewSetting, writeViewSetting } from '@lib/viewSettings';
import { waiveOperationDisclaimer } from '@lib/operations';

import SapSystemsOverview from './SapSystemsOverview';

const userAbilities = [{ name: 'all', resource: 'all' }];

describe('SapSystemsOverviews component', () => {
  beforeEach(() => {
    // Restore filter settings
    window.sessionStorage.clear();
  });

  describe('overview content', () => {
    it('should display the correct number of SAP systems', () => {
      const sapSystemCount = 3;
      const expectedRowCount = sapSystemCount * 2;

      const sapSystems = sapSystemFactory.buildList(sapSystemCount);

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
        />
      );

      expect(
        screen.getByRole('table').querySelectorAll('tbody > tr')
      ).toHaveLength(expectedRowCount);
    });

    it('should display the correct content for a SAP system main row', () => {
      const sapSystemType = 'ABAP';
      const sapSystemID = faker.string.uuid();

      const sapSystem = sapSystemFactory.build({
        id: sapSystemID,
        ensa_version: 'ensa1',
        application_instances: sapSystemApplicationInstanceFactory.buildList(
          2,
          { sap_system_id: sapSystemID, features: sapSystemType }
        ),
      });
      const {
        tenant,
        db_host: dbAddress,
        application_instances: applicationInstances,
        database_instances: databaseInstances,
        database_id: databaseID,
        database_sid: attachedRdbms,
        sid,
      } = sapSystem;

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={[sapSystem]}
          userAbilities={userAbilities}
          applicationInstances={applicationInstances}
          databaseInstances={databaseInstances}
        />
      );
      const rows = screen.getByRole('table').querySelectorAll('tbody > tr');
      const mainRow = rows[0];

      expect(mainRow.querySelector('td:nth-child(2)')).toHaveTextContent(sid);
      expect(mainRow.querySelector('td:nth-child(2) > a')).toHaveAttribute(
        'href',
        `/sap_systems/${sapSystemID}`
      );
      expect(mainRow.querySelector('td:nth-child(3)')).toHaveTextContent(
        attachedRdbms
      );
      expect(mainRow.querySelector('td:nth-child(3) > a')).toHaveAttribute(
        'href',
        `/databases/${databaseID}`
      );
      expect(mainRow.querySelector('td:nth-child(4)')).toHaveTextContent(
        tenant
      );
      expect(mainRow.querySelector('td:nth-child(5)')).toHaveTextContent(
        sapSystemType
      );
      expect(mainRow.querySelector('td:nth-child(6)')).toHaveTextContent(
        dbAddress
      );
      expect(mainRow.querySelector('td:nth-child(7)')).toHaveTextContent(
        'ENSA1'
      );
    });

    it('should display the correct SAP system type JAVA or ABAP', () => {
      const sapSystemTypes = [
        'ABAP',
        'J2EE',
        'SOME_SAP_SYSTEM_FEATURE|NOT_A_REAL_SYSTEM',
      ];

      const expectedSapSystemTypes = ['ABAP', 'JAVA', ''];

      const sapSystems = sapSystemTypes.map((type) => {
        const sapSystemID = faker.string.uuid();
        return sapSystemFactory.build({
          id: sapSystemID,
          application_instances: sapSystemApplicationInstanceFactory.buildList(
            2,
            { sap_system_id: sapSystemID, features: type }
          ),
        });
      });

      const sapSystemApplicationInstances = sapSystems
        .map((sapSystem) => sapSystem.application_instances)
        .flat();

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={sapSystems}
          userAbilities={userAbilities}
          applicationInstances={sapSystemApplicationInstances}
          databaseInstances={[]}
        />
      );
      const rows = screen.getByRole('table').querySelectorAll('tbody > tr');
      expectedSapSystemTypes.forEach((expectedType, index) => {
        const rowIndex = index * 2;
        const sapSystemRow = rows[rowIndex];
        expect(sapSystemRow.querySelector('td:nth-child(5)')).toHaveTextContent(
          expectedType
        );
      });
    });

    it('should display the correct SAP system type JAVA and ABAP', () => {
      const expectedSapSystemTypes = 'ABAP+JAVA';
      const sapSystemID = faker.string.uuid();
      const sapSystem = sapSystemFactory.build({
        id: sapSystemID,
        application_instances: [
          sapSystemApplicationInstanceFactory.build({
            sap_system_id: sapSystemID,
            features: 'ABAP',
          }),
          sapSystemApplicationInstanceFactory.build({
            sap_system_id: sapSystemID,
            features: 'J2EE',
          }),
          sapSystemApplicationInstanceFactory.build({
            sap_system_id: sapSystemID,
            features: 'SOME_SAP_SYSTEM_FEATURE|OTHER_SAP_APP',
          }),
        ],
      });

      const { application_instances: applicationInstances } = sapSystem;

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={[sapSystem]}
          userAbilities={userAbilities}
          applicationInstances={applicationInstances}
          databaseInstances={[]}
        />
      );
      const rows = screen.getByRole('table').querySelectorAll('tbody > tr');
      expect(rows[0].querySelector('td:nth-child(5)')).toHaveTextContent(
        expectedSapSystemTypes
      );
    });

    it('should display the correct content for a SAP system instances', () => {
      const sapSystem = sapSystemFactory.build();
      const {
        application_instances: applicationInstances,
        database_instances: databaseInstances,
      } = sapSystem;

      const enrichedApplicationInstances = applicationInstances.map(
        (instance) => {
          const host = hostFactory.build({ id: instance.host_id });
          const { sid, instance_number } = instance;
          return {
            ...instance,
            host: {
              ...host,
              cluster: clusterFactory.build({
                id: host.cluster_id,
                type: 'hana_scale_up',
                sap_instances: clusteredSapInstanceFactory.buildList(1, {
                  sid,
                  instance_number,
                }),
              }),
            },
          };
        }
      );

      const enrichedDatabaseInstances = databaseInstances.map((instance) => {
        const host = hostFactory.build({ id: instance.host_id });
        const { sid, instance_number } = instance;

        return {
          ...instance,
          host: {
            ...host,
            cluster: clusterFactory.build({
              id: host.cluster_id,
              type: 'hana_scale_up',
              sap_instances: clusteredSapInstanceFactory.buildList(1, {
                sid,
                instance_number,
              }),
            }),
          },
        };
      });
      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={[sapSystem]}
          applicationInstances={enrichedApplicationInstances}
          databaseInstances={enrichedDatabaseInstances}
        />
      );

      const detailsRow = screen
        .getByRole('table')
        .querySelectorAll('tbody > tr')[1];
      const appTable = detailsRow.querySelectorAll('div.table')[0];
      const dbTable = detailsRow.querySelectorAll('div.table')[1];

      const appInstanceRows = appTable.querySelectorAll(
        '.table-row-group > .table-row'
      );

      const dbInstanceRows = dbTable.querySelectorAll(
        '.table-row-group > .table-row'
      );

      enrichedApplicationInstances.forEach((instance, index) => {
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(2)')
        ).toHaveTextContent(instance.instance_number);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(4)')
        ).toHaveTextContent(instance.host.cluster.name);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(4) > a')
        ).toHaveAttribute('href', `/clusters/${instance.host.cluster.id}`);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(5)')
        ).toHaveTextContent(instance.host.hostname);
        expect(
          appInstanceRows[index].querySelector(
            '.table-cell:nth-child(5) > span > a'
          )
        ).toHaveAttribute('href', `/hosts/${instance.host.id}`);
      });

      enrichedDatabaseInstances.forEach((instance, index) => {
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(2)')
        ).toHaveTextContent(instance.instance_number);
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(5)')
        ).toHaveTextContent(instance.host.cluster.name);
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(5) > a')
        ).toHaveAttribute('href', `/clusters/${instance.host.cluster.id}`);
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(6)')
        ).toHaveTextContent(instance.host.hostname);
        expect(
          dbInstanceRows[index].querySelector(
            '.table-cell:nth-child(6) > span > a'
          )
        ).toHaveAttribute('href', `/hosts/${instance.host.id}`);
      });
    });

    it('should display stale SAP systems with gray background and stale icon', async () => {
      const user = userEvent.setup();
      const sapSystemID = faker.string.uuid();
      const staleDate = faker.date.past().toISOString();
      const sapSystem = sapSystemFactory.build({
        id: sapSystemID,
        health: 'passing',
        stale_at: staleDate,
        application_instances: sapSystemApplicationInstanceFactory.buildList(
          2,
          { sap_system_id: sapSystemID, stale_at: staleDate }
        ),
      });

      const { application_instances: applicationInstances } = sapSystem;

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={[sapSystem]}
          applicationInstances={applicationInstances}
          databaseInstances={[]}
        />
      );

      const rows = screen.getByRole('table').querySelectorAll('tbody > tr');
      expect(rows[0]).toHaveClass('bg-gray-100');

      const healthCell = rows[0].querySelector('td:nth-child(1)');
      const svgs = healthCell.querySelectorAll(
        '[data-testid="eos-svg-component"]'
      );
      expect(svgs).toHaveLength(2);

      const table = screen.getByRole('table');
      await user.click(
        table.querySelector(
          'tbody tr:nth-child(1) td[aria-label="collapsible-icon-cell"]'
        )
      );

      const detailsRow = screen
        .getByRole('table')
        .querySelectorAll('tbody > tr')[1];
      expect(detailsRow).toHaveClass('bg-gray-100');

      const instanceRows = detailsRow.querySelectorAll(
        'div.table-row-group > div.table-row'
      );
      expect(instanceRows[0]).toHaveClass('bg-gray-100');
    });
  });

  describe('instance cleanup', () => {
    it.each([
      {
        type: APPLICATION_TYPE,
        text: 'In the case of an ASCS instance',
        field: 'application_instances',
        row: 0,
      },
      {
        type: DATABASE_TYPE,
        text: 'In the case of the last database instance',
        field: 'database_instances',
        row: 1,
      },
    ])(
      'should clean up $type instance on request',
      async ({ type, text, field, row }) => {
        const user = userEvent.setup();
        const mockedCleanUp = jest.fn();

        const sapSystem = sapSystemFactory.build();

        sapSystem.database_instances[0].absent_at = faker.date
          .past()
          .toISOString();

        sapSystem.application_instances[0].absent_at = faker.date
          .past()
          .toISOString();

        renderWithRouter(
          <SapSystemsOverview
            sapSystems={[sapSystem]}
            userAbilities={userAbilities}
            applicationInstances={sapSystem.application_instances}
            databaseInstances={sapSystem.database_instances}
            onInstanceCleanUp={mockedCleanUp}
          />
        );

        const table = screen.getByRole('table');
        await user.click(
          table.querySelector(
            'tbody tr:nth-child(1) td[aria-label="collapsible-icon-cell"]'
          )
        );

        const cleanUpButton = screen.queryAllByRole('button', {
          name: 'Clean up',
        })[row];
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
        expect(mockedCleanUp).toHaveBeenCalledWith(sapSystem[field][0], type);
      }
    );

    it('should forbid instance cleanup', async () => {
      const user = userEvent.setup();

      const sapSystem = sapSystemFactory.build();

      sapSystem.database_instances[0].absent_at = faker.date
        .past()
        .toISOString();

      sapSystem.application_instances[0].absent_at = faker.date
        .past()
        .toISOString();

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={[sapSystem]}
          applicationInstances={sapSystem.application_instances}
          databaseInstances={sapSystem.database_instances}
          userAbilities={[]}
        />
      );

      const table = screen.getByRole('table');
      await user.click(
        table.querySelector(
          'tbody tr:nth-child(1) td[aria-label="collapsible-icon-cell"]'
        )
      );

      const cleanUpButtons = screen.getAllByRole('button', {
        name: 'Clean up',
      });

      const applicationCleanUpButton = cleanUpButtons[0].closest('button');
      const databaseCleanUpButton = cleanUpButtons[1].closest('button');

      expect(applicationCleanUpButton).toBeDisabled();
      expect(databaseCleanUpButton).toBeDisabled();

      await user.click(applicationCleanUpButton);

      await user.hover(applicationCleanUpButton);

      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeVisible();
    });
  });

  describe('filtering', () => {
    const scenarios = [
      {
        filter: 'Health',
        options: ['unknown', 'passing', 'warning', 'critical'],
        sapSystems: [].concat(
          sapSystemFactory.buildList(2, { health: 'unknown' }),
          sapSystemFactory.buildList(2, { health: 'passing' }),
          sapSystemFactory.buildList(2, { health: 'warning' }),
          sapSystemFactory.buildList(2, { health: 'critical' })
        ),
        expectedRows: 2,
      },
      {
        filter: 'SID',
        options: ['PRD', 'QAS'],
        sapSystems: [].concat(
          sapSystemFactory.buildList(4),
          sapSystemFactory.buildList(2, { sid: 'PRD' }),
          sapSystemFactory.buildList(2, { sid: 'QAS' })
        ),

        expectedRows: 2,
      },
      {
        filter: 'Tags',
        options: ['Tag1', 'Tag2'],
        sapSystems: [].concat(
          sapSystemFactory.buildList(2),
          sapSystemFactory.buildList(2, { tags: [{ value: 'Tag1' }] }),
          sapSystemFactory.buildList(2, { tags: [{ value: 'Tag2' }] })
        ),
        expectedRows: 2,
      },
    ];

    it.each(scenarios)(
      'should filter the table content by $filter filter',
      async ({ filter, options, sapSystems, expectedRows }) => {
        const user = userEvent.setup();

        renderWithRouter(
          <SapSystemsOverview
            userAbilities={userAbilities}
            sapSystems={sapSystems}
            applicationInstances={[]}
            databaseInstances={[]}
          />
        );

        for (const option of options) {
          await filterTable(user, filter, option);

          const table = screen.getByRole('table');
          await waitFor(() =>
            expect(
              table.querySelectorAll('tbody > tr:not([hidden])')
            ).toHaveLength(expectedRows)
          );

          await clearFilter(user, filter);
        }
      }
    );

    it('should put the filters values in the query string when filters are selected', async () => {
      const user = userEvent.setup();

      const sapSystems = sapSystemFactory.buildList(1, {
        tags: [{ value: 'Tag1' }],
      });

      const { health, sid, tags } = sapSystems[0];

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
        />
      );

      const filters = [
        ['Health', health],
        ['SID', sid],
        ['Tags', tags[0].value],
      ];

      for (const [filter, option] of filters) {
        await filterTable(user, filter, option);
      }

      await waitFor(() =>
        expect(window.location.search).toEqual(
          `?health=${health}&sid=${sid}&tags=${tags[0].value}`
        )
      );
    });

    it('should restore the stored filters when landing on a bare url', async () => {
      const sapSystems = [].concat(
        sapSystemFactory.buildList(3, { health: 'critical' }),
        sapSystemFactory.buildList(2, { health: 'passing' })
      );

      writeViewSetting('sapSystems', 'health=critical&itemsPerPage=20');

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
        />,
        { route: '/sap_systems' }
      );

      await waitFor(() => {
        const params = new URLSearchParams(window.location.search);

        expect(params.get('health')).toEqual('critical');
        expect(params.get('itemsPerPage')).toEqual('20');
      });

      expect(
        screen.getByRole('table').querySelectorAll('tbody > tr:not([hidden])')
      ).toHaveLength(3);
    });

    it('should let the filters in the url win over the stored ones', async () => {
      const sapSystems = [].concat(
        sapSystemFactory.buildList(3, { health: 'critical' }),
        sapSystemFactory.buildList(2, { health: 'passing' })
      );

      writeViewSetting('sapSystems', 'health=critical');

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
        />,
        { route: '/sap_systems?health=passing' }
      );

      await waitFor(() =>
        expect(
          screen.getByRole('table').querySelectorAll('tbody > tr:not([hidden])')
        ).toHaveLength(2)
      );

      await waitFor(() =>
        expect(readViewSetting('sapSystems')).toEqual('health=passing')
      );
    });

    it('should store the selected filters', async () => {
      const user = userEvent.setup();

      const sapSystems = [].concat(
        sapSystemFactory.buildList(3, { health: 'critical' }),
        sapSystemFactory.buildList(2, { health: 'passing' })
      );

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
        />,
        { route: '/sap_systems' }
      );

      await filterTable(user, 'Health', 'critical');

      await waitFor(() =>
        expect(readViewSetting('sapSystems')).toEqual('health=critical')
      );
    });

    it('should store the selected items per page', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={sapSystemFactory.buildList(3)}
          applicationInstances={[]}
          databaseInstances={[]}
        />,
        { route: '/sap_systems' }
      );

      await user.click(screen.getByRole('combobox', { name: 'per-page' }));
      await user.click(screen.getByRole('option', { name: '50' }));

      await waitFor(() =>
        expect(readViewSetting('sapSystems')).toEqual('itemsPerPage=50')
      );
    });
  });

  describe('tag operations', () => {
    it('should disable tag creation and deletion if the user abilities are not compatible', () => {
      const abilities = [{ name: 'all', resource: 'another_resource' }];

      const sapSystem = sapSystemFactory.build({
        tags: [{ value: 'Tag1' }, { value: 'Tag2' }],
      });

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={abilities}
          sapSystems={[sapSystem]}
          applicationInstances={[]}
          databaseInstances={[]}
        />
      );

      expect(screen.queryByText('Add Tag')).toHaveClass('opacity-50');
      // grab the X
      expect(
        screen.queryByText('Tag1').children.item(0).children.item(0)
      ).toHaveClass('opacity-50');
      expect(
        screen.queryByText('Tag2').children.item(0).children.item(0)
      ).toHaveClass('opacity-50');
    });
  });

  describe('bulk operations', () => {
    beforeAll(() => waiveOperationDisclaimer());

    const selectSapSystems = async (user, sapSystems, indexes) => {
      for (const index of indexes) {
        const row = screen.getByText(sapSystems[index].sid).closest('tr');
        await user.click(
          within(row).getByRole('checkbox', { name: 'Select row' })
        );
      }
    };

    it('should not allow selecting SAP systems when operations are disabled', () => {
      renderWithRouter(
        <SapSystemsOverview
          sapSystems={sapSystemFactory.buildList(2)}
          applicationInstances={[]}
          databaseInstances={[]}
          userAbilities={userAbilities}
          operationsEnabled={false}
        />
      );

      expect(
        screen.queryByRole('checkbox', { name: 'Select row' })
      ).not.toBeInTheDocument();
    });

    it.each([
      {
        operation: 'Start SAP system',
        description: 'Start the following SAP systems:',
      },
      {
        operation: 'Stop SAP system',
        description: 'Stop the following SAP systems:',
      },
    ])(
      'should list the selected SAP systems in the $operation modal',
      async ({ operation, description }) => {
        const user = userEvent.setup();
        const sapSystems = sapSystemFactory.buildList(3);

        renderWithRouter(
          <SapSystemsOverview
            sapSystems={sapSystems}
            applicationInstances={[]}
            databaseInstances={[]}
            userAbilities={userAbilities}
            operationsEnabled
          />
        );

        await selectSapSystems(user, sapSystems, [0, 2]);

        await user.click(screen.getByRole('button', { name: 'Operations' }));
        await user.click(screen.getByRole('menuitem', { name: operation }));

        const modal = screen.getByRole('dialog');
        expect(within(modal).getByText(description)).toBeInTheDocument();
        expect(
          within(modal)
            .getAllByRole('listitem')
            .map(({ textContent }) => textContent)
        ).toEqual([sapSystems[0].sid, sapSystems[2].sid]);
      }
    );

    it('should request the operation with the default params', async () => {
      const user = userEvent.setup();
      const sapSystems = sapSystemFactory.buildList(2);
      const onOperationRequest = jest.fn();

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
          userAbilities={userAbilities}
          operationsEnabled
          onOperationRequest={onOperationRequest}
        />
      );

      await selectSapSystems(user, sapSystems, [1]);

      await user.click(screen.getByRole('button', { name: 'Operations' }));
      await user.click(
        screen.getByRole('menuitem', { name: 'Start SAP system' })
      );

      const modal = screen.getByRole('dialog');
      expect(within(modal).getByRole('spinbutton')).toHaveValue('5');

      await user.click(within(modal).getByRole('button', { name: 'Request' }));

      expect(onOperationRequest).toHaveBeenCalledWith({
        operation: 'sap_system_start',
        sapSystems: [expect.objectContaining({ id: sapSystems[1].id })],
        params: { instance_type: 'all', timeout: 300 },
      });
    });

    it('should request the operation with the given instance type and timeout', async () => {
      const user = userEvent.setup();
      const sapSystems = sapSystemFactory.buildList(2);
      const onOperationRequest = jest.fn();

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
          userAbilities={userAbilities}
          operationsEnabled
          onOperationRequest={onOperationRequest}
        />
      );

      await selectSapSystems(user, sapSystems, [0, 1]);

      await user.click(screen.getByRole('button', { name: 'Operations' }));
      await user.click(
        screen.getByRole('menuitem', { name: 'Stop SAP system' })
      );

      const modal = screen.getByRole('dialog');
      await user.click(
        within(modal).getByRole('combobox', { name: 'instance_type' })
      );
      await user.click(
        within(modal).getByRole('option', { name: 'ABAP instances' })
      );
      const timeoutInput = within(modal).getByRole('spinbutton');
      await user.clear(timeoutInput);
      await user.type(timeoutInput, '10');

      await user.click(within(modal).getByRole('button', { name: 'Request' }));

      expect(onOperationRequest).toHaveBeenCalledWith({
        operation: 'sap_system_stop',
        sapSystems: [
          expect.objectContaining({ id: sapSystems[0].id }),
          expect.objectContaining({ id: sapSystems[1].id }),
        ],
        params: { instance_type: 'abap', timeout: 600 },
      });
    });

    it('should show the forbidden modal and dismiss it', async () => {
      const user = userEvent.setup();
      const onOperationForbiddenDismiss = jest.fn();
      const [sapSystem] = sapSystemFactory.buildList(1);

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={[sapSystem]}
          applicationInstances={[]}
          databaseInstances={[]}
          userAbilities={userAbilities}
          operationsEnabled
          runningOperation={{
            operation: 'sap_system_start',
            forbidden: true,
            errors: [
              {
                detail: 'Not allowed',
                metadata: [],
                resource: {
                  id: sapSystem.id,
                  label: sapSystem.sid,
                  type: 'sap_system',
                },
              },
            ],
          }}
          onOperationForbiddenDismiss={onOperationForbiddenDismiss}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(within(modal).getByText('Not allowed')).toBeInTheDocument();

      await user.click(within(modal).getByRole('button', { name: 'Close' }));

      expect(onOperationForbiddenDismiss).toHaveBeenCalled();
    });
  });
});
