// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';

import AvailableSoftwareUpdates from './AvailableSoftwareUpdates';

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
      description: 'Number of relevant patches available for the system',
      control: { type: 'number' },
    },
    upgradablePackages: {
      description: 'Number of upgradable packages for the system',
      control: { type: 'number' },
    },
    tooltip: {
      description: 'Content of the tooltip, if it is rendered',
      control: { type: 'text' },
    },
    className: {
      description:
        "Additional CSS classes to apply to the component's container",
      control: { type: 'text' },
    },
    errorMessage: {
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
    ...Default.args,
    settingsConfigured: true,
    relevantPatches: 0,
    upgradablePackages: 42,
  },
};

export const NoSettingsConfigured = {
  args: {
    ...Default.args,
    settingsConfigured: false,
  },
};

export const Loading = {
  args: {
    ...Default.args,
    settingsConfigured: true,
    loading: true,
  },
};

export const Error = {
  args: {
    ...Default.args,
    settingsConfigured: true,
    errorMessage: 'Connection to SUMA not working',
    tooltip: 'Please review SUSE Manager settings',
  },
};
