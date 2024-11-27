import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { withState, renderWithRouterMatch } from '@lib/test-utils';

import { clusterFactory } from '@lib/test-utils/factories';

import { ClusterDetailsPage } from './ClusterDetailsPage';

describe('ClusterDetails ClusterDetailsPage component', () => {
  it.each([
    {
      type: 'hana_scale_up',
      label: 'HANA Scale Up Perf. Opt.',
      scenario: 'performance_optimized',
    },
    {
      type: 'hana_scale_up',
      label: 'HANA Scale Up Cost Opt.',
      scenario: 'cost_optimized',
    },
    {
      type: 'ascs_ers',
      label: 'ASCS/ERS',
      scenario: 'unknwon',
    },
    {
      type: 'unknwon',
      label: 'Unknown cluster type',
      scenario: 'unknwon',
    },
  ])(
    'should display the $type details based on cluster type',
    ({ type, label, scenario }) => {
      const cluster = clusterFactory.build({
        type,
        details: { hana_scenario: scenario },
      });
      const initialState = {
        clustersList: { clusters: [cluster] },
        hostsList: { hosts: [] },
        sapSystemsList: { sapSystems: [], applicationInstances: [] },
        databasesList: { databases: [], databaseInstances: [] },
        lastExecutions: {
          [cluster.id]: { data: null, loading: false, error: null },
        },
        catalog: { data: null, loading: false, error: null },
        user: {
          abilities: [{ name: 'all', resource: 'all' }],
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
