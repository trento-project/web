import { faker } from '@faker-js/faker';
import {
  ascsErsSapSystemFactory,
  clusterFactory,
  hostFactory,
  databaseInstanceFactory,
  databaseFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import {
  FS_TYPE_RESOURCE_MANAGED,
  FS_TYPE_SIMPLE_MOUNT,
  FS_TYPE_MIXED,
} from '@lib/model/clusters';

import {
  getClusterHostIDs,
  getClusterHosts,
  getClusterName,
  getClusterSapSystems,
  getClusterSelectedChecks,
  getClusterIDs,
  getFilesystemType,
  getEnsaVersion,
  MIXED_VERSIONS,
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

    expect(getClusterHosts(state, 'cluster1')).toEqual(
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
        database_id: database2,
        host_id: host2,
      }),
      databaseInstanceFactory.build({
        database_id: database3,
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
    const clusterID = faker.string.uuid();
    const checks = [faker.string.uuid(), faker.string.uuid()];
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
    expect(getClusterSelectedChecks(state, faker.string.uuid())).toEqual([]);
  });

  it('should return all the cluster IDs', () => {
    const clusterID1 = faker.string.uuid();
    const clusterID2 = faker.string.uuid();
    const cluster1 = clusterFactory.build({
      id: clusterID1,
    });
    const cluster2 = clusterFactory.build({ id: clusterID2 });

    const state = {
      clustersList: {
        clusters: [cluster1, cluster2],
      },
    };

    expect(getClusterIDs(state)).toEqual([clusterID1, clusterID2]);
  });

  it('should return ENSA version', () => {
    const clusterID = faker.string.uuid();
    const cluster = clusterFactory.build({ id: clusterID });

    const sapSystems = sapSystemFactory.buildList(2, { ensa_version: 'ensa1' });
    const [{ id: sapSystem1 }, { id: sapSystem2 }] = sapSystems;

    const hosts = hostFactory
      .buildList(4, { cluster_id: clusterID })
      .concat(hostFactory.buildList(2));
    const [{ id: host1 }, { id: host2 }, { id: host3 }, { id: host4 }] = hosts;

    const applicationInstances = [
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem1,
        host_id: host1,
      }),
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem2,
        host_id: host2,
      }),
    ];

    const databases = databaseFactory.buildList(4);

    const databaseInstances = [
      databaseInstanceFactory.build({
        database_id: sapSystem1,
        host_id: host3,
      }),
      databaseInstanceFactory.build({
        database_id: sapSystem2,
        host_id: host4,
      }),
    ];

    const state = {
      hostsList: {
        hosts,
      },
      databasesList: {
        databases,
        databaseInstances,
      },
      sapSystemsList: {
        sapSystems,
        applicationInstances,
        databaseInstances,
      },
      clustersList: {
        clusters: [cluster],
      },
    };

    expect(getEnsaVersion(state, clusterID)).toEqual('ensa1');
  });

  it('should return mixed ENSA versions', () => {
    const clusterID = faker.string.uuid();
    const cluster = clusterFactory.build({ id: clusterID });

    const sapSystems = [
      sapSystemFactory.build({ ensa_version: 'ensa1' }),
      sapSystemFactory.build({ ensa_version: 'ensa2' }),
    ];
    const [{ id: sapSystem1 }, { id: sapSystem2 }] = sapSystems;

    const hosts = hostFactory
      .buildList(4, { cluster_id: clusterID })
      .concat(hostFactory.buildList(2));
    const [{ id: host1 }, { id: host2 }, { id: host3 }, { id: host4 }] = hosts;

    const applicationInstances = [
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem1,
        host_id: host1,
      }),
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem2,
        host_id: host2,
      }),
    ];

    const databases = databaseFactory.buildList(4);

    const databaseInstances = [
      databaseInstanceFactory.build({
        database_id: sapSystem1,
        host_id: host3,
      }),
      databaseInstanceFactory.build({
        database_id: sapSystem2,
        host_id: host4,
      }),
    ];

    const state = {
      hostsList: {
        hosts,
      },
      databasesList: {
        databases,
        databaseInstances,
      },
      sapSystemsList: {
        sapSystems,
        applicationInstances,
        databaseInstances,
      },
      clustersList: {
        clusters: [cluster],
      },
    };

    expect(getEnsaVersion(state, clusterID)).toEqual(MIXED_VERSIONS);
  });

  it('should return mixed ENSA versions if SAP system does not have ENSA version info', () => {
    const clusterID = faker.string.uuid();
    const cluster = clusterFactory.build({ id: clusterID });

    const sapSystems = [
      sapSystemFactory.build({ ensa_version: 'ensa1' }),
      sapSystemFactory.params({ ensa_version: false }).build(),
    ];
    const [{ id: sapSystem1 }, { id: sapSystem2 }] = sapSystems;

    const hosts = hostFactory
      .buildList(4, { cluster_id: clusterID })
      .concat(hostFactory.buildList(2));
    const [{ id: host1 }, { id: host2 }, { id: host3 }, { id: host4 }] = hosts;

    const applicationInstances = [
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem1,
        host_id: host1,
      }),
      sapSystemApplicationInstanceFactory.build({
        sap_system_id: sapSystem2,
        host_id: host2,
      }),
    ];

    const databases = databaseFactory.buildList(4);
    const [{ id: database1 }, { id: database2 }] = databases;

    const databaseInstances = [
      databaseInstanceFactory.build({
        database_id: database1,
        host_id: host3,
      }),
      databaseInstanceFactory.build({
        database_id: database2,
        host_id: host4,
      }),
    ];

    const state = {
      hostsList: {
        hosts,
      },
      databasesList: {
        databases,
        databaseInstances,
      },
      sapSystemsList: {
        sapSystems,
        applicationInstances,
        databaseInstances,
      },
      clustersList: {
        clusters: [cluster],
      },
    };

    expect(getEnsaVersion(state, clusterID)).toEqual(MIXED_VERSIONS);
  });

  it('should return resource_managed filesystem type if every SAP system has resource based filesystem', () => {
    const clusterID = faker.string.uuid();
    const cluster = clusterFactory.build({
      id: clusterID,
      type: 'ascs_ers',
      details: {
        sap_systems: ascsErsSapSystemFactory.buildList(3, {
          filesystem_resource_based: true,
        }),
      },
    });

    const state = {
      clustersList: {
        clusters: [cluster],
      },
    };

    expect(getFilesystemType(state, clusterID)).toEqual(
      FS_TYPE_RESOURCE_MANAGED
    );
  });

  it('should return simple_mount filesystem type if no SAP system has resource based filesystem', () => {
    const clusterID = faker.string.uuid();
    const cluster = clusterFactory.build({
      id: clusterID,
      type: 'ascs_ers',
      details: {
        sap_systems: ascsErsSapSystemFactory.buildList(3, {
          filesystem_resource_based: false,
        }),
      },
    });

    const state = {
      clustersList: {
        clusters: [cluster],
      },
    };

    expect(getFilesystemType(state, clusterID)).toEqual(FS_TYPE_SIMPLE_MOUNT);
  });

  it('should return mixed_fs_types filesystem type if only some SAP system have resource based filesystem', () => {
    const clusterID = faker.string.uuid();
    const cluster = clusterFactory.build({
      id: clusterID,
      type: 'ascs_ers',
      details: {
        sap_systems: [
          ...ascsErsSapSystemFactory.buildList(3, {
            filesystem_resource_based: true,
          }),
          ...ascsErsSapSystemFactory.buildList(2, {
            filesystem_resource_based: false,
          }),
        ],
      },
    });

    const state = {
      clustersList: {
        clusters: [cluster],
      },
    };

    expect(getFilesystemType(state, clusterID)).toEqual(FS_TYPE_MIXED);
  });
});
