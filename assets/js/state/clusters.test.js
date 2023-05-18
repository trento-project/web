import clustersReducer, { removeCluster } from '@state/clusters';

describe('Clusters reducer', () => {
  it('should remove cluster from state', () => {
    const cluster = { id: 'test-cluster-id' };
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
