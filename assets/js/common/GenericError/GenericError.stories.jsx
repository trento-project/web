import React from 'react';

import GenericError from '.';

export default {
  title: 'Components/GenericError',
  component: GenericError,
  args: { message: undefined },
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
