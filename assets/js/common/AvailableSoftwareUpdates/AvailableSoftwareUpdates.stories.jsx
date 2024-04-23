import AvailableSoftwareUpdates from './AvailableSoftwareUpdates';

export default {
  title: 'Components/AvailableSoftwareUpdates',
  component: AvailableSoftwareUpdates,
  argTypes: {
    settingsConfigured: {
      type: 'bool',
      description: 'Have settings been saved for the software updates service',
    },
    relevantPatches: {
      type: 'number',
      description: 'Number of relevant patches available for the system',
      control: {
        type: 'number',
      },
    },
    upgradablePackages: {
      type: 'number',
      description: 'Number of upgradable packages for the system',
      control: {
        type: 'number',
      },
    },
    tooltip: {
      type: 'string',
      description: 'Content of the tooltip, if it is rendered',
    },
    loading: {
      type: 'bool',
      description: 'Is data being fetched?',
    },
    connectionError: {
      type: 'bool',
      description: 'There an error connecting to the software updates service',
    },
    onBackToSettings: {
      description:
        'Callback function to trigger when the "Settings" button is clicked',
      control: {
        type: 'function',
      },
    },
  },
};

export const Default = {
  args: {
    relevantPatches: 412,
    upgradablePackages: 234,
    settingsConfigured: true,
  },
};

export const Cool = {
  args: {
    relevantPatches: 0,
    upgradablePackages: 42,
    settingsConfigured: true,
  },
};

export const NoSettingsConfigured = { args: { settingsConfigured: false } };

export const Unknown = {
  args: { tooltip: 'SUSE Manager is not available', settingsConfigured: true },
};

export const Loading = { args: { loading: true, settingsConfigured: true } };

export const ConnectionError = {
  args: { connectionError: true, settingsConfigured: true },
};
