// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';

import AIConfigurationClearModal from './AIConfigurationClearModal';

export default {
  title: 'Components/AIConfigurationClearModal',
  component: AIConfigurationClearModal,
  args: {
    open: true,
    onClearSettings: action('Clear Settings clicked!'),
    onCancel: action('Cancel clicked!'),
  },
};

export const Default = {};
