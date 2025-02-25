import React from 'react';
import { noop } from 'lodash';

import OperationsButton from './OperationsButton';

export default {
  title: 'Components/OperationsButton',
  component: OperationsButton,
  argTypes: {
    operations: {
      description: 'Operations to be displayed in the operations button menu',
      control: 'array',
    },
  },
  args: {
    operations: [
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
  return <OperationsButton {...args} />;
}

export function Disabled({ operations }) {
  return (
    <OperationsButton
      operations={Object.assign([], operations, {
        0: { ...operations[0], disabled: true },
      })}
    />
  );
}

export function Running({ operations }) {
  return (
    <OperationsButton
      operations={Object.assign([], operations, {
        0: { ...operations[0], running: true },
      })}
    />
  );
}
