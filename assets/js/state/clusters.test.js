// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import clustersReducer, {
  removeCluster,
  updateClusterStaleAt,
  updateClusterHealthDetails,
} from '@state/clusters';
import {
  clusterFactory,
  hanaClusterHealthDetailsFactory,
  ascsErsClusterHealthDetailsFactory,
} from '@lib/test-utils/factories';

describe('Clusters reducer', () => {
  it('should remove cluster from state', () => {
    const [cluster1, cluster2] = clusterFactory.buildList(2);
    const initialState = {
      clusters: [cluster1, cluster2],
    };

    const action = removeCluster(cluster1);

    const expectedState = {
      clusters: [cluster2],
    };

    expect(clustersReducer(initialState, action)).toEqual(expectedState);
  });

  it('should update the stale_at field of a cluster', () => {
    const [cluster1, cluster2] = clusterFactory.buildList(2);
    const staleAt = Date.now();

    const initialState = {
      clusters: [cluster1, cluster2],
    };

    const clusterToUpdate = {
      id: cluster1.id,
      stale_at: staleAt,
    };

    const action = updateClusterStaleAt(clusterToUpdate);

    const expectedState = {
      clusters: [
        {
          ...cluster1,
          stale_at: staleAt,
        },
        cluster2,
      ],
    };

    expect(clustersReducer(initialState, action)).toEqual(expectedState);
  });

  it.each([
    {
      clusterType: 'hana_scale_up',
      healthDetailsFactory: hanaClusterHealthDetailsFactory,
    },
    {
      clusterType: 'ascs_ers',
      healthDetailsFactory: ascsErsClusterHealthDetailsFactory,
    },
  ])(
    'should update the health_details field of a $clusterType cluster',
    ({ clusterType, healthDetailsFactory }) => {
      const [cluster1, cluster2] = [
        clusterFactory.build({ type: clusterType }),
        clusterFactory.build(),
      ];
      const healthDetails = healthDetailsFactory.build();

      const initialState = {
        clusters: [cluster1, cluster2],
      };

      const action = updateClusterHealthDetails({
        cluster_id: cluster1.id,
        health_details: healthDetails,
      });

      const expectedState = {
        clusters: [
          {
            ...cluster1,
            health_details: healthDetails,
          },
          cluster2,
        ],
      };

      expect(clustersReducer(initialState, action)).toEqual(expectedState);
    }
  );
});
