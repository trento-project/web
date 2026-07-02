// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';

import AIConfigurationClearModal from './AIConfigurationClearModal';

export default {
  title: 'Components/AIConfiguration/ClearModal',
  component: AIConfigurationClearModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: { type: 'boolean' },
    },
    onClearSettings: {
      description: 'Callback used to confirm the clearing of settings',
      control: { type: 'function' },
    },
    onCancel: {
      description: 'Callback used to cancel the clearing of settings',
      control: { type: 'function' },
    },
  },
  args: {
    open: false,
    onClearSettings: action('Clear Settings clicked!'),
    onCancel: action('Cancel clicked!'),
  },
};

export const Default = {};
