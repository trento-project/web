import React from 'react';

import Button from '@common/Button';
import Tooltip from '@common/Tooltip';
import { PLACES } from '@common/Tooltip/Tooltip';

import DisabledGuard from '.';

export default {
  title: 'Components/DisabledGuard',
  component: DisabledGuard,
  argTypes: {
    userAbilities: {
      control: { type: 'object' },
      description: 'Current user abilities',
    },
    permitted: {
      control: { type: 'object' },
      description: 'Abilities that authorize the usage of the guarded element',
    },
    withTooltip: {
      control: { type: 'boolean' },
      description: 'Add tooltip saying user is not authorized for this action',
    },
    tooltipMessage: {
      control: { type: 'text' },
      description: 'Tooltip message',
    },
    tooltipPlace: {
      control: { type: 'radio' },
      options: PLACES,
      description: 'Tooltip place',
    },
  },
};

const guardElement = (args) => (
  <div className="pt-10 pl-32 w-64">
    <DisabledGuard {...args}>
      <Button>Click me!</Button>
    </DisabledGuard>
  </div>
);

const guardElementWithTooltip = (args) => (
  <div className="pt-10 pl-32 w-64">
    <DisabledGuard {...args}>
      <Tooltip content="Original tooltip!">
        <Button>Click me!</Button>
      </Tooltip>
    </DisabledGuard>
  </div>
);

export const Authorized = {
  args: {
    userAbilities: [{ name: 'all', resource: 'all' }],
    tooltipMessage: 'Some tooltip',
  },
  render: (args) => guardElement(args),
};

export const Disabled = {
  args: {
    ...Authorized.args,
    userAbilities: [],
    permitted: ['action:resource'],
    withTooltip: false,
  },
  render: (args) => guardElement(args),
};

export const DisabledWithTooltip = {
  args: {
    ...Disabled.args,
    withTooltip: true,
  },
  render: (args) => guardElement(args),
};

export const AuthorizedWithOriginalTooltip = {
  args: {
    ...Authorized.args,
  },
  render: (args) => guardElementWithTooltip(args),
};

export const DisabledWithOriginalTooltip = {
  args: {
    ...DisabledWithTooltip.args,
  },
  render: (args) => guardElementWithTooltip(args),
};
