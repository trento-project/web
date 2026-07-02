// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  abilityFactory,
  databaseInstanceFactory,
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import SapSystemItemOverview from './SapSystemItemOverview';

const hosts = hostFactory.buildList(2, { heartbeat: 'passing' });
const applicationInstances = sapSystemApplicationInstanceFactory
  .buildList(2)
  .map((instance, index) => ({
    ...instance,
    host: hosts[index] || hosts[0],
  }));
const databaseInstances = databaseInstanceFactory
  .buildList(2)
  .map((instance, index) => ({
    ...instance,
    host: hosts[index] || hosts[0],
  }));
const sapSystem = sapSystemFactory.build({
  applicationInstances,
  databaseInstances,
});
const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

export default {
  title: 'Components/SapSystemItemOverview',
  component: SapSystemItemOverview,
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
    sapSystem: {
      description: 'The sapSystem prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    userAbilities: [allAbility],
    sapSystem,
    onCleanUpClick: action('onCleanUpClick'),
  },
};
