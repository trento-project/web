import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { hostFactory } from '@lib/test-utils/factories';

import {
  renderWithRouter,
  withDefaultState,
  withState,
  defaultInitialState,
} from '@lib/test-utils';

import { filterTable, clearFilter } from '@components/Table/Table.test';

import HostsList from './HostsList';

describe('HostsLists component', () => {
  describe('list content', () => {
    [
      {
        host: 'vmhdbdev01',
        ip: '10.100.1.1110.100.1.13',
        provider: 'Azure',
        cluster: 'hana_cluster_1',
        sid: 'HDD',
        version: '1.1.0+git.dev17.1660137228.fe5ba8a',
      },
      {
        host: 'vmnwqas03',
        ip: '10.90.1.2710.90.1.23',
        provider: '',
        cluster: '',
        sid: 'NWQ',
        version: '1.1.0+git.dev17.1660137228.fe5ba8a',
      },
    ].forEach(({ host, ip, provider, cluster, sid, version }) => {
      it(`should show the correct values in the hosts list for host ${host}`, () => {
        const [StatefulHostsList] = withDefaultState(<HostsList />);
        const params = { route: `/hosts?hostname=${host}` };
        renderWithRouter(StatefulHostsList, params);

        const table = screen.getByRole('table');
        expect(table.querySelector('td:nth-child(2)')).toHaveTextContent(host);
        expect(table.querySelector('td:nth-child(3)')).toHaveTextContent(ip);
        expect(table.querySelector('td:nth-child(4)')).toHaveTextContent(
          provider
        );
        expect(table.querySelector('td:nth-child(5)')).toHaveTextContent(
          cluster
        );
        expect(table.querySelector('td:nth-child(6)')).toHaveTextContent(sid);
        expect(table.querySelector('td:nth-child(7)')).toHaveTextContent(
          version
        );
      });
    });

    it('should show a warning state if the agent version is not compatible', () => {
      const user = userEvent.setup();

      const host1 = hostFactory.build({ agent_version: '1.0.0' });
      const host2 = hostFactory.build({ agent_version: '2.0.0' });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [].concat(host1, host2),
        },
      };

      const [StatefulHostsList] = withState(<HostsList />, state);

      renderWithRouter(StatefulHostsList);
      const table = screen.getByRole('table');
      const host1VersionCell = table.querySelector(
        'tr:nth-child(1) > td:nth-child(7)'
      );
      expect(host1VersionCell).toHaveTextContent('1.0.0');
      const icon1 = host1VersionCell.querySelector(
        "[data-testid='eos-svg-component']"
      );
      expect(icon1.classList.toString()).toContain('fill-yellow-800');

      const host2VersionCell = table.querySelector(
        'tr:nth-child(2) > td:nth-child(7)'
      );
      expect(host2VersionCell).toHaveTextContent('2.0.0');
      expect(
        host2VersionCell.querySelector("[data-testid='eos-svg-component']")
      ).toBeNull();

      user.hover(host2VersionCell);
      expect(
        screen.queryByText(
          'Agent version 2.0.0 or greater is required for new checks engine.'
        )
      ).toBeInTheDocument();
    });
  });

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
        options: ['unknown', 'passing', 'critical'],
        state: {
          ...cleanInitialState,
          hostsList: {
            hosts: [].concat(
              hostFactory.buildList(2, { heartbeat: 'unknown' }),
              hostFactory.buildList(2, { heartbeat: 'passing' }),
              hostFactory.buildList(2, { heartbeat: 'critical' })
            ),
          },
        },
        expectedRows: 2,
      },
      {
        filter: 'Hostname',
        options: ['host1', 'host2'],
        state: {
          ...cleanInitialState,
          hostsList: {
            hosts: [].concat(
              hostFactory.buildList(4),
              hostFactory.buildList(1, { hostname: 'host1' }),
              hostFactory.buildList(1, { hostname: 'host2' })
            ),
          },
        },
        expectedRows: 1,
      },
      {
        filter: 'SID',
        options: ['PRD', 'QAS'],
        state: {
          ...cleanInitialState,
          hostsList: {
            hosts: [].concat(
              hostFactory.buildList(4),
              hostFactory.buildList(1, { id: 'host1' }),
              hostFactory.buildList(1, { id: 'host2' }),
              hostFactory.buildList(1, { id: 'host3' }),
              hostFactory.buildList(1, { id: 'host4' })
            ),
          },
          sapSystemsList: {
            applicationInstances: [
              { sid: 'PRD', host_id: 'host1' },
              { sid: 'QAS', host_id: 'host3' },
            ],
            databaseInstances: [
              { sid: 'PRD', host_id: 'host2' },
              { sid: 'QAS', host_id: 'host4' },
            ],
          },
        },
        expectedRows: 2,
      },
      {
        filter: 'Tags',
        options: ['Tag1', 'Tag2'],
        state: {
          ...cleanInitialState,
          hostsList: {
            hosts: [].concat(
              hostFactory.buildList(2),
              hostFactory.buildList(2, { tags: [{ value: 'Tag1' }] }),
              hostFactory.buildList(2, { tags: [{ value: 'Tag2' }] })
            ),
          },
        },
        expectedRows: 2,
      },
    ];

    it.each(scenarios)(
      'should filter the table content by $filter filter',
      ({ filter, options, state, expectedRows }) => {
        const [StatefulHostsList] = withState(<HostsList />, state);

        renderWithRouter(StatefulHostsList);

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

    it('should put the filters values in the query string when filters are selected', () => {
      const hosts = hostFactory.buildList(1, {
        id: 'host1',
        tags: [{ value: 'Tag1' }],
      });
      const sid = 'PRD';
      const state = {
        ...cleanInitialState,
        hostsList: {
          hosts,
        },
        sapSystemsList: {
          applicationInstances: [{ sid, host_id: 'host1' }],
          databaseInstances: [],
        },
      };

      const { heartbeat, hostname, tags } = hosts[0];

      const [StatefulHostsList] = withState(<HostsList />, state);
      renderWithRouter(StatefulHostsList);

      [
        ['Health', heartbeat],
        ['Hostname', hostname],
        ['SID', sid],
        ['Tags', tags[0].value],
      ].forEach(([filter, option]) => {
        filterTable(filter, option);
      });

      expect(window.location.search).toEqual(
        `?heartbeat=${heartbeat}&hostname=${hostname}&sid=${sid}&tags=${tags[0].value}`
      );
    });
  });
});
