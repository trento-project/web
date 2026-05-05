import {
  databaseInstanceFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { action } from 'storybook/actions';

import InstanceOverview from './InstanceOverview';

const applicationInstance = sapSystemApplicationInstanceFactory.build();
const databaseInstance = databaseInstanceFactory.build();
const userAbilities = [];

export default {
  title: 'Components/InstanceOverview',
  component: InstanceOverview,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    instanceType: {
      description: 'The instanceType prop',
      control: { type: 'text' },
    },
    instance: {
      description: 'The instance prop',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    cleanUpPermittedFor: {
      description: 'The cleanUpPermittedFor prop',
      control: { type: 'object' },
    },
    onCleanUpClick: {
      description: 'Callback function invoked when clean up click',
      action: 'onCleanUpClick',
    },
  },
};

export const Default = {
  args: {
    instanceType: 'application',
    instance: applicationInstance,
    userAbilities,
    cleanUpPermittedFor: [],
    onCleanUpClick: action('onCleanUpClick'),
  },
};

export const Database = {
  args: {
    instanceType: 'database',
    instance: databaseInstance,
    userAbilities,
    cleanUpPermittedFor: [],
    onCleanUpClick: action('onCleanUpClick'),
  },
};
