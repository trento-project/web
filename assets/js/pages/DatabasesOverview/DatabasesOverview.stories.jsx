import React from 'react';
import { faker } from '@faker-js/faker';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  databaseFactory,
  databaseInstanceFactory,
  hostFactory,
} from '@lib/test-utils/factories';

import DatabasesOverview from './DatabasesOverview';

const userAbilities = [{ name: 'all', resource: 'all' }];
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
    database_id: databaseWithSR.id,
    system_replication: 'Primary',
  }),
  databaseInstanceFactory.build({
    database_id: databaseWithSR.id,
    system_replication: 'Secondary',
    system_replication_status: 'ACTIVE',
  }),
];

const databaseWithAbsentInstances = databaseFactory.build();
const absentInstance = [
  databaseInstanceFactory.build({
    database_id: databaseWithAbsentInstances.id,
  }),
  databaseInstanceFactory.build({
    database_id: databaseWithAbsentInstances.id,
    absent_at: faker.date.past().toISOString(),
  }),
];

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/DatabasesOverview',
  components: DatabasesOverview,
  argTypes: {
    databases: {
      control: { type: 'array' },
      description: 'Databases',
    },
    databaseInstances: {
      control: { type: 'array' },
      description: 'Database instances',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: false },
      },
    },
    userAbilities: {
      control: { type: 'array' },
      description: 'User profile abilities',
    },
    onTagAdd: {
      action: 'Add tag',
      description: 'Called when a new tag is added',
    },
    onTagRemove: {
      action: 'Remove tag',
      description: 'Called when an existing tag is removed',
    },
    onInstanceCleanUp: {
      action: 'Clean up instance',
      description: 'Deregister and clean up an absent instance',
    },
  },
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
    userAbilities,
    databases,
    databaseInstances: enrichedInstances,
    loading: false,
  },
};

export const WithSystemReplication = {
  args: {
    userAbilities,
    databases: [databaseWithSR],
    databaseInstances: systemReplicationInstances,
    loading: false,
  },
};

export const WithAbsentInstances = {
  args: {
    userAbilities,
    databases: [databaseWithAbsentInstances],
    databaseInstances: absentInstance,
    loading: false,
  },
};

export const UnauthorizedCleanUp = {
  args: {
    ...WithAbsentInstances.args,
    userAbilities: [],
  },
};
