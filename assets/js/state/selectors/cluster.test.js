import { faker } from '@faker-js/faker';
import {
  clusterFactory,
  hostFactory,
  databaseInstanceFactory,
  databaseFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import {
  getClusterHostIDs,
  getClusterHosts,
  getClusterName,
  getClusterSapSystems,
  getClusterSelectedChecks,
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

    expect(getClusterHostIDs(state, 'cluster1')).toEqual(['id1', 'id2']);
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

    const sapSystems = sapSystemFactory.buildList(5);
    const [
      _sapSystem1,
      { id: sapSystem2 },
      { id: sapSystem3 },
      { id: sapSystem4 },
      _sapSystem5,
    ] = sapSystems;

    const applicationInstances = [
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem2,
        host_id: host1,
      }),
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem3,
        host_id: host3,
      }),
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem4,
        host_id: host5,
      }),
    ];

    const databases = databaseFactory.buildList(4);
    const [_database1, { id: database2 }, { id: database3 }, _database4] =
      databases;

    const databaseInstances = [
      databaseInstanceFactory.build({
        sap_system_id: database2,
        host_id: host2,
      }),
      databaseInstanceFactory.build({
        sap_system_id: database3,
        host_id: host4,
      }),
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
        applicationInstances,
        databaseInstances,
      },
      databasesList: {
        databases,
        databaseInstances,
      },
    };
    expect(getClusterSapSystems(state, clusterID)).toEqual(
      sapSystems.slice(1, 4).concat(databases.slice(1, 3))
    );
  });

  it('should return selected checks for a cluster', () => {
    const clusterID = faker.datatype.uuid();
    const checks = [faker.datatype.uuid(), faker.datatype.uuid()];
    const cluster = clusterFactory.build({
      id: clusterID,
      selected_checks: checks,
    });

    const state = {
      clustersList: {
        clusters: [cluster],
      },
    };

    expect(getClusterSelectedChecks(state, clusterID)).toEqual(checks);
    expect(getClusterSelectedChecks(state, faker.datatype.uuid())).toEqual([]);
  });
});
