import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { clusterFactory } from '@lib/test-utils/factories';
import { filterTable, clearFilter } from '@components/Table/Table.test';
import { renderWithRouter, withState } from '@lib/test-utils';

import ClustersList from './ClustersList';

describe('ClustersList component', () => {
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
          clustersList: {
            clusters: [].concat(
              clusterFactory.buildList(2, { health: 'unknown' }),
              clusterFactory.buildList(2, { health: 'passing' }),
              clusterFactory.buildList(2, { health: 'warning' }),
              clusterFactory.buildList(2, { health: 'critical' })
            ),
          },
        },
        expectedRows: 2,
      },
      {
        filter: 'Name',
        options: ['cluster1', 'cluster2'],
        state: {
          ...cleanInitialState,
          clustersList: {
            clusters: [].concat(
              clusterFactory.buildList(4),
              clusterFactory.buildList(1, { name: 'cluster1' }),
              clusterFactory.buildList(1, { name: 'cluster2' })
            ),
          },
        },
        expectedRows: 1,
      },
      {
        filter: 'SID',
        options: ['PRD', 'QAS', 'HA1', 'HA2'],
        state: {
          ...cleanInitialState,
          clustersList: {
            clusters: [].concat(
              clusterFactory.buildList(4),
              clusterFactory.buildList(2, { sid: 'PRD' }),
              clusterFactory.buildList(2, { sid: 'QAS' }),
              clusterFactory.buildList(2, {
                sid: null,
                additional_sids: ['HA1', 'HA2'],
              })
            ),
          },
        },
        expectedRows: 2,
      },
      {
        filter: 'Type',
        options: ['hana_scale_up', 'ascs_ers'],
        state: {
          ...cleanInitialState,
          clustersList: {
            clusters: [].concat(
              clusterFactory.buildList(2, { type: 'unknown' }),
              clusterFactory.buildList(2, { type: 'hana_scale_up' }),
              clusterFactory.buildList(2, { type: 'ascs_ers' })
            ),
          },
        },
        expectedRows: 2,
      },
      {
        filter: 'Tags',
        options: ['Tag1', 'Tag2'],
        state: {
          ...cleanInitialState,
          clustersList: {
            clusters: [].concat(
              clusterFactory.buildList(2),
              clusterFactory.buildList(2, { tags: [{ value: 'Tag1' }] }),
              clusterFactory.buildList(2, { tags: [{ value: 'Tag2' }] })
            ),
          },
        },
        expectedRows: 2,
      },
    ];

    it.each(scenarios)(
      'should filter the table content by $filter filter',
      ({ filter, options, state, expectedRows }) => {
        const [StatefulClustersList] = withState(<ClustersList />, state);

        renderWithRouter(StatefulClustersList);

        options.forEach(async (option) => {
          filterTable(filter, option);
          screen.getByRole('table');
          const table = await waitFor(() =>
            expect(table.querySelectorAll('tbody > tr')).toHaveLength(
              expectedRows
            )
          );

          clearFilter(filter);
        });
      }
    );

    it('should show SIDs delimited by comma in multi-sid clusters', () => {
      const state = {
        ...cleanInitialState,
        clustersList: {
          clusters: clusterFactory.buildList(1, {
            sid: null,
            additional_sids: ['HA1', 'HA2'],
          }),
        },
      };

      const [StatefulClustersList] = withState(<ClustersList />, state);

      renderWithRouter(StatefulClustersList);

      expect(screen.getByText('HA1, HA2')).toBeVisible();
    });

    it('should put the filters values in the query string when filters are selected', () => {
      const tag = 'Tag1';
      const clusters = clusterFactory.buildList(1, {
        tags: [{ value: tag }],
      });
      const state = {
        ...cleanInitialState,
        clustersList: {
          clusters,
        },
      };

      const { health, name, sid, type } = clusters[0];

      const [StatefulClustersList] = withState(<ClustersList />, state);
      renderWithRouter(StatefulClustersList);

      [
        ['Health', health],
        ['Name', name],
        ['SID', sid],
        ['Type', type],
        ['Tags', tag],
      ].forEach(([filter, option]) => {
        filterTable(filter, option);
      });

      expect(window.location.search).toEqual(
        `?health=${health}&name=${name}&sid=${sid}&type=${type}&tags=${tag}`
      );
    });
  });
});
