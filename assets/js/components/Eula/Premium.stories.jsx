import React from 'react';
import { action } from '@storybook/addon-actions';

import Premium from './Premium';

export default {
  title: 'Eula Premium',
  component: Premium,
  args: { visible: true, dispatch: action() },
};

export function Default(args) {
  return <Premium {...args} />;
}
