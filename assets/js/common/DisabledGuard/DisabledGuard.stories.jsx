import React from 'react';

import Button from '@common/Button';
import Tooltip from '@common/Tooltip';

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
  },
};

export function Authorized() {
  return (
    <DisabledGuard userAbilities={[{ name: 'all', resource: 'all' }]}>
      <Button>Click me!</Button>
    </DisabledGuard>
  );
}

export function Disabled() {
  return (
    <DisabledGuard
      userAbilities={[]}
      permitted={['action:resource']}
      withTooltip={false}
    >
      <Button>Click me!</Button>
    </DisabledGuard>
  );
}

export function DisabledWithTooltip() {
  return (
    <DisabledGuard userAbilities={[]} permitted={['action:resource']}>
      <Button>Click me!</Button>
    </DisabledGuard>
  );
}

export function AuthorizedWithOriginalTooltip() {
  return (
    <DisabledGuard userAbilities={[{ name: 'all', resource: 'all' }]}>
      <Tooltip content="Original tooltip!">
        <Button>Click me!</Button>
      </Tooltip>
    </DisabledGuard>
  );
}

export function DisabledWithOriginalTooltip() {
  return (
    <DisabledGuard userAbilities={[]} permitted={['action:resource']}>
      <Tooltip content="Original tooltip!">
        <Button>Click me!</Button>
      </Tooltip>
    </DisabledGuard>
  );
}
