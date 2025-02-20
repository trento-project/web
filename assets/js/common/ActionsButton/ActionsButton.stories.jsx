import React from 'react';
import { noop } from 'lodash';

import ActionsButton from './ActionsButton';

export default {
  title: 'Components/ActionsButton',
  component: ActionsButton,
  argTypes: {
    actions: {
      description: 'Actions to be displayed in the actions button menu',
      control: 'array',
    },
  },
  args: {
    actions: [
      {
        value: 'Operation 1',
        running: false,
        disabled: false,
        onClick: noop,
      },
      {
        value: 'Operation 2',
        running: false,
        disabled: false,
        onClick: noop,
      },
    ],
  },
};

export function Default(args) {
  return <ActionsButton {...args} />;
}

export function Disabled({ actions }) {
  return (
    <ActionsButton
      actions={Object.assign([], actions, {
        0: { ...actions[0], disabled: true },
      })}
    />
  );
}

export function Running({ actions }) {
  return (
    <ActionsButton
      actions={Object.assign([], actions, {
        0: { ...actions[0], running: true },
      })}
    />
  );
}
