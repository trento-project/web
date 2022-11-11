import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import SapSystemsOverview from './SapSystemsOverview';
import { renderWithRouter, withDefaultState } from '../../lib/test-utils';

describe('SapSystemsOverviews component', () => {
  describe('query string filtering behavior', () => {
    it('should put the filters values in the query string when filters are selected', () => {
      const [StatefulSapSystemsOverview] = withDefaultState(
        <SapSystemsOverview />
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
        '?health=passing&sid=NWD&tags=tag1'
      );
    });
  });
});
