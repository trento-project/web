import React from 'react';

import Button from '.';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'fit'],
      description: 'Button size',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'small' },
      },
    },
  },
};

export function Default() {
  return <Button>Hello world!</Button>;
}

export function Secondary() {
  return <Button type="secondary">Hello world!</Button>;
}

export function PrimaryWhite() {
  return <Button type="primary-white">Hello world!</Button>;
}

export function Transparent() {
  return <Button type="transparent">Hello world!</Button>;
}

export function Small() {
  return <Button size="small">Hello world!</Button>;
}

export function Fit() {
  return <Button size="fit">Hello world!</Button>;
}

export function SmallSecondary() {
  return (
    <Button size="small" type="secondary">
      Hello world!
    </Button>
  );
}

export function Disabled() {
  return <Button disabled>Hello world!</Button>;
}
