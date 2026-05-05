import AvailableSoftwareUpdates from '.';

import { action } from 'storybook/actions';
export default {
  title: 'Components/SumaNotConfigured',
  component: AvailableSoftwareUpdates,
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
