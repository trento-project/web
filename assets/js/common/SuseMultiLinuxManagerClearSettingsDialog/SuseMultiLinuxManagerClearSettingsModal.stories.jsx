// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';

import SuseMultiLinuxManagerClearSettingsModal from './SuseMultiLinuxManagerClearSettingsModal';

export default {
  title: 'Components/SuseMultiLinuxManagerClearSettingsModal',
  component: SuseMultiLinuxManagerClearSettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: { type: 'boolean' },
    },
    onClearSettings: {
      description: 'Callback used to confirm the clearing of settings',
      action: 'onClearSettings',
    },
    onCancel: {
      description: 'Callback used to cancel the clearing of settings',
      action: 'onCancel',
    },
  },
};

export const Default = {
  args: {
    open: false,
    onClearSettings: action('onClearSettings'),
    onCancel: action('onCancel'),
  },
};
