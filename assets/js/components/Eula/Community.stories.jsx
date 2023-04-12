import React from 'react';
import { action } from '@storybook/addon-actions';

import Community from './Community';

export default {
  title: 'Eula Community',
  component: Community,
  args: { visible: true, dispatch: action() },
};

export function Default(args) {
  return <Community {...args} />;
}
