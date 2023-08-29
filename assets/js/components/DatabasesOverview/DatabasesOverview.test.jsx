import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { databaseFactory } from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';
import { filterTable, clearFilter } from '@components/Table/Table.test';

import DatabasesOverview from './DatabasesOverview';

describe('DatabasesOverview component', () => {
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
      ({ filter, options, databases, expectedRows }) => {
        renderWithRouter(
          <DatabasesOverview databases={databases} databaseInstances={[]} />
        );

        options.forEach(async (option) => {
          filterTable(filter, option);
          screen.getByRole('table');
          const table = await waitFor(() =>
            expect(
              table.querySelectorAll('tbody > tr.cursor-pointer')
            ).toHaveLength(expectedRows)
          );

          clearFilter(filter);
        });
      }
    );

    it('should put the filters values in the query string when filters are selected', () => {
      const databases = databaseFactory.buildList(1, {
        tags: [{ value: 'Tag1' }],
      });

      const { health, sid, tags } = databases[0];

      renderWithRouter(
        <DatabasesOverview databases={databases} databaseInstances={[]} />
      );

      [
        ['Health', health],
        ['SID', sid],
        ['Tags', tags[0].value],
      ].forEach(([filter, option]) => {
        filterTable(filter, option);
      });

      expect(window.location.search).toEqual(
        `?health=${health}&sid=${sid}&tags=${tags[0].value}`
      );
    });
  });
});
