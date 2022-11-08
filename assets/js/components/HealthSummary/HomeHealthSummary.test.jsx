import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { keysToCamel } from '@lib/serialization';

import { HomeHealthSummary } from './HomeHealthSummary';
import { renderWithRouter, withState } from '@lib/test-utils';
import {
  setHealthSummary,
  stopHealthSummaryLoading,
} from '@state/healthSummary';
import { act } from 'react-dom/test-utils';
import { healthSummaryFactory } from '../../lib/test-utils/factories';

const homeHealthSummaryActionPayload = [
  healthSummaryFactory.build({
    clustersHealth: 'passing',
    databaseHealth: 'passing',
    hostsHealth: 'critical',
    sapsystemHealth: 'passing',
    sid: 'NWD',
  }),
  healthSummaryFactory.build({
    clustersHealth: 'passing',
    databaseHealth: 'passing',
    hostsHealth: 'critical',
    sapsystemHealth: 'passing',
  }),
  healthSummaryFactory.build({
    clustersHealth: 'passing',
    databaseHealth: 'passing',
    hostsHealth: 'critical',
    sapsystemHealth: 'passing',
  }),
];

describe('HomeHealthSummary component', () => {
  it('should have a clickable SAP INSTANCE icon with link to the belonging instance', () => {
    const [StatefulHomeHealthSummary, store] = withState(<HomeHealthSummary />);
    const { container } = renderWithRouter(StatefulHomeHealthSummary);
    const [{ id }] = homeHealthSummaryActionPayload;

    act(() => {
      store.dispatch(
        setHealthSummary(keysToCamel(homeHealthSummaryActionPayload))
      );
      store.dispatch(stopHealthSummaryLoading());
    });

    expect(
      container
        .querySelector(':nth-child(1) > :nth-child(1) > a')
        .getAttribute('href')
    ).toContain(`/sap_systems/${id}`);
  });
});

describe('HomeHealthSummary component', () => {
  it('should have a working link to the passing checks in the overview component', () => {
    const [StatefulHomeHealthSummary, store] = withState(<HomeHealthSummary />);
    const { container } = renderWithRouter(StatefulHomeHealthSummary);

    act(() => {
      store.dispatch(
        setHealthSummary(keysToCamel(homeHealthSummaryActionPayload))
      );
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
        store.dispatch(
          setHealthSummary(keysToCamel(homeHealthSummaryActionPayload))
        );
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
