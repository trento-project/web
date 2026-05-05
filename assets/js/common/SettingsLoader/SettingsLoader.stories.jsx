import React from 'react';
import { action } from 'storybook/actions';

import SettingsLoader, { Status } from './SettingsLoader';

export default {
  title: 'Components/SettingsLoader',
  component: SettingsLoader,
  argTypes: {
    status: {
      description: 'Settings Loader status',
      options: Object.keys(Status),
      mapping: Status,
      control: { type: 'select' },
    },
    sectionName: {
      description: 'Name of the setting section',
      control: { type: 'text' },
    },
    onRetry: {
      description:
        "Callback used to close the 'Edit Settings' and 'Clear Settings' dialogs",
      action: 'onRetry',
    },
    children: {
      type: 'element',
      description:
        'React elements or content displayed when the settings loader status is READY',
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
    status: Status.READY,
    sectionName: 'Trento',
    onRetry: action('onRetry'),
  },
};
