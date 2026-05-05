import React from 'react';
import { action } from 'storybook/actions';
import { EOS_UPDATE_OUTLINED } from 'eos-icons-react';

import AvailableSoftwareUpdates from '.';

export default {
  title: 'Components/Indicator',
  component: AvailableSoftwareUpdates,
  argTypes: {
    title: {
      description: 'The title of the indicator',
      control: { type: 'text' },
    },
    critical: {
      description:
        'A critical value to be displayed. It will be displayed next to an error icon.',
      control: { type: 'number' },
    },
    tooltip: {
      description:
        'The tooltip content, visible on hover when there is an error',
      control: { type: 'text' },
    },
    message: {
      description: 'The message to be displayed under the title',
      control: { type: 'text' },
    },
    icon: {
      description: 'The icon to be displayed. This should be a component.',
    },
    isError: {
      description: 'Flag to indicate an error state',
      control: { type: 'boolean' },
    },
    onNavigate: {
      description: 'Callback function executed when the indicator is clicked',
      action: 'onNavigate',
    },
  },
};

export const Default = {
  args: {
    title: 'Updates available',
    critical: 1,
    tooltip: 'Some error',
    message: 'Click here to review and install them.',
    icon: <EOS_UPDATE_OUTLINED size="l" />,
    isError: false,
    onNavigate: action('onNavigate'),
  },
};
