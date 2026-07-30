// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import Button from '@common/Button';
import Tooltip, { PLACES } from '@common/Tooltip';
import { abilityFactory } from '@lib/test-utils/factories';
import React from 'react';

import DisabledGuard from './DisabledGuard';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

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
    tooltipWrap: {
      description:
        'Determines if the tooltip content should wrap or stay on a single line',
      control: { type: 'boolean' },
    },
    children: {
      description:
        'The element to be guarded, which becomes disabled if the user lacks authorization',
      control: { type: 'text' },
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

export const Default = {
  args: {
    userAbilities: [allAbility],
    permitted: [],
    withTooltip: false,
    tooltipMessage: 'You do not have permission',
    tooltipPlace: 'top',
    tooltipWrap: false,
  },
  render: (args) => guardElement(args),
};

export const Authorized = {
  args: {
    ...Default.args,
    userAbilities: [allAbility],
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
