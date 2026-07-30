// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import SuseMultiLinuxManagerClearSettingsModal from './SuseMultiLinuxManagerClearSettingsModal';

export default {
  title: 'Components/SuseMultiLinuxManagerClearSettingsModal',
  component: SuseMultiLinuxManagerClearSettingsModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: {
        type: 'boolean',
      },
    },
    onClearSettings: {
      description: 'Callback used to confirm the clearing of settings',
      control: {
        type: 'function',
      },
    },
    onCancel: {
      description: 'Callback used to cancel the clearing of settings',
      control: {
        type: 'function',
      },
    },
  },
};

export const Default = {
  args: {
    open: false,
  },
};
