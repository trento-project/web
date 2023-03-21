import { hostFactory } from '@lib/test-utils/factories';
import { getClusterHostIDs, getClusterHosts, getClusterName } from './cluster';

describe('Cluster selector', () => {
  it('should return the cluster hosts IDs', () => {
    const state = {
      hostsList: {
        hosts: [
          hostFactory.build({
            id: 'id1',
            cluster_id: 'cluster1',
          }),
          hostFactory.build({
            id: 'id2',
            cluster_id: 'cluster1',
          }),
          hostFactory.build({
            id: 'id3',
            cluster_id: 'cluster2',
          }),
        ],
      },
    };

    expect(getClusterHostIDs('cluster1')(state)).toEqual(['id1', 'id2']);
  });

  it('should return the cluster hosts', () => {
    const state = {
      hostsList: {
        hosts: [
          hostFactory.build({
            id: 'id1',
            cluster_id: 'cluster1',
            hostname: 'hostname-1',
          }),
          hostFactory.build({
            id: 'id2',
            cluster_id: 'cluster1',
            hostname: 'hostname-2',
          }),
          hostFactory.build({
            cluster_id: 'cluster2',
          }),
        ],
      },
    };

    expect(getClusterHosts('cluster1')(state)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'id1',
          hostname: 'hostname-1',
        }),
        expect.objectContaining({
          id: 'id2',
          hostname: 'hostname-2',
        }),
      ])
    );
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
