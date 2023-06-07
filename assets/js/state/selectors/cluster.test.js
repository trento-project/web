import {
  clusterFactory,
  hostFactory,
  databaseInstanceFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import {
  getClusterHostIDs,
  getClusterHosts,
  getClusterName,
  getClusterSapSystems,
} from './cluster';

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

  it('should return SAP systems associated to the cluster', () => {
    const clusters = clusterFactory.buildList(2);
    const { id: clusterID } = clusters[0];

    const hosts = hostFactory
      .buildList(5, { cluster_id: clusterID })
      .concat(hostFactory.buildList(5));

    const [
      { id: host1 },
      { id: host2 },
      { id: host3 },
      { id: host4 },
      { id: host5 },
    ] = hosts.slice(0, 5);

    const sapSystems = [
      sapSystemFactory.build(),
      sapSystemFactory.build({
        application_instances: [
          sapSystemApplicationInstanceFactory.build({ host_id: host1 }),
        ],
        database_instances: [databaseInstanceFactory.build({ host_id: host2 })],
      }),
      sapSystemFactory.build({
        application_instances: [
          sapSystemApplicationInstanceFactory.build({ host_id: host3 }),
        ],
        database_instances: [databaseInstanceFactory.build({ host_id: host4 })],
      }),
      sapSystemFactory.build({
        application_instances: [
          sapSystemApplicationInstanceFactory.build({ host_id: host5 }),
        ],
        database_instances: [],
      }),
      sapSystemFactory.build(),
    ];

    const state = {
      clustersList: {
        clusters,
      },
      hostsList: {
        hosts,
      },
      sapSystemsList: {
        sapSystems,
      },
    };
    expect(getClusterSapSystems(clusterID)(state)).toEqual(
      sapSystems.slice(1, 4)
    );
  });
});
