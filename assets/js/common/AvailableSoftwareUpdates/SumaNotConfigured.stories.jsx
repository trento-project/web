// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';

import SumaNotConfigured from './SumaNotConfigured';

export default {
  title: 'Components/SumaNotConfigured',
  component: SumaNotConfigured,
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
