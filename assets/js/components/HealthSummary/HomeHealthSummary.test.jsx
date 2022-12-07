import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { renderWithRouter, withState } from '@lib/test-utils';
import { HomeHealthSummary } from './HomeHealthSummary';

import { healthSummaryFactory } from '../../lib/test-utils/factories';

const homeHealthSummaryActionPayload = [
  healthSummaryFactory.build({
    clustersHealth: 'passing',
    databaseHealth: 'passing',
    hostsHealth: 'critical',
    sapsystemHealth: 'passing',
    sid: 'NWD',
    tenant: 'HDD',
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
  healthSummaryFactory.build({
    clusterId: null,
    clustersHealth: 'unknown',
    databaseHealth: 'passing',
    hostsHealth: 'critical',
    sapsystemHealth: 'passing',
  }),
];

const initialState = {
  sapSystemsHealthSummary: {
    sapSystemsHealth: homeHealthSummaryActionPayload,
    loading: false,
  },
};

describe('HomeHealthSummary component', () => {
  it('should have a clickable SAP INSTANCE icon with link to the belonging instance', () => {
    const [StatefulHomeHealthSummary] = withState(
      <HomeHealthSummary />,
      initialState
    );
    const { container } = renderWithRouter(StatefulHomeHealthSummary);
    const [{ id }] = homeHealthSummaryActionPayload;

    expect(
      container
        .querySelector(':nth-child(1) > :nth-child(1) > a')
        .getAttribute('href')
    ).toContain(`/sap_systems/${id}`);
  });

  it('should have a clickable PACEMAKER CLUSTER icon with link to the belonging cluster when available', () => {
    const [StatefulHomeHealthSummary] = withState(
      <HomeHealthSummary />,
      initialState
    );
    const { container } = renderWithRouter(StatefulHomeHealthSummary);
    const [{ clusterId }] = homeHealthSummaryActionPayload;

    expect(
      container
        .querySelector(':nth-child(1) > :nth-child(4) > a')
        .getAttribute('href')
    ).toContain(`/clusters/${clusterId}`);

    expect(
      container.querySelector(':nth-child(4) > :nth-child(4) > a')
    ).toBeNull();

    expect(
      container
        .querySelector(':nth-child(4) > :nth-child(4) > svg')
        .classList.toString()
    ).toContain('hover:opacity-100');
  });
});

describe('HomeHealthSummary component', () => {
  it('should have a working link to the passing checks in the overview component', () => {
    const [StatefulHomeHealthSummary] = withState(
      <HomeHealthSummary />,
      initialState
    );
    const { container } = renderWithRouter(StatefulHomeHealthSummary);

    expect(
      container
        .querySelector(':nth-child(1) > :nth-child(5) > a')
        .getAttribute('href')
    ).toContain('/hosts?sid=NWD&sid=HDD');
  });

  describe('health box filter behaviour', () => {
    it('should put the filters values in the query string when health filters are selected', async () => {
      const [StatefulHomeHealthSummary] = withState(
        <HomeHealthSummary />,
        initialState
      );
      const { container } = renderWithRouter(StatefulHomeHealthSummary);

      expect(container.querySelector('tbody').childNodes.length).toEqual(4);

      const cases = [
        ['passing', 0],
        ['warning', 0],
        ['critical', 4],
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
