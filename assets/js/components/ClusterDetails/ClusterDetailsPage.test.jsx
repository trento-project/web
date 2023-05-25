import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { withState, renderWithRouterMatch } from '@lib/test-utils';

import { clusterFactory } from '@lib/test-utils/factories';

import { ClusterDetailsPage } from './ClusterDetailsPage';

describe('ClusterDetails ClusterDetailsPage component', () => {
  it.each([
    { type: 'hana_scale_up', label: 'HANA scale-up' },
    { type: 'ascs_ers', label: 'ASCS/ERS' },
    { type: 'unknwon', label: 'Unknown cluster type' },
  ])(
    'should display the $type details based on cluster type',
    ({ type, label }) => {
      const cluster = clusterFactory.build({ type });
      const initialState = {
        clustersList: { clusters: [cluster] },
        hostsList: { hosts: [] },
        lastExecutions: {
          [cluster.id]: { data: null, loading: false, error: null },
        },
      };

      const [statefulClusterDetailsPage, _] = withState(
        <ClusterDetailsPage />,
        initialState
      );

      renderWithRouterMatch(statefulClusterDetailsPage, {
        path: 'clusters/:clusterID',
        route: `/clusters/${cluster.id}`,
      });

      expect(screen.getByText(label)).toBeInTheDocument();
    }
  );
});
