import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import HostsList from './HostsList';
import { renderWithRouter, withDefaultState } from '../lib/test-utils';

describe('HostsLists component', () => {
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
