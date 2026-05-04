import React from 'react';
import { MemoryRouter } from 'react-router';
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
  component: GenericSystemDetails,
  argTypes: {
    system: {
      control: { type: 'object' },
      description:
        'The object containing the details that are going to be represented in this view',
    },
    userAbilities: {
      control: { type: 'array' },
      description: 'Current user abilities',
    },
    cleanUpPermittedFor: {
      control: { type: 'array' },
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
    title: {
      type: 'string',
      description:
        'Main page title displayed at the top of the SAP/Database system details view',
      control: { type: 'text' },
    },
    type: {
      type: 'string',
      description:
        'System type indicator: APPLICATION_TYPE for SAP systems or DATABASE_TYPE for HANA databases',
      control: { type: 'text' },
    },
    operationsEnabled: {
      type: 'boolean',
      description:
        'Boolean flag that determines whether operation buttons are rendered for system start/stop actions',
      control: { type: 'boolean' },
    },
    runningOperations: {
      type: 'array',
      description: 'Array of currently executing operations on the system',
      control: { type: 'object' },
    },
    getSystemOperations: {
      description:
        'Callback function that returns available system-level operations',
      action: 'Get system operations function',
    },
    getSiteOperations: {
      description:
        'Callback function that returns site-level operations for system replication',
      action: 'Get site operations function',
    },
    onRequestOperation: {
      description: 'Callback invoked when a user requests an operation',
      action: 'Request operation',
    },
    onCleanForbiddenOperation: {
      description:
        'Callback invoked when a forbidden operation modal is dismissed',
      action: 'Clean forbidden operation',
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
