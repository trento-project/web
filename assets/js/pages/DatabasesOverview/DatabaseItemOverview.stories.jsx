// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  abilityFactory,
  databaseFactory,
  databaseInstanceFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import DatabaseItemOverview from './DatabaseItemOverview';

const hosts = hostFactory.buildList(2, { heartbeat: 'passing' });
const instances = databaseInstanceFactory
  .buildList(2)
  .map((instance, index) => ({
    ...instance,
    host: hosts[index] || hosts[0],
    system_replication_tier: index === 0 ? 1 : 2,
    system_replication_status: 'active',
  }));
const database = databaseFactory.build({ databaseInstances: instances });
const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

export default {
  title: 'Components/DatabaseItemOverview',
  component: DatabaseItemOverview,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    instance: {
      description: 'The instance prop',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    onCleanUpClick: {
      description: 'Callback function invoked when clean up click',
      action: 'onCleanUpClick',
    },
    instances: {
      description: 'The instances prop',
      control: { type: 'object' },
    },
    asDatabaseLayer: {
      description: 'The asDatabaseLayer prop',
      control: { type: 'object' },
    },
    database: {
      description: 'Array of items for the database',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    userAbilities: [allAbility],
    instances,
    asDatabaseLayer: false,
    database,
    onCleanUpClick: action('onCleanUpClick'),
  },
};
