import AlertingSettingsConfig from './AlertingSettingsConfig';

import { alertingSettingsFactory } from '@lib//test-utils/factories/alertingSettings';

export default {
  title: 'Components/AlertingSettingsConfig',
  component: AlertingSettingsConfig,
  argTypes: {
    settings: {
      description: 'Current alerting settings values',
      control: {
        type: 'object',
      },
    },

    userAbilities: {
      description: 'Abilities of the current user',
      control: {
        type: 'array',
      },
    },

    onEditClick: {
      description: 'Callback that would run on edit button being clicked',
      control: { type: 'function' },
    },
  },
};

export const Default = {};

export const WithFilledInValues = {
  args: {
    settings: alertingSettingsFactory.build(),
  },
};

export const WithEditButtonEnabledWhenEnoughPermissions = {
  args: {
    userAbilities: [{ name: 'all', resource: 'all' }],
  },
};

export const WithEditButtonDisabledWhenEnforcedFromEnv = {
  args: {
    settings: {
      enforcedFromEnv: true,
    },
    userAbilities: [{ name: 'all', resource: 'all' }],
  },
};
