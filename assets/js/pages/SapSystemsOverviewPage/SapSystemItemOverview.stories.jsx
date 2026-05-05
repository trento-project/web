import React from 'react';
import { MemoryRouter } from 'react-router';
import {
  sapSystemFactory,
  sapSystemApplicationInstanceFactory,
  databaseInstanceFactory,
  abilityFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import SapSystemsOverviewPage from '.';
import { action } from 'storybook/actions';

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
  component: SapSystemsOverviewPage,
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
    sapSystem: sapSystem,
    onCleanUpClick: action('onCleanUpClick'),
  },
};
