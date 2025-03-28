import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import {
  clusterFactory,
  clusteredSapInstanceFactory,
} from '@lib/test-utils/factories';
import { filterTable, clearFilter } from '@common/Table/Table.test';
import { renderWithRouter, withState } from '@lib/test-utils';

import ClustersList from './ClustersList';

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
  databasesList: {
    databaseInstances: [],
  },
  user: {
    abilities: [{ name: 'all', resource: 'all' }],
  },
};

describe('ClustersList component', () => {
  describe('tags operations', () => {
    it('should disable tag creation and deletion if the user abilities are not compatible', async () => {
      const state = {
        ...cleanInitialState,
        clustersList: {
          clusters: clusterFactory.buildList(1, {
            tags: [{ value: 'Tag2' }, { value: 'Tag1' }],
          }),
        },
        user: {
          abilities: [{ name: 'all', resource: 'a_resource' }],
        },
      };

      const [StatefulClustersList] = withState(<ClustersList />, state);

      renderWithRouter(StatefulClustersList);
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

  describe('filtering', () => {
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
        options: ['PRD', 'QAS', 'HA1'],
        state: {
          ...cleanInitialState,
          clustersList: {
            clusters: [].concat(
              clusterFactory.buildList(4),
              clusterFactory.buildList(2, {
                sap_instances: clusteredSapInstanceFactory.buildList(2, {
                  sid: 'PRD',
                }),
              }),
              clusterFactory.buildList(2, {
                sap_instances: clusteredSapInstanceFactory.buildList(2, {
                  sid: 'QAS',
                }),
              }),
              clusterFactory.buildList(2, {
                sap_instances: clusteredSapInstanceFactory.buildList(2, {
                  sid: 'HA1',
                }),
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
          const table = screen.getByRole('table');
          await waitFor(() =>
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
            sap_instances: [
              clusteredSapInstanceFactory.build({ sid: 'HA1' }),
              clusteredSapInstanceFactory.build({ sid: 'HA2' }),
            ],
          }),
        },
      };

      const [StatefulClustersList] = withState(<ClustersList />, state);

      renderWithRouter(StatefulClustersList);

      expect(screen.getByText('HA1')).toBeVisible();
      expect(screen.getByText('HA2')).toBeVisible();
    });

    it('should put the filters values in the query string when filters are selected', () => {
      const tag = 'Tag1';
      const sap_instance = clusteredSapInstanceFactory.build();
      const clusters = clusterFactory.buildList(1, {
        sap_instances: [sap_instance],
        tags: [{ value: tag }],
      });
      const state = {
        ...cleanInitialState,
        clustersList: {
          clusters,
        },
      };

      const {
        health,
        name,
        sap_instances: [{ sid }],
        type,
      } = clusters[0];

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

  describe('cluster type', () => {
    it('should add not supported tooltip to HANA+ASCS/ERS cluster types', async () => {
      const state = {
        ...cleanInitialState,
        clustersList: {
          clusters: clusterFactory.buildList(1, {
            type: 'hana_ascs_ers',
          }),
        },
      };

      const [StatefulClustersList] = withState(<ClustersList />, state);

      renderWithRouter(StatefulClustersList);

      const typeLabel = screen.getByText('HANA+ASCS/ERS');
      expect(typeLabel).toBeInTheDocument();
      // Cannot user userEvent, as other tests in suite are using fireEvent in the
      // filterTable function, and it messes up everything
      fireEvent.mouseOver(typeLabel);
      expect(
        screen.getByText(
          'Cluster managing HANA and ASCS/ERS together is not supported by Trento'
        )
      ).toBeInTheDocument();
    });
  });
});
