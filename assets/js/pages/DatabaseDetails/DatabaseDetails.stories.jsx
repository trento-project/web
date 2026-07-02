// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { faker } from '@faker-js/faker';
import { DATABASE_TYPE } from '@lib/model/sapSystems';
import {
  clusterFactory,
  databaseFactory,
  databaseInstanceFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import { GenericSystemDetails } from '@pages/SapSystemDetails';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

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
  title: 'Layouts/DatabaseDetails',
  component: GenericSystemDetails,
  argTypes: {
    system: {
      control: { type: 'object' },
      description: 'The represented HANA database',
    },
    userAbilities: {
      control: { type: 'object' },
      description: 'Current user abilities',
    },
    cleanUpPermittedFor: {
      control: { type: 'object' },
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

export const Default = {
  args: {
    title: 'Database Details',
    type: DATABASE_TYPE,
    system: database,
    userAbilities: [{ name: 'all', resource: 'all' }],
    cleanUpPermittedFor: ['cleanup:database_instance'],
    onInstanceCleanUp: action('onInstanceCleanUp'),
  },
};

export const Database = {
  args: {
    title: 'Database Details',
    type: DATABASE_TYPE,
    system: database,
    userAbilities: [{ name: 'all', resource: 'all' }],
    cleanUpPermittedFor: ['cleanup:database_instance'],
    onInstanceCleanUp: action('onInstanceCleanUp'),
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
    ...DatabaseWithAbsentInstance.args,
    userAbilities: [],
  },
};
