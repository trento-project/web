import { faker } from '@faker-js/faker';
import {
  clusterFactory,
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import SapSystemsOverview from './SapSystemsOverview';

const userAbilities = [{ name: 'all', resource: 'all' }];
const enrichInstances = (systems, instanceType) =>
  systems
    .map((system) => system[instanceType])
    .flat()
    .map((instance) => {
      const cluster = clusterFactory.build();
      return {
        ...instance,
        features: 'ABAP',
        host: {
          ...hostFactory.build({
            id: instance.host_id,
            cluster_id: cluster.id,
          }),
          cluster,
        },
      };
    });

const sapSystems = sapSystemFactory.buildList(3);
const enrichedApplicationInstances = enrichInstances(
  sapSystems,
  'application_instances'
);
const enrichedDatabaseInstances = enrichInstances(
  sapSystems,
  'database_instances'
);

const sapSystemsWithAbsentInstances = sapSystemFactory.buildList(2);
const enrichedAbsentApplicationInstances = enrichInstances(
  sapSystemsWithAbsentInstances,
  'application_instances'
);
const enrichedAbsentDatabaseInstances = enrichInstances(
  sapSystemsWithAbsentInstances,
  'database_instances'
);

const sapSystemTypes = [
  'ABAP',
  'J2EE',
  'ABAP|J2EE',
  'J2EE|ABAP',
  'SOME_SAP_SYSTEM_FEATURE|NOT_A_REAL_SYSTEM',
];

const sapSystemsWithCustomTypes = sapSystemTypes.map((type) => {
  const sapSystemID = faker.string.uuid();
  return sapSystemFactory.build({
    id: sapSystemID,
    application_instances: sapSystemApplicationInstanceFactory.buildList(2, {
      sap_system_id: sapSystemID,
      features: type,
    }),
  });
});
const sapSystemApplicationInstances = sapSystemsWithCustomTypes
  .map((sapSystem) => sapSystem.application_instances)
  .flat();

enrichedAbsentApplicationInstances[1].absent_at = faker.date
  .past()
  .toISOString();

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/SapSystemsOverview',
  component: SapSystemsOverview,
  argTypes: {
    sapSystems: {
      control: { type: 'object' },
      description: 'SAP systems',
    },
    applicationInstances: {
      control: { type: 'object' },
      description: 'Application instances',
    },
    databaseInstances: {
      control: { type: 'object' },
      description: 'Database instances',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading',
    },
    userAbilities: {
      control: { type: 'object' },
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
      <SapSystemsOverview {...args} />
    </ContainerWrapper>
  ),
};

export const Default = {
  args: {
    userAbilities,
    sapSystems,
    applicationInstances: enrichedApplicationInstances,
    databaseInstances: enrichedDatabaseInstances,
    loading: false,
    onTagAdd: action('onTagAdd'),
    onTagRemove: action('onTagRemove'),
    onInstanceCleanUp: action('onInstanceCleanUp'),
  },
};

export const SapSystems = {
  args: {
    userAbilities,
    sapSystems,
    applicationInstances: enrichedApplicationInstances,
    databaseInstances: enrichedDatabaseInstances,
    loading: false,
    onTagAdd: action('onTagAdd'),
    onTagRemove: action('onTagRemove'),
    onInstanceCleanUp: action('onInstanceCleanUp'),
  },
};

export const WithAbsentInstances = {
  args: {
    userAbilities,
    sapSystems: sapSystemsWithAbsentInstances,
    applicationInstances: enrichedAbsentApplicationInstances,
    databaseInstances: enrichedAbsentDatabaseInstances,
    loading: false,
  },
};

export const UnauthorizedCleanUp = {
  args: {
    ...WithAbsentInstances.args,
    userAbilities: [],
  },
};

export const SapSystemsWithDifferentTypes = {
  args: {
    userAbilities,
    sapSystems: sapSystemsWithCustomTypes,
    applicationInstances: sapSystemApplicationInstances,
    databaseInstances: {},
  },
};
