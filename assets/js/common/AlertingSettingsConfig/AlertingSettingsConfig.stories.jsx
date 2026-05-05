import {
  alertingSettingsFactory,
  abilityFactory,
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
