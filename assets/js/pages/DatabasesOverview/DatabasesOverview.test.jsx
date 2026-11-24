// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';

import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';

import {
  databaseFactory,
  databaseInstanceFactory,
} from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';
import { filterTable, clearFilter } from '@lib/test-utils/table';
import { readViewSetting, writeViewSetting } from '@lib/viewSettings';
import { waiveOperationDisclaimer } from '@lib/operations';

import DatabasesOverview from './DatabasesOverview';

const userAbilities = [{ name: 'all', resource: 'all' }];

describe('DatabasesOverview component', () => {
  beforeEach(() => {
    // Restore filter settings
    window.sessionStorage.clear();
  });

  describe('overview content', () => {
    it('should display stale databases with gray background and stale icon', async () => {
      const user = userEvent.setup();
      const staleDate = faker.date.past().toISOString();
      const databaseID = faker.string.uuid();
      const database = databaseFactory.build({
        id: databaseID,
        health: 'passing',
        stale_at: staleDate,
      });

      const databaseInstances = databaseInstanceFactory.buildList(2, {
        database_id: databaseID,
        stale_at: staleDate,
      });

      renderWithRouter(
        <DatabasesOverview
          databases={[database]}
          databaseInstances={databaseInstances}
          userAbilities={userAbilities}
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

  describe('tag operations', () => {
    it('should disable tag creation and delete when user abilities are not compatible', () => {
      const database = databaseFactory.build({
        tags: [{ value: 'Tag1' }, { value: 'Tag2' }],
      });
      const abilities = [{ name: 'all', resource: 'another_resource' }];

      renderWithRouter(
        <DatabasesOverview
          databases={[database]}
          databaseInstances={database.database_instances}
          userAbilities={abilities}
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
  describe('instance cleanup', () => {
    it('should clean up database instance on request', async () => {
      const user = userEvent.setup();
      const mockedCleanUp = jest.fn();

      const database = databaseFactory.build();

      database.database_instances[0].absent_at = faker.date
        .past()
        .toISOString();

      renderWithRouter(
        <DatabasesOverview
          databases={[database]}
          userAbilities={userAbilities}
          databaseInstances={database.database_instances}
          onInstanceCleanUp={mockedCleanUp}
        />
      );

      const table = screen.getByRole('table');
      await user.click(
        table.querySelector(
          'tbody tr:nth-child(1) td[aria-label="collapsible-icon-cell"]'
        )
      );

      const cleanUpButton = screen.queryByRole('button', { name: 'Clean up' });
      await user.click(cleanUpButton);
      expect(
        screen.getByText('In the case of the last database instance', {
          exact: false,
        })
      ).toBeInTheDocument();

      const cleanUpModalButton = screen.getAllByRole('button', {
        name: 'Clean up',
      })[0];
      await user.click(cleanUpModalButton);
      expect(mockedCleanUp).toHaveBeenCalledWith(
        database.database_instances[0]
      );
    });

    it('should forbid instance cleanup', async () => {
      const user = userEvent.setup();

      const database = databaseFactory.build();

      database.database_instances[0].absent_at = faker.date
        .past()
        .toISOString();

      renderWithRouter(
        <DatabasesOverview
          databases={[database]}
          databaseInstances={database.database_instances}
          userAbilities={[]}
        />
      );

      const table = screen.getByRole('table');
      await user.click(
        table.querySelector(
          'tbody tr:nth-child(1) td[aria-label="collapsible-icon-cell"]'
        )
      );

      const cleanUpButton = screen.getByText('Clean up').closest('button');

      expect(cleanUpButton).toBeDisabled();

      await user.click(cleanUpButton);

      await user.hover(cleanUpButton);

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
        databases: [].concat(
          databaseFactory.buildList(2, { health: 'unknown' }),
          databaseFactory.buildList(2, { health: 'passing' }),
          databaseFactory.buildList(2, { health: 'warning' }),
          databaseFactory.buildList(2, { health: 'critical' })
        ),
        expectedRows: 2,
      },
      {
        filter: 'SID',
        options: ['PRD', 'QAS'],
        databases: [].concat(
          databaseFactory.buildList(4),
          databaseFactory.buildList(2, { sid: 'PRD' }),
          databaseFactory.buildList(2, { sid: 'QAS' })
        ),
        expectedRows: 2,
      },
      {
        filter: 'Tags',
        options: ['Tag1', 'Tag2'],
        databases: [].concat(
          databaseFactory.buildList(2),
          databaseFactory.buildList(2, { tags: [{ value: 'Tag1' }] }),
          databaseFactory.buildList(2, { tags: [{ value: 'Tag2' }] })
        ),
        expectedRows: 2,
      },
    ];

    it.each(scenarios)(
      'should filter the table content by $filter filter',
      async ({ filter, options, databases, expectedRows }) => {
        const user = userEvent.setup();

        renderWithRouter(
          <DatabasesOverview
            databases={databases}
            databaseInstances={[]}
            userAbilities={userAbilities}
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

      const databases = databaseFactory.buildList(1, {
        tags: [{ value: 'Tag1' }],
      });

      const { health, sid, tags } = databases[0];

      renderWithRouter(
        <DatabasesOverview
          databases={databases}
          databaseInstances={[]}
          userAbilities={userAbilities}
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
      const databases = [].concat(
        databaseFactory.buildList(3, { health: 'critical' }),
        databaseFactory.buildList(2, { health: 'passing' })
      );

      writeViewSetting('databases', 'health=critical&itemsPerPage=20');

      renderWithRouter(
        <DatabasesOverview
          databases={databases}
          databaseInstances={[]}
          userAbilities={userAbilities}
        />,
        { route: '/databases' }
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
      const databases = [].concat(
        databaseFactory.buildList(3, { health: 'critical' }),
        databaseFactory.buildList(2, { health: 'passing' })
      );

      writeViewSetting('databases', 'health=critical');

      renderWithRouter(
        <DatabasesOverview
          databases={databases}
          databaseInstances={[]}
          userAbilities={userAbilities}
        />,
        { route: '/databases?health=passing' }
      );

      await waitFor(() =>
        expect(
          screen.getByRole('table').querySelectorAll('tbody > tr:not([hidden])')
        ).toHaveLength(2)
      );

      await waitFor(() =>
        expect(readViewSetting('databases')).toEqual('health=passing')
      );
    });

    it('should store the selected filters', async () => {
      const user = userEvent.setup();

      const databases = [].concat(
        databaseFactory.buildList(3, { health: 'critical' }),
        databaseFactory.buildList(2, { health: 'passing' })
      );

      renderWithRouter(
        <DatabasesOverview
          databases={databases}
          databaseInstances={[]}
          userAbilities={userAbilities}
        />,
        { route: '/databases' }
      );

      await filterTable(user, 'Health', 'critical');

      await waitFor(() =>
        expect(readViewSetting('databases')).toEqual('health=critical')
      );
    });

    it('should store the selected items per page', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <DatabasesOverview
          databases={databaseFactory.buildList(3)}
          databaseInstances={[]}
          userAbilities={userAbilities}
        />,
        { route: '/databases' }
      );

      await user.click(screen.getByRole('combobox', { name: 'per-page' }));
      await user.click(screen.getByRole('option', { name: '50' }));

      await waitFor(() =>
        expect(readViewSetting('databases')).toEqual('itemsPerPage=50')
      );
    });
  });

  describe('bulk operations', () => {
    beforeAll(() => waiveOperationDisclaimer());

    const selectDatabases = async (user, databases, indexes) => {
      for (const index of indexes) {
        const row = screen.getByText(databases[index].sid).closest('tr');
        await user.click(
          within(row).getByRole('checkbox', { name: 'Select row' })
        );
      }
    };

    it('should not allow selecting databases when operations are disabled', () => {
      renderWithRouter(
        <DatabasesOverview
          databases={databaseFactory.buildList(2)}
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
        operation: 'Start database',
        description: 'Start the following databases:',
      },
      {
        operation: 'Stop database',
        description: 'Stop the following databases:',
      },
    ])(
      'should list the selected databases in the $operation modal',
      async ({ operation, description }) => {
        const user = userEvent.setup();
        const databases = databaseFactory.buildList(3);

        renderWithRouter(
          <DatabasesOverview
            databases={databases}
            databaseInstances={[]}
            userAbilities={userAbilities}
            operationsEnabled
          />
        );

        await selectDatabases(user, databases, [0, 2]);

        await user.click(screen.getByRole('button', { name: 'Operations' }));
        await user.click(screen.getByRole('menuitem', { name: operation }));

        const modal = screen.getByRole('dialog');
        expect(within(modal).getByText(description)).toBeInTheDocument();
        expect(
          within(modal)
            .getAllByRole('listitem')
            .map(({ textContent }) => textContent)
        ).toEqual([databases[0].sid, databases[2].sid]);
      }
    );

    it('should request the operation with the default timeout in seconds', async () => {
      const user = userEvent.setup();
      const databases = databaseFactory.buildList(2);
      const onOperationRequest = jest.fn();

      renderWithRouter(
        <DatabasesOverview
          databases={databases}
          databaseInstances={[]}
          userAbilities={userAbilities}
          operationsEnabled
          onOperationRequest={onOperationRequest}
        />
      );

      await selectDatabases(user, databases, [1]);

      await user.click(screen.getByRole('button', { name: 'Operations' }));
      await user.click(
        screen.getByRole('menuitem', { name: 'Start database' })
      );

      const modal = screen.getByRole('dialog');
      expect(within(modal).getByRole('spinbutton')).toHaveValue('5');

      await user.click(within(modal).getByRole('button', { name: 'Request' }));

      expect(onOperationRequest).toHaveBeenCalledWith({
        operation: 'database_start',
        databases: [expect.objectContaining({ id: databases[1].id })],
        params: { timeout: 300 },
      });
    });

    it('should request the operation with the given timeout in seconds', async () => {
      const user = userEvent.setup();
      const databases = databaseFactory.buildList(2);
      const onOperationRequest = jest.fn();

      renderWithRouter(
        <DatabasesOverview
          databases={databases}
          databaseInstances={[]}
          userAbilities={userAbilities}
          operationsEnabled
          onOperationRequest={onOperationRequest}
        />
      );

      await selectDatabases(user, databases, [0, 1]);

      await user.click(screen.getByRole('button', { name: 'Operations' }));
      await user.click(screen.getByRole('menuitem', { name: 'Stop database' }));

      const modal = screen.getByRole('dialog');
      const timeoutInput = within(modal).getByRole('spinbutton');
      await user.clear(timeoutInput);
      await user.type(timeoutInput, '10');

      await user.click(within(modal).getByRole('button', { name: 'Request' }));

      expect(onOperationRequest).toHaveBeenCalledWith({
        operation: 'database_stop',
        databases: [
          expect.objectContaining({ id: databases[0].id }),
          expect.objectContaining({ id: databases[1].id }),
        ],
        params: { timeout: 600 },
      });
    });

    it('should show the forbidden modal and dismiss it', async () => {
      const user = userEvent.setup();
      const onOperationForbiddenDismiss = jest.fn();
      const [database] = databaseFactory.buildList(1);

      renderWithRouter(
        <DatabasesOverview
          databases={[database]}
          databaseInstances={[]}
          userAbilities={userAbilities}
          operationsEnabled
          runningOperation={{
            operation: 'database_start',
            forbidden: true,
            errors: [
              {
                detail: 'Not allowed',
                metadata: [],
                resource: {
                  id: database.id,
                  label: database.sid,
                  type: 'database',
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
