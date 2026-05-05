import { alertingSettingsFactory } from '@lib//test-utils/factories/alertingSettings';
import { action } from 'storybook/actions';

import AlertingSettingsConfig from './AlertingSettingsConfig';

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
    onEditClick: {
      description: 'Callback that would run on edit button being clicked',
      action: 'onEditClick',
    },
  },
};

export const Default = {
  args: {
    settings: {},
    userAbilities: [],
    label: '',
    value: '',
    ariaLabel: '',
    addClasses: '',
  },
};

export const WithFilledInValues = {
  args: {
    settings: alertingSettingsFactory.build(),
    userAbilities: [],
    onEditClick: action('onEditClick'),
  },
};

export const WithEditButtonEnabledWhenEnoughPermissions = {
  args: {
    settings: {},
    userAbilities: [{ name: 'all', resource: 'all' }],
    onEditClick: action('onEditClick'),
  },
};

export const WithEditButtonDisabledWhenEnforcedFromEnv = {
  args: {
    settings: {
      enforcedFromEnv: true,
    },
    userAbilities: [{ name: 'all', resource: 'all' }],
    onEditClick: action('onEditClick'),
  },
};
