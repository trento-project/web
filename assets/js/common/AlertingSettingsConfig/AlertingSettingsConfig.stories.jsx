import { alertingSettingsFactory } from '@lib//test-utils/factories/alertingSettings';

import AlertingSettingsConfig from './AlertingSettingsConfig';

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
    label: {
      type: 'string',
      description: 'Text label to display for an alerting settings field',
      control: { type: 'text' },
    },
    value: {
      type: 'string',
      description: 'The current value of an alerting settings field',
      control: { type: 'text' },
    },
    ariaLabel: {
      type: 'string',
      description: 'Accessibility label for the settings value element',
      control: { type: 'text' },
    },
    addClasses: {
      type: 'string',
      description:
        'Additional CSS classes to apply to the settings value element',
      control: { type: 'text' },
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
