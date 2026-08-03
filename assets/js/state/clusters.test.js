// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import clustersReducer, {
  removeCluster,
  updateClusterStaleAt,
} from '@state/clusters';
import { clusterFactory } from '@lib/test-utils/factories';

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
});
