import {
  getClusterHostIDs,
  getClusterSelectedChecks,
  getClusterName,
} from './cluster';

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

  it('should return the cluster selected checks', () => {
    const state = {
      clustersList: {
        clusters: [
          {
            id: 'cluster1',
            selected_checks: ['check1', 'check2'],
          },
          {
            id: 'cluster2',
            selected_checks: ['check3', 'check4'],
          },
          {
            id: 'cluster3',
            selected_checks: ['check5', 'check6'],
          },
        ],
      },
    };

    expect(getClusterSelectedChecks('cluster1')(state)).toEqual([
      'check1',
      'check2',
    ]);
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
