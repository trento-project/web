import clustersReducer, { removeCluster } from '@state/clusters';
import { clusterFactory } from '@lib/test-utils/factories';

describe('Clusters reducer', () => {
  it('should remove cluster from state', () => {
    const cluster = clusterFactory.build();
    const initialState = {
      clusters: [cluster],
    };

    const action = removeCluster(cluster);

    const expectedState = {
      clusters: [],
    };

    expect(clustersReducer(initialState, action)).toEqual(expectedState);
  });
});
