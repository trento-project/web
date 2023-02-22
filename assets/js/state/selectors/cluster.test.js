import { getClusterHostIDs, getClusterName } from './cluster';

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

  it('should return a cluster name', () => {
    const state = {
      clustersList: {
        clusters: [
          {
            id: 'cluster1',
            name: 'cluster-name',
          },
          {
            id: 'cluster2',
          },
        ],
      },
    };

    expect(getClusterName('cluster1')(state)).toEqual('cluster-name');
    expect(getClusterName('cluster2')(state)).toEqual('');
  });
});
