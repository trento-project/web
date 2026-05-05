import React from 'react';

import Button from './Button';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'fit'],
      description: 'Button size',
    },
    children: {
      type: 'element',
      description: 'Content or text displayed inside the button',
    },
    className: {
      description: 'Additional CSS classes applied to the button element',
      control: { type: 'text' },
    },
    type: {
      description:
        'Style variant of the button (e.g., primary, secondary, danger, link)',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Boolean indicating whether the button is disabled',
      control: { type: 'boolean' },
    },
    asSubmit: {
      description:
        "Boolean determining whether the button's type is submit or button",
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    size: 'small',
    children: 'Hello world!',
  },
};

export const Secondary = {
  args: {
    ...Default.args,
    type: 'secondary',
    children: 'Hello world!',
  },
};

export const Danger = {
  args: {
    ...Default.args,
    type: 'danger',
    children: 'Hello world!',
  },
};

export const DangerBold = {
  args: {
    ...Default.args,
    type: 'danger-bold',
    children: 'Danger!',
  },
};

export const PrimaryWhite = {
  args: {
    ...Default.args,
    type: 'primary-white',
    children: 'Hello world!',
  },
};

export const Transparent = {
  args: {
    ...Default.args,
    type: 'transparent',
    children: 'Hello world!',
  },
};

export const Small = {
  args: {
    ...Default.args,
    size: 'small',
    children: 'Hello world!',
  },
};

export const Fit = {
  args: {
    ...Default.args,
    size: 'fit',
    children: 'Hello world!',
  },
};

export const Link = {
  args: {
    ...Default.args,
    type: 'link',
    children: 'Go to another page',
  },
};

export const SmallSecondary = {
  args: {
    ...Default.args,
    size: 'small',
    type: 'secondary',
    children: 'Hello world!',
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    disabled: true,
    children: 'Hello world!',
  },
};
