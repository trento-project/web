import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { faker } from '@faker-js/faker';

import {
  clusterFactory,
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import { APPLICATION_TYPE } from '@lib/model/sapSystems';

import { GenericSystemDetails } from './GenericSystemDetails';

import { getSapInstanceOperations } from './sapOperations';

const system = {
  ...sapSystemFactory.build({
    instances: sapSystemApplicationInstanceFactory.buildList(2),
  }),
  hosts: hostFactory.buildList(2, { cluster: clusterFactory.build() }),
};

const systemWithAbsentInstance = {
  ...sapSystemFactory.build({
    instances: sapSystemApplicationInstanceFactory.buildList(2),
  }),
  hosts: hostFactory.buildList(2, { cluster: clusterFactory.build() }),
};
systemWithAbsentInstance.instances[1].absent_at = faker.date
  .past()
  .toISOString();

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/SapSystemDetails',
  components: GenericSystemDetails,
  argTypes: {
    system: {
      control: 'object',
      description:
        'The object containing the details that are going to be represented in this view',
    },
    userAbilities: {
      control: 'array',
      description: 'Current user abilities',
    },
    cleanUpPermittedFor: {
      control: 'array',
      description: 'Abilities that allow instance clean up',
    },
    getInstanceOperations: {
      action: 'Get instance operations function',
      description: 'Function to get instance operations',
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
      <GenericSystemDetails {...args} />
    </ContainerWrapper>
  ),
};

export const SapSystem = {
  args: {
    title: 'SAP System Details',
    type: APPLICATION_TYPE,
    system,
    userAbilities: [{ name: 'all', resource: 'all' }],
    cleanUpPermittedFor: ['cleanup:application_instance'],
    getInstanceOperations: getSapInstanceOperations,
    operationsEnabled: true,
  },
};

export const SapSystemWithAbsentInstance = {
  args: {
    ...SapSystem.args,
    system: systemWithAbsentInstance,
  },
};

export const CleanUpUnauthorized = {
  args: {
    ...SapSystemWithAbsentInstance.args,
    userAbilities: [],
  },
};
