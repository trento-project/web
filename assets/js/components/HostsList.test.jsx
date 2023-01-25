import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import HostsList from './HostsList';
import { renderWithRouter, withDefaultState } from '../lib/test-utils';

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
  });

  describe('query string filtering behavior', () => {
    it('should put the filters values in the query string when filters are selected', () => {
      const [StatefulHostsList] = withDefaultState(<HostsList />);
      renderWithRouter(StatefulHostsList);

      ['Health', 'Hostname', 'Tags', 'SID'].forEach((filter) => {
        fireEvent.click(screen.getByTestId(`filter-${filter}`));

        fireEvent.click(
          screen
            .getByTestId(`filter-${filter}-options`)
            .querySelector('li > div > span').firstChild
        );
      });

      expect(window.location.search).toEqual(
        '?heartbeat=unknown&hostname=vmdrbddev01&tags=tag1&sid=HDD'
      );
    });
  });
});
