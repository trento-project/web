import AvailableSoftwareUpdates from './AvailableSoftwareUpdates';

export default {
  title: 'Components/AvailableSoftwareUpdates',
  component: AvailableSoftwareUpdates,
  argTypes: {
    settingsConfigured: {
      control: {
        type: 'boolean',
      },
      description: 'Have settings been saved for the software updates service',
    },
    onBackToSettings: {
      description:
        'Callback function to trigger when the "Settings" button is clicked',
      control: {
        type: 'function',
      },
    },
    onNavigateToPatches: {
      description:
        'Callback function to trigger when the "Relevant Patches" area is clicked',
      control: {
        type: 'function',
      },
    },
    onNavigateToPackages: {
      description:
        'Callback function to trigger when the "Upgradable Packages" area is clicked',
      control: {
        type: 'function',
      },
    },
    softwareUpdatesSettingsLoading: {
      control: {
        type: 'boolean',
      },
      description: 'are software updates settings being fetched?',
    },
    softwareUpdatesLoading: {
      control: {
        type: 'boolean',
      },
      description: 'are software updates being fetched?',
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
  },
};

export const Default = {
  args: {
    settingsConfigured: true,
    relevantPatches: 412,
    upgradablePackages: 234,
  },
};

export const Cool = {
  args: {
    settingsConfigured: true,
    relevantPatches: 0,
    upgradablePackages: 42,
  },
};

export const NoSettingsConfigured = { args: { settingsConfigured: false } };

export const SoftwareUpdateSettingsLoading = {
  args: { softwareUpdatesSettingsLoading: true },
};

export const SoftwareUpdatesLoading = {
  args: { settingsConfigured: true, softwareUpdatesLoading: true },
};

export const Unknown = {
  args: {
    settingsConfigured: true,
    tooltip: 'Trento was not able to retrieve the requested data',
  },
};
