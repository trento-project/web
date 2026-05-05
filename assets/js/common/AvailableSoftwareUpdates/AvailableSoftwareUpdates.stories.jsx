import AvailableSoftwareUpdates from './AvailableSoftwareUpdates';
import { action } from 'storybook/actions';

export default {
  title: 'Components/AvailableSoftwareUpdates',
  component: AvailableSoftwareUpdates,
  argTypes: {
    settingsConfigured: {
      control: { type: 'boolean' },
      description: 'Have settings been saved for the software updates service',
    },
    onBackToSettings: {
      description:
        'Callback function to trigger when the "Settings" button is clicked',
      action: 'onBackToSettings',
    },
    onNavigateToPatches: {
      description:
        'Callback function to trigger when the "Relevant Patches" area is clicked',
      action: 'onNavigateToPatches',
    },
    onNavigateToPackages: {
      description:
        'Callback function to trigger when the "Upgradable Packages" area is clicked',
      action: 'onNavigateToPackages',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'are software updates settings being fetched?',
    },
    relevantPatches: {
      type: 'number',
      description: 'Number of relevant patches available for the system',
      control: { type: 'number' },
    },
    upgradablePackages: {
      type: 'number',
      description: 'Number of upgradable packages for the system',
      control: { type: 'number' },
    },
    tooltip: {
      type: 'string',
      description: 'Content of the tooltip, if it is rendered',
    },
    className: {
      type: 'string',
      description:
        "Additional CSS classes to apply to the component's container",
      control: { type: 'text' },
    },
    errorMessage: {
      type: 'string',
      description:
        'Error message displayed when software updates data is unavailable',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    settingsConfigured: true,
    relevantPatches: 412,
    upgradablePackages: 234,
    onBackToSettings: action('onBackToSettings'),
    onNavigateToPatches: action('onNavigateToPatches'),
    onNavigateToPackages: action('onNavigateToPackages'),
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

export const Loading = {
  args: { settingsConfigured: true, loading: true },
};

export const Error = {
  args: {
    settingsConfigured: true,
    errorMessage: 'Connection to SUMA not working',
    tooltip: 'Please review SUSE Manager settings',
  },
};
