import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import { healthSummaryFactory } from '@lib/test-utils/factories';

import HomeHealthSummary from './HomeHealthSummary';

const homeHealthSummaryData = [
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

describe('HomeHealthSummary component', () => {
  it('should have a clickable SAP INSTANCE icon with link to the belonging instance', () => {
    const { container } = renderWithRouter(
      <HomeHealthSummary
        sapSystemsHealth={homeHealthSummaryData}
        loading={false}
      />
    );
    const [{ id }] = homeHealthSummaryData;

    expect(
      container
        .querySelector(':nth-child(1) > :nth-child(1) > a')
        .getAttribute('href')
    ).toContain(`/sap_systems/${id}`);
  });

  it('should have a clickable PACEMAKER CLUSTER icon with link to the belonging cluster when available', () => {
    const { container } = renderWithRouter(
      <HomeHealthSummary
        sapSystemsHealth={homeHealthSummaryData}
        loading={false}
      />
    );
    const [{ clusterId }] = homeHealthSummaryData;

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
    const { container } = renderWithRouter(
      <HomeHealthSummary
        sapSystemsHealth={homeHealthSummaryData}
        loading={false}
      />
    );

    expect(
      container
        .querySelector(':nth-child(1) > :nth-child(5) > a')
        .getAttribute('href')
    ).toContain('/hosts?sid=NWD&sid=HDD');
  });

  describe('health box filter behaviour', () => {
    it('should put the filters values in the query string when health filters are selected', async () => {
      const { container } = renderWithRouter(
        <HomeHealthSummary
          sapSystemsHealth={homeHealthSummaryData}
          loading={false}
        />
      );

      expect(container.querySelector('tbody').childNodes.length).toEqual(4);

      const cases = [
        ['passing', 1],
        ['warning', 1],
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
