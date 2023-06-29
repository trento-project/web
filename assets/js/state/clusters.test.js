import clustersReducer, { removeCluster } from '@state/clusters';
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
});
