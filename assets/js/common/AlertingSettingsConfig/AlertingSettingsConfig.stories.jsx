// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  abilityFactory,
  alertingSettingsFactory,
} from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import AlertingSettingsConfig from './AlertingSettingsConfig';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

export default {
  title: 'Components/AlertingSettingsConfig',
  component: AlertingSettingsConfig,
  argTypes: {
    settings: {
      description: 'Current alerting settings values',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'Abilities of the current user',
      control: { type: 'object' },
    },
    testEmailLoading: {
      description: 'Whether a test email submission is currently in flight',
      control: { type: 'boolean' },
    },
    onEditClick: {
      description: 'Callback that would run on edit button being clicked',
      action: 'onEditClick',
    },
    onTestEmailClick: {
      description: 'Callback that would run on test email button being clicked',
      action: 'onTestEmailClick',
    },
  },
};

export const Default = {
  args: {
    settings: {},
    userAbilities: [],
    label: 'Alerting Settings',
    value: 'default',
    ariaLabel: 'alerting-settings-config',
    addClasses: 'my-class',
  },
};

export const WithFilledInValues = {
  args: {
    ...Default.args,
    settings: alertingSettingsFactory.build(),
    userAbilities: [],
    onEditClick: action('onEditClick'),
  },
};

export const WithEditButtonEnabledWhenEnoughPermissions = {
  args: {
    ...Default.args,
    settings: {},
    userAbilities: [allAbility],
    onEditClick: action('onEditClick'),
  },
};

export const WithEditButtonDisabledWhenEnforcedFromEnv = {
  args: {
    ...Default.args,
    settings: {
      enforcedFromEnv: true,
    },
    userAbilities: [allAbility],
    onEditClick: action('onEditClick'),
  },
};

export const WithTestEmailButtonEnabledWhenAlertingEnabled = {
  args: {
    ...Default.args,
    settings: alertingSettingsFactory.build({ alertingEnabled: true }),
    userAbilities: [allAbility],
    onEditClick: action('onEditClick'),
    onTestEmailClick: action('onTestEmailClick'),
  },
};

export const WithTestEmailButtonDisabledWhenAlertingDisabled = {
  args: {
    ...Default.args,
    settings: alertingSettingsFactory.build({ alertingEnabled: false }),
    userAbilities: [allAbility],
    onEditClick: action('onEditClick'),
    onTestEmailClick: action('onTestEmailClick'),
  },
};
