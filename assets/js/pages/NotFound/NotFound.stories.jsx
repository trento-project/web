import React from 'react';

import NotFound from '.';

export default {
  title: 'Layouts/NotFound',
  component: NotFound,
  args: { buttonText: 'Go back home', onNavigate: () => {} },
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

export function Default(args) {
  return <NotFound {...args} />;
}
