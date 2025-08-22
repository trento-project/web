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
    userAbilities: {
      control: 'array',
      description: 'Current user abilities',
    },
    menuPosition: {
      type: 'string',
      description: 'Position of the menu',
      control: {
        type: 'text',
      },
    },
  },
};

export const Default = {
  args: {
    operations: [
      {
        value: 'Operation 1',
        running: false,
        disabled: false,
        permitted: ['foo:resource'],
        onClick: noop,
      },
      {
        value: 'Operation 2',
        running: false,
        disabled: false,
        permitted: ['bar:resource'],
        onClick: noop,
      },
    ],
    userAbilities: [{ name: 'all', resource: 'all' }],
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const ItemDisabled = {
  args: {
    ...Default.args,
    operations: Object.assign([], Default.args.operations, {
      0: { ...Default.args.operations[0], disabled: true },
    }),
  },
};

export const Running = {
  args: {
    ...Default.args,
    operations: Object.assign([], Default.args.operations, {
      0: { ...Default.args.operations[0], running: true },
    }),
  },
};

export const Transparent = {
  args: {
    ...Default.args,
    text: '',
    transparent: true,
    menuPosition: 'bottom',
  },
};

export const Forbidden = {
  args: {
    ...Default.args,
    userAbilities: [{ name: 'foo', resource: 'resource' }],
  },
};

export const OtherPosition = {
  args: {
    ...Default.args,
    menuPosition: 'bottom end',
  },
};
