import React from 'react';

import { action } from 'storybook/internal/actions';
import AnalyticsEulaModal from './AnalyticsEulaModal';

export default {
  title: 'Patterns/AnalyticsEulaModal',
  component: AnalyticsEulaModal,
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 500,
      },
    },
  },
  argTypes: {
    isOpen: {
      type: 'boolean',
      description: 'Sets the visibility of the modal',
    },
    onEnable: {
      description: 'Callback when the Enable button is clicked',
      control: { type: 'function' },
    },
    onCancel: {
      description: 'Callback when the Cancel button is clicked',
      control: { type: 'function' },
    },
  },
  args: {
    isOpen: true,
    onEnable: action('enable clicked'),
    onCancel: action('cancel clicked'),
  },
};

export function Default(args) {
  return <AnalyticsEulaModal {...args} />;
}
