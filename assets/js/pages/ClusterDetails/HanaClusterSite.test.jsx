import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  hanaClusterDetailsNodesFactory,
  hanaClusterSiteFactory,
} from '@lib/test-utils/factories';

import HanaClusterSite from './HanaClusterSite';

describe('HanaClusterSite', () => {
  const scenarios = [
    {
      srHealthState: '4',
      pillClass: 'fill-jungle-green-500',
    },
    {
      srHealthState: '1',
      pillClass: 'fill-red-500',
    },
    {
      srHealthState: '0',
      pillClass: 'fill-gray-500',
    },
  ];

  it.each(scenarios)(
    'should display the correct health state',
    ({ srHealthState, pillClass }) => {
      const { name, state } = hanaClusterSiteFactory.build();
      const { container } = render(
        <HanaClusterSite
          name={name}
          state={state}
          srHealthState={srHealthState}
        />
      );
      expect(screen.getByText(name)).toBeTruthy();
      expect(screen.getByText(state)).toBeTruthy();

      const svgEl = container.querySelector(
        "[data-testid='eos-svg-component']"
      );
      expect(svgEl).toHaveClass(pillClass);
    }
  );

  it('should show the nodes', () => {
    const {
      name,
      state,
      sr_healt_state: srHealthState,
    } = hanaClusterSiteFactory.build();
    const nodes = hanaClusterDetailsNodesFactory.buildList(3, {
      resources: [],
    });
    render(
      <HanaClusterSite
        name={name}
        nodes={nodes}
        state={state}
        srHealthState={srHealthState}
      />
    );

    expect(
      screen.getByRole('table').querySelectorAll('tbody > tr')
    ).toHaveLength(3);
  });

  it('should show nameserver and indexserver roles', () => {
    const {
      name,
      state,
      sr_healt_state: srHealthState,
    } = hanaClusterSiteFactory.build();
    const nodes = hanaClusterDetailsNodesFactory.buildList(1, {
      resources: [],
    });
    render(
      <HanaClusterSite
        name={name}
        nodes={nodes}
        state={state}
        srHealthState={srHealthState}
      />
    );

    expect(
      screen.getByRole('table').querySelectorAll('thead > tr > th').item(1)
    ).toHaveTextContent('Nameserver');

    expect(
      screen.getByRole('table').querySelectorAll('thead > tr > th').item(2)
    ).toHaveTextContent('Indexserver');

    expect(
      screen.getByRole('table').querySelectorAll('tbody > tr > td').item(1)
    ).toHaveTextContent('Slave');

    expect(
      screen.getByRole('table').querySelectorAll('tbody > tr > td').item(2)
    ).toHaveTextContent('Master');
  });
});
