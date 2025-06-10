import React from 'react';
import { action } from 'storybook/actions';

import SettingsLoader, { Status as SettingsLoaderStatus } from '.';

export default {
  title: 'Components/SettingsLoader',
  component: SettingsLoader,
  argTypes: {
    status: {
      description: 'Settings Loader status',
      options: Object.keys(SettingsLoaderStatus),
      mapping: SettingsLoaderStatus,
      control: {
        type: 'select',
      },
    },
    sectionName: {
      description: 'Name of the setting section',
      control: {
        type: 'text',
      },
    },
    onRetry: {
      description:
        "Callback used to close the 'Edit Settings' and 'Clear Settings' dialogs",
      control: {
        type: 'function',
      },
    },
  },
  render: (args) => (
    <SettingsLoader {...args}>
      <p>We are</p>
      <p>the Children</p>
    </SettingsLoader>
  ),
};

export const Default = {
  args: {
    status: SettingsLoaderStatus.READY,
    sectionName: 'Trento',
    onRetry: action('retry!'),
  },
};
