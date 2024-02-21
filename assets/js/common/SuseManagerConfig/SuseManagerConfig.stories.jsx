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
    onClearClick: {
      description: "Callback used to open 'Clear Settings' dialog",
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
  },
};

export const Empty = { args: {} };
