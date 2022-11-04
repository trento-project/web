import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { keysToCamel } from '@lib/serialization';

import { HomeHealthSummary } from './HomeHealthSummary';
import { renderWithRouter, withState } from '../../lib/test-utils';
import {
  setHealthSummary,
  stopHealthSummaryLoading,
} from '../../state/healthSummary';
import { act } from 'react-dom/test-utils';

const homeHealthSummaryPayload = [
  {
    clusterId: '7965f822-0254-5858-abca-f6e8b4c27714',
    clustersHealth: 'passing',
    databaseHealth: 'passing',
    databaseId: 'f534a4ad-cef7-5234-b196-e67082ffb50c',
    hostsHealth: 'critical',
    id: 'f534a4ad-cef7-5234-b196-e67082ffb50c',
    sapsystemHealth: 'passing',
    sid: 'NWD',
  },
  {
    clusterId: '469e7be5-4e20-5007-b044-c6f540a87493',
    clustersHealth: 'passing',
    databaseHealth: 'passing',
    databaseId: '6c9208eb-a5bb-57ef-be5c-6422dedab602',
    hostsHealth: 'critical',
    id: '6c9208eb-a5bb-57ef-be5c-6422dedab602',
    sapsystemHealth: 'passing',
    sid: 'NWP',
  },
  {
    clusterId: 'fa0d74a3-9240-5d9e-99fa-61c4137acf81',
    clustersHealth: 'passing',
    databaseHealth: 'passing',
    databaseId: 'cd52e571-c897-5bba-b0f9-e155ceca1fff',
    hostsHealth: 'critical',
    id: 'cd52e571-c897-5bba-b0f9-e155ceca1fff',
    sapsystemHealth: 'passing',
    sid: 'NWQ',
  },
];

describe('HomeHealthSummary component', () => {
  it('should have a working link to the passing checks in the overview component', () => {
    const [StatefulHomeHealthSummary, store] = withState(<HomeHealthSummary />);
    const { container } = renderWithRouter(StatefulHomeHealthSummary);

    act(() => {
      store.dispatch(setHealthSummary(keysToCamel(homeHealthSummaryPayload)));
      store.dispatch(stopHealthSummaryLoading());
    });

    expect(
      container
        .querySelector(':nth-child(1) > :nth-child(5) > a')
        .getAttribute('href')
    ).toContain('/hosts?sid=NWD');
  });

  describe('health box filter behaviour', () => {
    it('should put the filters values in the query string when health filters are selected', async () => {
      const [StatefulHomeHealthSummary, store] = withState(
        <HomeHealthSummary />
      );
      const { container } = renderWithRouter(StatefulHomeHealthSummary);

      act(() => {
        store.dispatch(setHealthSummary(keysToCamel(homeHealthSummaryPayload)));
        store.dispatch(stopHealthSummaryLoading());
      });

      expect(container.querySelector('tbody').childNodes.length).toEqual(3);

      const cases = [
        ['passing', 0],
        ['warning', 0],
        ['critical', 3],
      ];

      cases.forEach(([health, results]) => {
        fireEvent.click(
          screen.getByTestId(`health-box-${health}-not-selected`)
        );

        expect(container.querySelector('tbody').childNodes.length).toEqual(
          results
        );

        expect(window.location.search).toEqual(`?health=${health}`);

        fireEvent.click(screen.getByTestId(`health-box-${health}-selected`));
      });

      expect(window.location.search).toEqual('');

      cases.forEach(([health]) => {
        fireEvent.click(
          screen.getByTestId(`health-box-${health}-not-selected`)
        );
      });

      expect(window.location.search).toEqual(
        '?health=passing&health=warning&health=critical'
      );
    });
  });
});
