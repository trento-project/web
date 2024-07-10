import SuseManagerConfig from './SuseManagerConfig';

export default {
  title: 'Components/SuseManagerConfig',
  component: SuseManagerConfig,
  argTypes: {
    username: {
      description: 'SUSE Manager username',
      control: {
        type: 'text',
      },
    },
    userAbilities: {
      description: 'Users abilities that allow changing SUSE Manager settings',
      control: 'array',
    },
    configEditPermittedFor: {
      description:
        'Abilities that allow editing and clearing SUSE Manager settings',
      control: 'array',
    },
    url: {
      description: 'SUSE Manager URL',
      control: {
        type: 'text',
      },
    },
    certUploadDate: {
      description: 'SUSE Manager self-signed certificate upload date',
      control: {
        type: 'date',
      },
    },
    onEditClick: {
      description: 'Callback used to edit settings',
      control: {
        type: 'function',
      },
    },
    clearSettingsDialogOpen: {
      description: "Whether the 'Clear Settings' dialog is open or not",
      control: {
        type: 'boolean',
      },
    },
    testConnectionEnabled: {
      description: "Whether the 'Test connection' button is enabled or not",
      control: {
        type: 'boolean',
      },
    },
    onClearClick: {
      description: "Callback used to open 'Clear Settings' dialog",
      control: {
        type: 'function',
      },
    },
    onClearSettings: {
      description: 'Callback used to clear settings',
      control: {
        type: 'function',
      },
    },
    onCancel: {
      description:
        "Callback used to close the 'Edit Settings' and 'Clear Settings' dialogs",
      control: {
        type: 'function',
      },
    },
  },
};

export const Default = {
  args: {
    url: 'https://trento-project.io/suse-manager',
    username: 'trentoAdm',
    certUploadDate: '2024-01-29T08:41:47.291734Z',
    userAbilities: [{ name: 'all', resource: 'all' }],
    configEditPermittedFor: ['all:all'],
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
    userAbilities: [{ name: 'all', resource: 'all' }],
    configEditPermittedFor: ['all:all'],
  },
};

export const EditUnauthorized = {
  args: {
    ...Default.args,
    userAbilities: [],
  },
};
