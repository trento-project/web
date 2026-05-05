import Component from './SumaNotConfigured';

import { action } from 'storybook/actions';
export default {
  title: 'Components/SumaNotConfigured',
  component: Component,
  argTypes: {
    className: {
      description: 'Additional CSS classes for the container.',
      control: { type: 'text' },
    },
    onBackToSettings: {
      description:
        'Callback to be called when the "Settings" button is clicked.',
      action: 'onBackToSettings',
    },
  },
};

export const Default = {
  args: {
    className: '',
    onBackToSettings: action('onBackToSettings'),
  },
};
