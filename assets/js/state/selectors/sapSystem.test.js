import { clusterFactory } from '@lib/test-utils/factories/clusters';
import {
  databaseFactory,
  databaseInstanceFactory,
} from '@lib/test-utils/factories/databases';
import { hostFactory } from '@lib/test-utils/factories/hosts';
import {
  sapSystemFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories/sapSystems';

import {
  getEnrichedApplicationInstances,
  getEnrichedDatabaseInstances,
  getEnrichedSapSystemDetails,
  getEnrichedDatabaseDetails,
  getAllSAPInstances,
} from './sapSystem';

describe('sapSystem selector', () => {
  it('should enrich application instances', () => {
    const hosts = hostFactory.buildList(2);
    const applicationInstances = [
      sapSystemApplicationInstanceFactory.build({ host_id: hosts[0].id }),
      sapSystemApplicationInstanceFactory.build({ host_id: hosts[1].id }),
    ];
    const clusters = [
      clusterFactory.build({ id: hosts[0].cluster_id }),
      clusterFactory.build({ id: hosts[1].cluster_id }),
    ];

    const state = {
      sapSystemsList: {
        applicationInstances,
      },
      hostsList: {
        hosts,
      },
      clustersList: {
        clusters,
      },
    };

    const expectedOutput = [
      {
        ...applicationInstances[0],
        host: {
          ...hosts[0],
          cluster: clusters[0],
        },
      },
      {
        ...applicationInstances[1],
        host: {
          ...hosts[1],
          cluster: clusters[1],
        },
      },
    ];

    expect(getEnrichedApplicationInstances(state)).toEqual(expectedOutput);
  });

  it('should enrich database instances', () => {
    const hosts = hostFactory.buildList(2);
    const databaseInstances = [
      databaseInstanceFactory.build({ host_id: hosts[0].id }),
      databaseInstanceFactory.build({ host_id: hosts[1].id }),
    ];
    const clusters = [
      clusterFactory.build({ id: hosts[0].cluster_id }),
      clusterFactory.build({ id: hosts[1].cluster_id }),
    ];

    const state = {
      sapSystemsList: {
        databaseInstances,
      },
      hostsList: {
        hosts,
      },
      clustersList: {
        clusters,
      },
    };

    const expectedOutput = [
      {
        ...databaseInstances[0],
        host: {
          ...hosts[0],
          cluster: clusters[0],
        },
      },
      {
        ...databaseInstances[1],
        host: {
          ...hosts[1],
          cluster: clusters[1],
        },
      },
    ];

    expect(getEnrichedDatabaseInstances(state)).toEqual(expectedOutput);
  });

  it('should return an enriched SAP system', () => {
    const sapSystem = sapSystemFactory.build();

    const hosts = [
      hostFactory.build({ id: sapSystem.application_instances[0].host_id }),
      hostFactory.build({ id: sapSystem.application_instances[1].host_id }),
    ];
    const clusters = [
      clusterFactory.build({ id: hosts[0].cluster_id }),
      clusterFactory.build({ id: hosts[1].cluster_id }),
    ];

    const state = {
      sapSystemsList: {
        sapSystems: [sapSystem],
        applicationInstances: sapSystem.application_instances,
      },
      hostsList: {
        hosts,
      },
      clustersList: {
        clusters,
      },
    };

    const expectedOutput = {
      ...sapSystem,
      instances: [
        {
          ...sapSystem.application_instances[0],
          host: {
            ...hosts[0],
            cluster: clusters[0],
          },
        },
        {
          ...sapSystem.application_instances[1],
          host: {
            ...hosts[1],
            cluster: clusters[1],
          },
        },
      ],
      hosts: [
        {
          ...hosts[0],
          cluster: clusters[0],
        },
        {
          ...hosts[1],
          cluster: clusters[1],
        },
      ],
    };

    expect(getEnrichedSapSystemDetails(sapSystem.id, state)).toEqual(
      expectedOutput
    );
  });

  it('should return an enriched database', () => {
    const database = databaseFactory.build();

    const hosts = [
      hostFactory.build({ id: database.database_instances[0].host_id }),
      hostFactory.build({ id: database.database_instances[1].host_id }),
    ];

    const clusters = [
      clusterFactory.build({ id: hosts[0].cluster_id }),
      clusterFactory.build({ id: hosts[1].cluster_id }),
    ];

    const state = {
      databasesList: {
        databases: [database],
        databaseInstances: database.database_instances,
      },
      hostsList: {
        hosts,
      },
      clustersList: {
        clusters,
      },
    };

    const expectedOutput = {
      ...database,
      instances: [
        {
          ...database.database_instances[0],
          host: {
            ...hosts[0],
            cluster: clusters[0],
          },
        },
        {
          ...database.database_instances[1],
          host: {
            ...hosts[1],
            cluster: clusters[1],
          },
        },
      ],
      hosts: [
        {
          ...hosts[0],
          cluster: clusters[0],
        },
        {
          ...hosts[1],
          cluster: clusters[1],
        },
      ],
    };

    expect(getEnrichedDatabaseDetails(database.id, state)).toEqual(
      expectedOutput
    );
  });

  it('should correctly merge and format applicationInstances and databaseInstances', () => {
    const state = {
      sapSystemsList: {
        applicationInstances: [
          { id: 1, name: 'APP1' },
          { id: 2, name: 'APP2' },
        ],
        databaseInstances: [
          { id: 3, name: 'DB1' },
          { id: 4, name: 'DB2' },
        ],
      },
    };

    const expectedOutput = [
      { id: 1, name: 'APP1', type: 'sap_systems' },
      { id: 2, name: 'APP2', type: 'sap_systems' },
      { id: 3, name: 'DB1', type: 'databases' },
      { id: 4, name: 'DB2', type: 'databases' },
    ];

    expect(getAllSAPInstances(state)).toEqual(expectedOutput);
  });
});
