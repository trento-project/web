// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { abilityFactory } from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import ChecksFrequencyConfig from './ChecksFrequencyConfig';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

export default {
  title: 'Components/ChecksFrequencyConfig',
  component: ChecksFrequencyConfig,
  argTypes: {
    enabled: {
      description:
        'Whether the checks run periodically. When false, the frequency is shown as Disabled',
      control: { type: 'boolean' },
    },
    frequency: {
      description:
        'A structured `{value,unit}` object that defines how often the checks run. `unit` is one of `minute`, `hour`, `week`.',
      control: { type: 'object' },
    },
    enforcedFromEnv: {
      description:
        'Whether the CHECKS_INTERVAL environment variable sets the frequency',
      control: { type: 'boolean' },
    },
    onEditClick: {
      description: 'Callback when the edit button is clicked',
      action: 'callback',
    },
    userAbilities: {
      description:
        'Users abilities that allow editing the checks frequency settings',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    enabled: true,
    frequency: { value: 5, unit: 'minute' },
    enforcedFromEnv: false,
    onEditClick: action('onEditClick'),
    userAbilities: [allAbility],
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    enabled: false,
    frequency: { value: 6, unit: 'hour' },
  },
};

export const EnforcedFromEnv = {
  args: {
    ...Default.args,
    frequency: { value: 1, unit: 'hour' },
    enforcedFromEnv: true,
  },
};

export const WithInvalidValue = {
  args: {
    ...Default.args,
    frequency: { is: 'invalid' },
  },
};

export const EditUnauthorized = {
  args: {
    ...Default.args,
    userAbilities: [],
  },
};
