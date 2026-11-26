// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { action } from 'storybook/actions';

import ChecksFrequencySettingsModal from './ChecksFrequencySettingsModal';

export default {
  title: 'Components/ChecksFrequencySettingsModal',
  component: ChecksFrequencySettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: { type: 'boolean' },
    },
    initialEnabled: {
      description:
        'Whether the checks run periodically. When false, the frequency is shown but can not be edited until the checks are enabled again. For a host or cluster, the own setting it starts from.',
      control: { type: 'boolean' },
    },
    initialFrequency: {
      description:
        'A structured `{value,unit}` object that defines how often the checks run. `unit` is one of `minute`, `hour`, `week`. For a host or cluster, the own frequency it starts from. Without one, it starts from 5 minutes.',
      control: { type: 'object' },
    },
    systemSettings: {
      description:
        'The global `{enabled,frequency}` checks frequency settings, given when editing a host or cluster. The modal then offers a "Use system setting" switch, and shows these settings read only while it is on.',
      control: { type: 'object' },
    },
    initialUseSystemSetting: {
      description:
        'Whether the target follows the system settings. With the switch on, the system settings are shown read only and saving passes null to onSave.',
      control: { type: 'boolean' },
    },
    errors: {
      description: 'The validation error to be shown',
      control: { type: 'object' },
    },
    loading: {
      description:
        'Boolean flag indicating whether a save operation is in progress to disable the Save Settings button',
      control: { type: 'boolean' },
    },
    onSave: {
      description:
        'Callback function invoked when the Save Settings button is clicked, with the settings, or null to use the system settings of a target',
      action: 'onSave',
    },
    onCancel: {
      description:
        'Callback function invoked when the Close button is clicked or the modal is closed',
      action: 'onCancel',
    },
    onClearErrors: {
      description:
        'Callback function invoked when the periodic checks or the system setting are switched, or the frequency is modified, to clear previous validation errors',
      action: 'onClearErrors',
    },
  },
};

export const Default = {
  args: {
    open: true,
    initialEnabled: true,
    initialFrequency: { value: 5, unit: 'minute' },
    errors: [],
    onSave: action('onSave'),
    onCancel: action('onCancel'),
    onClearErrors: action('onClearErrors'),
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    initialEnabled: false,
    initialFrequency: { value: 6, unit: 'hour' },
  },
};

export const Saving = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const WithFieldValidationError = {
  args: {
    ...Default.args,
    initialFrequency: { value: 6, unit: 'hour' },
    errors: [
      {
        detail: 'must be one of 1, 6, 12, 24 when the unit is hour',
        source: { pointer: '/frequency/value' },
        title: 'Invalid value',
      },
    ],
  },
};

export const WithEnforcedFromEnvError = {
  args: {
    ...Default.args,
    errors: [
      {
        detail: 'Checks frequency settings can not be set, enforced by ENV.',
        title: 'Conflict has occurred',
      },
    ],
  },
};

export const TargetWithSystemSetting = {
  args: {
    ...Default.args,
    systemSettings: { enabled: true, frequency: { value: 5, unit: 'minute' } },
    initialUseSystemSetting: true,
    initialEnabled: true,
    initialFrequency: { value: 5, unit: 'minute' },
  },
};

export const TargetWithOwnSettings = {
  args: {
    ...Default.args,
    systemSettings: { enabled: true, frequency: { value: 5, unit: 'minute' } },
    initialUseSystemSetting: false,
    initialEnabled: true,
    initialFrequency: { value: 6, unit: 'hour' },
  },
};

export const TargetWithSystemSettingDisabledFromEnv = {
  args: {
    ...Default.args,
    systemSettings: { enabled: false, frequency: null },
    initialUseSystemSetting: true,
    initialEnabled: false,
    initialFrequency: null,
  },
};
