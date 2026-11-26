// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { abilityFactory } from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import TargetChecksFrequencyConfig from './TargetChecksFrequencyConfig';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

export default {
  title: 'Components/TargetChecksFrequencyConfig',
  component: TargetChecksFrequencyConfig,
  argTypes: {
    targetType: {
      description: 'The type of the target',
      control: { type: 'radio' },
      options: ['host', 'cluster'],
    },
    schedule: {
      description:
        'The checks schedule of the target: `enabled`, `frequency` as `{value,unit}` and `global`, true when the target uses the system setting',
      control: { type: 'object' },
    },
    systemSettings: {
      description:
        'The global checks frequency settings, shown next to the own settings of the target',
      control: { type: 'object' },
    },
    onEditClick: {
      description: 'Callback when the edit button is clicked',
      action: 'callback',
    },
    userAbilities: {
      description:
        'Users abilities that allow editing the checks frequency of the target',
      control: { type: 'object' },
    },
  },
};

const systemSettings = {
  enabled: true,
  frequency: { value: 5, unit: 'minute' },
};

export const WithSystemSetting = {
  args: {
    targetType: 'host',
    schedule: {
      enabled: true,
      frequency: { value: 5, unit: 'minute' },
      global: true,
    },
    systemSettings,
    onEditClick: action('onEditClick'),
    userAbilities: [allAbility],
  },
};

export const WithOwnSettings = {
  args: {
    ...WithSystemSetting.args,
    targetType: 'cluster',
    schedule: {
      enabled: true,
      frequency: { value: 6, unit: 'hour' },
      global: false,
    },
  },
};

export const OwnSettingsDisabled = {
  args: {
    ...WithSystemSetting.args,
    schedule: {
      enabled: false,
      frequency: { value: 6, unit: 'hour' },
      global: false,
    },
  },
};

export const SystemSettingDisabledFromEnv = {
  args: {
    ...WithSystemSetting.args,
    schedule: { enabled: false, frequency: null, global: true },
    systemSettings: { enabled: false, frequency: null },
  },
};

export const Forbidden = {
  args: {
    ...WithSystemSetting.args,
    userAbilities: [],
  },
};
