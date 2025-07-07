import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import {
  clusterFactory,
  databaseInstanceFactory,
  databaseFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import { DATABASE_TYPE } from '@lib/model/sapSystems';

import { GenericSystemDetails } from '@pages/SapSystemDetails';

const database = databaseFactory.build({
  instances: [
    databaseInstanceFactory.build({
      system_replication: 'Primary',
      system_replication_status: '',
    }),
    databaseInstanceFactory.build({
      system_replication: 'Secondary',
      system_replication_status: 'ACTIVE',
    }),
  ],
  hosts: hostFactory.buildList(2, { cluster: clusterFactory.build() }),
});

const databaseWithAbsentInstance = {
  ...database,
};

databaseWithAbsentInstance.instances[1].absent_at = faker.date
  .past()
  .toISOString();

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/DatabaseDetails',
  components: GenericSystemDetails,
  argTypes: {
    system: {
      control: 'object',
      description: 'The represented HANA database',
    },
    userAbilities: {
      control: 'array',
      description: 'Current user abilities',
    },
    cleanUpPermittedFor: {
      control: 'array',
      description: 'Abilities that allow instance clean up',
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

export const Database = {
  args: {
    title: 'Database Details',
    type: DATABASE_TYPE,
    system: database,
    userAbilities: [{ name: 'all', resource: 'all' }],
    cleanUpPermittedFor: ['cleanup:database_instance'],
  },
};

export const DatabaseWithAbsentInstance = {
  args: {
    ...Database.args,
    system: databaseWithAbsentInstance,
  },
};

export const CleanUpUnauthorized = {
  args: {
    ...Database.args,
    userAbilities: [],
  },
};
