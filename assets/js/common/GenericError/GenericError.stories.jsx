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

export function Default(args) {
  return <GenericError {...args} />;
}

export function WithMessage(args) {
  return <GenericError {...args} message="My super cool error message" />;
}
