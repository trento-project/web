import React, { useState } from 'react';
import { action } from 'storybook/actions';

import Switch from './Switch';

export default {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {
    selected: {
      control: { type: 'boolean' },
      description: 'Switch is in selected state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    onChange: {
      action: 'Toogle',
      description: 'Change switch state',
    },
  },
};

export const Default = {
  args: {
    selected: false,
    disabled: false,
    onChange: action('onChange'),
  },
  render: (args) => {
    const [selected, setSelected] = useState(args.selected);
    return <Switch {...args} selected={selected} onChange={setSelected} />;
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
