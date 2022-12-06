import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import ClustersList from './ClustersList';
import { renderWithRouter, withDefaultState } from '../lib/test-utils';

describe('ClustersList component', () => {
  describe('query string filtering behavior', () => {
    it('should put the filters values in the query string when filters are selected', () => {
      const [StatefulClustersList] = withDefaultState(<ClustersList />);
      renderWithRouter(StatefulClustersList);

      ['Health', 'Name', 'SID', 'Type', 'Tags'].forEach((filter) => {
        fireEvent.click(screen.getByTestId(`filter-${filter}`));

        fireEvent.click(
          screen
            .getByTestId(`filter-${filter}-options`)
            .querySelector('li > div > span').firstChild,
        );
      });

      expect(window.location.search).toEqual(
        '?health=unknown&name=drbd_cluster&sid=HDD&type=unknown&tags=tag1',
      );
    });
  });
});
