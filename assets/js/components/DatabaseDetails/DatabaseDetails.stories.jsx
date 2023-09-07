import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import {
  clusterFactory,
  databaseInstanceFactory,
  databaseFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model';

import { GenericSystemDetails } from '@components/SapSystemDetails';

const database = {
  ...databaseFactory.build({ instances: databaseInstanceFactory.buildList(2) }),
  hosts: hostFactory.buildList(2, { cluster: clusterFactory.build() }),
};

const databaseWithAbsentInstance = {
  ...databaseFactory.build({ instances: databaseInstanceFactory.buildList(2) }),
  hosts: hostFactory.buildList(2, { cluster: clusterFactory.build() }),
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
  title: 'DatabaseDetails',
  components: GenericSystemDetails,
  argTypes: {
    title: {
      type: 'string',
      description: 'Database Details',
    },
    type: {
      control: { type: 'radio' },
      options: [APPLICATION_TYPE, DATABASE_TYPE],
      description: 'The content type of the deregistration modal',
    },
    system: {
      control: 'object',
      description:
        'The object containing the details that are going to be represented in this view',
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
  },
};

export const DatabaseWithAbsentInstance = {
  args: {
    ...Database,
    system: databaseWithAbsentInstance,
  },
};
