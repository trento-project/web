import React from 'react';

import GenericError from './GenericError';

export default {
  title: 'Components/GenericError',
  component: GenericError,
  argTypes: {
    message: {
      description: 'Optional error message to display',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    message: undefined,
  },
};

export const WithMessage = {
  args: {
    ...Default.args,
    message: 'My super cool error message',
  },
};
