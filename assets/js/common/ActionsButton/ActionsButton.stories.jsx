import React from 'react';
import { map, noop } from 'lodash';

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
      actions={map(actions, (action, index) =>
        index === 0 ? { ...action, disabled: true } : action
      )}
    />
  );
}

export function Running({ actions }) {
  return (
    <ActionsButton
      actions={map(actions, (action, index) =>
        index === 0 ? { ...action, running: true } : action
      )}
    />
  );
}
