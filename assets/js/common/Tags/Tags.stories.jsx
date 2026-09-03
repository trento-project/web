// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { abilityFactory } from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import Tags from './Tags';

const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });

export default {
  title: 'Components/Tags',
  component: Tags,
  args: {
    tags: ['carbonara', 'Amatriciana'],
    userAbilities: [allAbility],
    tagAdditionPermittedFor: ['all:all'],
    tagDeletionPermittedFor: ['all:all'],
  },
  argTypes: {
    onChange: { action: 'tag changed' },
    tagAdditionPermittedFor: {
      description: 'Abilities that allow tag creation',
      action: 'callback',
    },
    tagDeletionPermittedFor: {
      description: 'Abilities that allow tag deletion',
      action: 'callback',
    },
    className: {
      description:
        'Additional CSS classes to apply to the tags container element',
      control: { type: 'text' },
    },
    tags: {
      description: 'Array of tag strings to display as individual tag pills',
      control: { type: 'object' },
    },
    onAdd: {
      description:
        'Callback function invoked when a new tag is added to the collection',
      action: 'callback',
    },
    onRemove: {
      description: 'Callback function invoked when an existing tag is removed',
      action: 'callback',
    },
    resourceId: {
      description:
        'Unique identifier for the resource to which tags are associated',
      control: { type: 'text' },
    },
    userAbilities: {
      description:
        'Array of user ability objects to determine if tag operations are permitted',
      control: { type: 'object' },
    },
    validationMessage: {
      description:
        'Custom validation message displayed when tag input contains invalid characters',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Callback function invoked when click',
      action: 'onClick',
    },
    disabled: {
      description: 'Whether the component is disabled',
      control: { type: 'boolean' },
    },
    tag: {
      description: 'The tag prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    tags: ['carbonara', 'Amatriciana'],
    userAbilities: [allAbility],
    tagAdditionPermittedFor: ['all:all'],
    tagDeletionPermittedFor: ['all:all'],
    onChange: action('onChange'),
    onAdd: action('onAdd'),
    onRemove: action('onRemove'),
    onClick: action('onClick'),
  },
};

export const Empty = {
  args: {
    ...Default.args,
    tags: [],
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    userAbilities: [],
  },
};
