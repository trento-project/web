import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  hostFactory,
  sapSystemFactory,
  // sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';

import SapSystemsOverview from './SapSystemsOverview';

const sapSystems = sapSystemFactory.buildList(3);

const enrichedApplicationInstances = sapSystems[0].application_instances
  .concat(sapSystems[1].application_instances)
  .concat(sapSystems[2].application_instances)
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

const enrichedDatabaseInstances = sapSystems[0].database_instances
  .concat(sapSystems[1].database_instances)
  .concat(sapSystems[2].database_instances)
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

const sapSystemsWithAbsentInstances = sapSystemFactory.buildList(2);

const enrichedAbsentApplicationInstances =
  sapSystemsWithAbsentInstances[0].application_instances
    .concat(sapSystemsWithAbsentInstances[1].application_instances)
    .map((instance) => {
      const cluster = clusterFactory.build();
      return {
        ...instance,
        host: {
          ...hostFactory.build({
            id: instance.host_id,
            cluster_id: cluster.id,
          }),
          cluster,
        },
      };
    });

enrichedAbsentApplicationInstances[1].absent_at = '2021-01-01T00:00:00.000Z';

const enrichedAbsentDatabaseInstances =
  sapSystemsWithAbsentInstances[0].database_instances
    .concat(sapSystemsWithAbsentInstances[1].database_instances)
    .map((instance) => {
      const cluster = clusterFactory.build();
      return {
        ...instance,
        host: {
          ...hostFactory.build({
            id: instance.host_id,
            cluster_id: cluster.id,
          }),
          cluster,
        },
      };
    });

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'SapSystemsOverview',
  components: SapSystemsOverview,
  argTypes: {
    sapSystems: {
      control: { type: 'array' },
      description: 'SAP systems',
    },
    applicationInstances: {
      control: { type: 'array' },
      description: 'Application instances',
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
    onTagAdded: {
      action: 'Add tag',
      description: 'Called when a new tag is added',
    },
    onTagRemoved: {
      action: 'Remove tag',
      description: 'Called when an existing tag is removed',
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
      <SapSystemsOverview {...args} />
    </ContainerWrapper>
  ),
};

export const SapSystems = {
  args: {
    sapSystems,
    applicationInstances: enrichedApplicationInstances,
    databaseInstances: enrichedDatabaseInstances,
    loading: false,
  },
};

export const WithAbsentInstances = {
  args: {
    sapSystems: sapSystemsWithAbsentInstances,
    applicationInstances: enrichedAbsentApplicationInstances,
    databaseInstances: enrichedAbsentDatabaseInstances,
    loading: false,
  },
};
