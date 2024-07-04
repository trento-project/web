import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import 'intersection-observer';
import '@testing-library/jest-dom';
import {
  databaseInstanceFactory,
  hostFactory,
  sapSystemApplicationInstanceFactory,
  generateSid,
} from '@lib/test-utils/factories';

import {
  renderWithRouter,
  withDefaultState,
  withState,
  defaultInitialState,
} from '@lib/test-utils';

import { filterTable, clearFilter } from '@common/Table/Table.test';

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
        instanceID: 'f534a4ad-cef7-5234-b196-e67082ffb50c',
        systemType: 'databases',
        version: '1.1.0+git.dev17.1660137228.fe5ba8a',
      },
      {
        host: 'vmnwqas03',
        ip: '10.90.1.2710.90.1.23',
        provider: '',
        cluster: '',
        sid: 'NWQ',
        instanceID: 'cd52e571-c897-5bba-b0f9-e155ceca1fff',
        systemType: 'sap_systems',
        version: '1.1.0+git.dev17.1660137228.fe5ba8a',
      },
    ].forEach(
      ({
        host,
        ip,
        provider,
        cluster,
        sid,
        instanceID,
        systemType,
        version,
      }) => {
        it(`should show the correct values in the hosts list for host ${host}`, () => {
          const [StatefulHostsList] = withDefaultState(<HostsList />);
          const params = { route: `/hosts?hostname=${host}` };
          renderWithRouter(StatefulHostsList, params);
          const table = screen.getByRole('table');
          expect(table.querySelector('td:nth-child(2)')).toHaveTextContent(
            host
          );
          expect(table.querySelector('td:nth-child(3)')).toHaveTextContent(ip);
          expect(table.querySelector('td:nth-child(4)')).toHaveTextContent(
            provider
          );
          expect(table.querySelector('td:nth-child(5)')).toHaveTextContent(
            cluster
          );
          expect(table.querySelector('td:nth-child(6)')).toHaveTextContent(sid);
          expect(table.querySelector('td:nth-child(6) > a')).toHaveAttribute(
            'href',
            `/${systemType}/${instanceID}`
          );
          expect(table.querySelector('td:nth-child(7)')).toHaveTextContent(
            version
          );
        });
      }
    );

    it('should show a warning state if the agent version is not compatible', async () => {
      const user = userEvent.setup();

      const host1 = hostFactory.build({ agent_version: '1.0.0' });
      const host2 = hostFactory.build({ agent_version: '2.0.0' });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [].concat(host1, host2),
        },
        user: { abilities: [{ name: 'all', resource: 'all' }] },
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

      await act(async () => user.hover(icon1));

      await waitFor(() =>
        expect(
          screen.queryByText(
            'The Agent version is outdated, some features might not work properly. It is advised to keep the Agents up to date with the Server.'
          )
        ).toBeVisible()
      );
    });

    it('should show only unique SIDs', async () => {
      const host = hostFactory.build();
      const duplicatedSID = generateSid();
      const id = faker.string.uuid();
      const applicationInstances =
        sapSystemApplicationInstanceFactory.buildList(2, {
          sap_system_id: id,
          sid: duplicatedSID,
          host_id: host.id,
        });
      const databaseInstances = databaseInstanceFactory.buildList(2, {
        database_id: id,
        host_id: host.id,
        sid: duplicatedSID,
      });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [host],
        },
        sapSystemsList: { applicationInstances },
        databasesList: { databaseInstances },
      };
      const [StatefulHostsList] = withState(<HostsList />, state);
      renderWithRouter(StatefulHostsList);
      expect(screen.getAllByText(duplicatedSID).length).toBe(1);
    });
  });

  describe('deregistration', () => {
    it('should show the clean up button when the host is deregisterable', () => {
      const host1 = hostFactory.build({ deregisterable: true });
      const host2 = hostFactory.build({ deregisterable: false });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [].concat(host1, host2),
        },
        user: { abilities: [{ name: 'all', resource: 'all' }] },
      };

      const [StatefulHostsList] = withState(<HostsList />, state);

      renderWithRouter(StatefulHostsList);
      const table = screen.getByRole('table');
      const cleanUpCell1 = table.querySelector(
        'tr:nth-child(1) > td:nth-child(9)'
      );
      const cleanUpCell2 = table.querySelector(
        'tr:nth-child(2) > td:nth-child(9)'
      );
      expect(cleanUpCell1).toHaveTextContent('Clean up');
      expect(cleanUpCell2).not.toHaveTextContent('Clean up');
    });

    it('should show the host in deregistering state', () => {
      const host = hostFactory.build({
        deregisterable: true,
        deregistering: true,
      });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [host],
        },
        user: { abilities: [{ name: 'all', resource: 'all' }] },
      };

      const [StatefulHostsList] = withState(<HostsList />, state);

      renderWithRouter(StatefulHostsList);
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should request a deregistration when the clean up button in the modal is clicked', async () => {
      const user = userEvent.setup();

      const host = hostFactory.build({ deregisterable: true });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [host],
        },
        user: { abilities: [{ name: 'all', resource: 'all' }] },
      };

      const [StatefulHostsList, store] = withState(<HostsList />, state);

      renderWithRouter(StatefulHostsList);

      const table = screen.getByRole('table');
      const cleanUpButton = table.querySelector(
        'tr:nth-child(1) > td:nth-child(9) > button'
      );

      await user.click(cleanUpButton);

      expect(
        screen.getByText(
          `Clean up data discovered by agent on host ${host.hostname}`
        )
      ).toBeInTheDocument();

      const cleanUpModalButton = screen.getAllByRole('button', {
        name: 'Clean up',
      })[0];

      await user.click(cleanUpModalButton);

      const actions = store.getActions();
      const expectedActions = [
        {
          type: 'DEREGISTER_HOST',
          payload: expect.objectContaining({
            id: host.id,
            hostname: host.hostname,
          }),
        },
      ];
      expect(actions).toEqual(expect.arrayContaining(expectedActions));
    });

    it('should forbid cleaning up a host', async () => {
      const user = userEvent.setup();

      const host = hostFactory.build({ deregisterable: true });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [host],
        },
        user: { abilities: [] },
      };

      const [StatefulHostsList] = withState(<HostsList />, state);

      renderWithRouter(StatefulHostsList);

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
        databases: [],
        databaseInstances: [],
      },
      user: { abilities: [{ name: 'all', resource: 'all' }] },
    };

    const scenarios = [
      {
        filter: 'Health',
        options: ['unknown', 'passing', 'critical'],
        state: {
          ...cleanInitialState,
          hostsList: {
            hosts: [].concat(
              hostFactory.buildList(2, { health: 'unknown' }),
              hostFactory.buildList(2, { health: 'passing' }),
              hostFactory.buildList(2, { health: 'critical' })
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
      const sid = generateSid();
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

      const { health, hostname, tags } = hosts[0];

      const [StatefulHostsList] = withState(<HostsList />, state);
      renderWithRouter(StatefulHostsList);

      [
        ['Health', health],
        ['Hostname', hostname],
        ['SID', sid],
        ['Tags', tags[0].value],
      ].forEach(([filter, option]) => {
        filterTable(filter, option);
      });

      expect(window.location.search).toEqual(
        `?health=${health}&hostname=${hostname}&sid=${sid}&tags=${tags[0].value}`
      );
    });
  });
  describe('tag operations', () => {
    it('should disable tag creation and deletion if the user abilities are not compatible', async () => {
      const host1 = hostFactory.build({
        agent_version: '1.0.0',
        tags: [{ value: 'Tag1' }, { value: 'Tag2' }],
      });
      const state = {
        ...defaultInitialState,
        hostsList: {
          hosts: [host1],
        },
        user: {
          abilities: [{ name: 'all', resource: 'a_resource' }],
        },
      };

      const [StatefulHostsList] = withState(<HostsList />, state);

      renderWithRouter(StatefulHostsList);

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
});
