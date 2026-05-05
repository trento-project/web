// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { abilityFactory, userFactory } from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import SuseManagerConfig from './SuseManagerConfig';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const user = userFactory.build();

export default {
  title: 'Components/SuseManagerConfig',
  component: SuseManagerConfig,
  argTypes: {
    username: {
      description: 'SUSE Manager username',
      control: { type: 'text' },
    },
    userAbilities: {
      description: 'Users abilities that allow changing SUSE Manager settings',
      control: { type: 'object' },
    },
    url: {
      description: 'SUSE Manager URL',
      control: { type: 'text' },
    },
    certUploadDate: {
      description: 'SUSE Manager self-signed certificate upload date',
      control: { type: 'date' },
    },
    onEditClick: {
      description: 'Callback used to edit settings',
      action: 'onEditClick',
    },
    clearSettingsDialogOpen: {
      description: "Whether the 'Clear Settings' dialog is open or not",
      control: { type: 'boolean' },
    },
    testConnectionEnabled: {
      description: "Whether the 'Test connection' button is enabled or not",
      control: { type: 'boolean' },
    },
    onClearClick: {
      description: "Callback used to open 'Clear Settings' dialog",
      action: 'onClearClick',
    },
    onClearSettings: {
      description: 'Callback used to clear settings',
      action: 'onClearSettings',
    },
    onCancel: {
      description:
        "Callback used to close the 'Edit Settings' and 'Clear Settings' dialogs",
      action: 'onCancel',
    },
    onTestConnection: {
      description: 'Callback function to test the SUSE Manager connection',
      action: 'callback',
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    url: 'https://trento-project.io/suse-manager',
    username: user.username,
    certUploadDate: '2024-01-29T08:41:47.291734Z',
    userAbilities: [allAbility],
    onEditClick: action('onEditClick'),
    onClearClick: action('onClearClick'),
    onClearSettings: action('onClearSettings'),
    onCancel: action('onCancel'),
    onTestConnection: action('onTestConnection'),
  },
};

export const WithVeryLongSUMAUrl = {
  args: {
    ...Default.args,
    url: 'https://this.is-a-very.long.url-that-will-be-truncated.trento-project.io/suse-manager',
  },
};

export const Empty = {
  args: {
    ...Default.args,
    userAbilities: [allAbility],
  },
};

export const EditUnauthorized = {
  args: {
    ...Default.args,
    userAbilities: [],
  },
};
