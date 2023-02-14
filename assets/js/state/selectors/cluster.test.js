import { getClusterHostIDs } from './cluster';

describe('Cluster selector', () => {
  it('should return the cluster hosts IDs', () => {
    const state = {
      hostsList: {
        hosts: [
          {
            id: 'id1',
            cluster_id: 'cluster1',
          },
          {
            id: 'id2',
            cluster_id: 'cluster1',
          },
          {
            id: 'id3',
            cluster_id: 'cluster2',
          },
        ],
      },
    };

    expect(getClusterHostIDs('cluster1')(state)).toEqual(['id1', 'id2']);
  });
});
