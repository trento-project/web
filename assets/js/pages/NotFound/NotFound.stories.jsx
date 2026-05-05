import React from 'react';
import { action } from 'storybook/actions';

import NotFound from '.';

export default {
  title: 'Layouts/NotFound',
  component: NotFound,
  args: { buttonText: 'Go back home', onNavigate: action('onNavigate') },
  argTypes: {
    buttonText: {
      description: 'Text to display on the navigation button',
      control: { type: 'text' },
    },
    onNavigate: {
      description: 'Function to call when the navigation button is clicked',
      action: 'navigate',
    },
  },
};

export const Default = {
  args: {
    buttonText: 'Go back home',
    onNavigate: action('onNavigate'),
  },
};
