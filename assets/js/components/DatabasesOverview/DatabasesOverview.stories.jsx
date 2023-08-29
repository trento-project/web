import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  databaseFactory,
  databaseInstanceFactory,
  hostFactory,
} from '@lib/test-utils/factories';

import DatabasesOverview from './DatabasesOverview';

const databases = databaseFactory.buildList(3);

const enrichedInstances = databases[0].database_instances
  .concat(databases[1].database_instances)
  .concat(databases[2].database_instances)
  .map((instance) => {
    const cluster = clusterFactory.build();
    return {
      ...instance,
      host: {
        ...hostFactory.build({ id: instance.host_id, cluster_id: cluster.id }),
        cluster,
      },
    };
  });

const databaseWithSR = databaseFactory.build();

const systemReplicationInstances = [
  databaseInstanceFactory.build({
    sap_system_id: databaseWithSR.id,
    system_replication: 'Primary',
  }),
  databaseInstanceFactory.build({
    sap_system_id: databaseWithSR.id,
    system_replication: 'Secondary',
    system_replication_status: 'ACTIVE',
  }),
];

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'DatabasesOverview',
  components: DatabasesOverview,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => (
    <ContainerWrapper>
      <DatabasesOverview {...args} />
    </ContainerWrapper>
  ),
};

export const Databases = {
  args: {
    databases,
    databaseInstances: enrichedInstances,
    loading: false,
  },
};

export const WithSystemReplication = {
  args: {
    databases: [databaseWithSR],
    databaseInstances: systemReplicationInstances,
    loading: false,
  },
};
