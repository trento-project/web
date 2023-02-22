import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { sapSystemFactory } from '@lib/test-utils/factories';
import { renderWithRouter, withState } from '@lib/test-utils';
import { filterTable, clearFilter } from '@components/Table/Table.test';

import SapSystemsOverview from './SapSystemsOverview';

describe('SapSystemsOverviews component', () => {
  describe('filtering', () => {
    const cleanInitialState = {
      hostsList: {
        hosts: [],
      },
      clustersList: {
        clusters: [],
      },
      sapSystemsList: {
        sapSystems: [],
        applicationInstances: [],
        databaseInstances: [],
      },
    };

    const scenarios = [
      {
        filter: 'Health',
        options: ['unknown', 'passing', 'warning', 'critical'],
        state: {
          ...cleanInitialState,
          sapSystemsList: {
            sapSystems: [].concat(
              sapSystemFactory.buildList(2, { health: 'unknown' }),
              sapSystemFactory.buildList(2, { health: 'passing' }),
              sapSystemFactory.buildList(2, { health: 'warning' }),
              sapSystemFactory.buildList(2, { health: 'critical' })
            ),
            applicationInstances: [],
            databaseInstances: [],
          },
        },
        expectedRows: 2,
      },
      {
        filter: 'SID',
        options: ['PRD', 'QAS'],
        state: {
          ...cleanInitialState,
          sapSystemsList: {
            sapSystems: [].concat(
              sapSystemFactory.buildList(4),
              sapSystemFactory.buildList(2, { sid: 'PRD' }),
              sapSystemFactory.buildList(2, { sid: 'QAS' })
            ),
            applicationInstances: [],
            databaseInstances: [],
          },
        },
        expectedRows: 2,
      },
      {
        filter: 'Tags',
        options: ['Tag1', 'Tag2'],
        state: {
          ...cleanInitialState,
          sapSystemsList: {
            sapSystems: [].concat(
              sapSystemFactory.buildList(2),
              sapSystemFactory.buildList(2, { tags: [{ value: 'Tag1' }] }),
              sapSystemFactory.buildList(2, { tags: [{ value: 'Tag2' }] })
            ),
            applicationInstances: [],
            databaseInstances: [],
          },
        },
        expectedRows: 2,
      },
    ];

    it.each(scenarios)(
      'should filter the table content by $filter filter',
      ({ filter, options, state, expectedRows }) => {
        const [StatefulSapSystemList] = withState(
          <SapSystemsOverview />,
          state
        );

        renderWithRouter(StatefulSapSystemList);

        options.forEach((option) => {
          filterTable(filter, option);

          const table = screen.getByRole('table');
          expect(
            table.querySelectorAll('tbody > tr.cursor-pointer')
          ).toHaveLength(expectedRows);

          clearFilter(filter);
        });
      }
    );

    it('should put the filters values in the query string when filters are selected', () => {
      const sapSystems = sapSystemFactory.buildList(1, {
        tags: [{ value: 'Tag1' }],
      });

      const state = {
        ...cleanInitialState,
        sapSystemsList: {
          sapSystems,
          applicationInstances: [],
          databaseInstances: [],
        },
      };

      const { health, sid, tags } = sapSystems[0];

      const [StatefulSapSystemsOverview] = withState(
        <SapSystemsOverview />,
        state
      );
      renderWithRouter(StatefulSapSystemsOverview);

      ['Health', 'SID', 'Tags'].forEach((filter) => {
        fireEvent.click(screen.getByTestId(`filter-${filter}`));

        fireEvent.click(
          screen
            .getByTestId(`filter-${filter}-options`)
            .querySelector('li > div > span').firstChild
        );
      });

      expect(window.location.search).toEqual(
        `?health=${health}&sid=${sid}&tags=${tags[0].value}`
      );
    });
  });
});
