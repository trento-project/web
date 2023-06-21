import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import {
  clusterFactory,
  hostFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import { renderWithRouter, withState } from '@lib/test-utils';
import { filterTable, clearFilter } from '@components/Table/Table.test';

import SapSystemsOverview from './SapSystemsOverview';

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

describe('SapSystemsOverviews component', () => {
  describe('overview content', () => {
    it('should display the correct number of SAP systems', () => {
      const sapSystemCount = 3;
      const expectedRowCount = sapSystemCount * 2;
      const state = {
        ...cleanInitialState,
        sapSystemsList: {
          sapSystems: sapSystemFactory.buildList(sapSystemCount),
          applicationInstances: [],
          databaseInstances: [],
        },
      };

      const [StatefulSapSystemList] = withState(<SapSystemsOverview />, state);

      renderWithRouter(StatefulSapSystemList);

      expect(
        screen.getByRole('table').querySelectorAll('tbody > tr')
      ).toHaveLength(expectedRowCount);
    });

    it('should display the correct content for a SAP system main row', () => {
      const sapSystem = sapSystemFactory.build({ ensa_version: 'ensa1' });
      const {
        id: sapSystemID,
        sid,
        tenant,
        db_host: dbAddress,
        application_instances: applicationInstances,
        database_instances: databaseInstances,
      } = sapSystem;

      const state = {
        ...cleanInitialState,
        sapSystemsList: {
          sapSystems: [sapSystem],
          applicationInstances,
          databaseInstances,
        },
      };

      const [StatefulSapSystemList] = withState(<SapSystemsOverview />, state);

      renderWithRouter(StatefulSapSystemList);

      const rows = screen.getByRole('table').querySelectorAll('tbody > tr');
      const mainRow = rows[0];

      expect(mainRow.querySelector('td:nth-child(2)')).toHaveTextContent(sid);
      expect(mainRow.querySelector('td:nth-child(2) > a')).toHaveAttribute(
        'href',
        `/sap_systems/${sapSystemID}`
      );
      expect(mainRow.querySelector('td:nth-child(3)')).toHaveTextContent(
        tenant
      );
      expect(mainRow.querySelector('td:nth-child(3) > a')).toHaveAttribute(
        'href',
        `/databases/${sapSystemID}`
      );
      expect(mainRow.querySelector('td:nth-child(4)')).toHaveTextContent(
        tenant
      );
      expect(mainRow.querySelector('td:nth-child(5)')).toHaveTextContent(
        dbAddress
      );
      expect(mainRow.querySelector('td:nth-child(6)')).toHaveTextContent(
        'ENSA1'
      );
    });

    it('should display the correct content for a SAP system instances', () => {
      const sapSystem = sapSystemFactory.build();
      const {
        application_instances: applicationInstances,
        database_instances: databaseInstances,
      } = sapSystem;

      const hosts = applicationInstances
        .concat(databaseInstances)
        .map(({ host_id: hostID }) => hostFactory.build({ id: hostID }));

      const clusters = hosts.map(({ cluster_id: clusterID }) =>
        clusterFactory.build({ id: clusterID, type: 'hana_scale_up' })
      );

      const state = {
        ...cleanInitialState,
        sapSystemsList: {
          sapSystems: [sapSystem],
          applicationInstances,
          databaseInstances,
        },
        hostsList: {
          hosts,
        },
        clustersList: {
          clusters,
        },
      };

      const [StatefulSapSystemList] = withState(<SapSystemsOverview />, state);

      renderWithRouter(StatefulSapSystemList);

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

      applicationInstances.forEach((instance, index) => {
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(2)')
        ).toHaveTextContent(instance.instance_number);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(4)')
        ).toHaveTextContent(clusters[index].name);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(4) > a')
        ).toHaveAttribute('href', `/clusters/${clusters[index].id}`);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(5)')
        ).toHaveTextContent(hosts[index].hostname);
        expect(
          appInstanceRows[index].querySelector(
            '.table-cell:nth-child(5) > span > a'
          )
        ).toHaveAttribute('href', `/hosts/${hosts[index].id}`);
      });

      databaseInstances.forEach((instance, index) => {
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(2)')
        ).toHaveTextContent(instance.instance_number);
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(5)')
        ).toHaveTextContent(clusters[applicationInstances.length + index].name);
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(5) > a')
        ).toHaveAttribute(
          'href',
          `/clusters/${clusters[applicationInstances.length + index].id}`
        );
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(6)')
        ).toHaveTextContent(
          hosts[applicationInstances.length + index].hostname
        );
        expect(
          dbInstanceRows[index].querySelector(
            '.table-cell:nth-child(6) > span > a'
          )
        ).toHaveAttribute(
          'href',
          `/hosts/${hosts[applicationInstances.length + index].id}`
        );
      });
    });
  });

  describe('filtering', () => {
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
