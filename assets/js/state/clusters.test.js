// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import clustersReducer, {
  removeCluster,
  updateCluster,
  updateClusterStaleAt,
  updateClusterHealthDetails,
} from '@state/clusters';
import { getDefaultHealthDetails } from '@lib/model/clusters';
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

  it.each(['hana_scale_up', 'ascs_ers'])(
    'should set default health details when updating an unknown cluster to %s',
    (newType) => {
      const unknownCluster = clusterFactory.build({
        type: 'unknown',
        health_details: null,
      });

      const initialState = {
        clusters: [unknownCluster],
      };

      const action = updateCluster({
        id: unknownCluster.id,
        type: newType,
      });

      const expectedState = {
        clusters: [
          {
            ...unknownCluster,
            type: newType,
            health_details: getDefaultHealthDetails(newType),
          },
        ],
      };

      expect(clustersReducer(initialState, action)).toEqual(expectedState);
    }
  );

  it('should preserve existing health details when updating cluster details', () => {
    const cluster = clusterFactory.build({
      type: 'hana_scale_up',
      health_details: hanaClusterHealthDetailsFactory.build(),
    });

    const initialState = {
      clusters: [cluster],
    };

    const action = updateCluster({
      id: cluster.id,
      name: 'new-cluster-name',
    });

    const expectedState = {
      clusters: [
        {
          ...cluster,
          name: 'new-cluster-name',
        },
      ],
    };

    expect(clustersReducer(initialState, action)).toEqual(expectedState);
  });
});
