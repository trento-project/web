import Tags from '.';

export default {
  title: 'Components/Tags',
  component: Tags,
  args: {
    tags: ['carbonara', 'Amatriciana'],
    userAbilities: [{ name: 'all', resource: 'all' }],
    tagAdditionPermittedFor: ['all:all'],
    tagDeletionPermittedFor: ['all:all'],
  },
  argTypes: {
    onChange: { action: 'tag changed' },
    tagAdditionPermittedFor: {
      control: 'array',
      description: 'Abilities that allow tag creation',
    },
    tagDeletionPermittedFor: {
      control: 'array',
      description: 'Abilities that allow tag deletion',
    },
    onClick: {
      type: 'function',
      description:
        'Callback function invoked when a tag pill element is clicked',
    },
    disabled: {
      type: 'boolean',
      description: 'Whether tag deletion buttons are disabled',
      control: { type: 'boolean' },
    },
    tag: {
      type: 'string',
      description: 'The tag string identifier for deletion operations',
      control: { type: 'text' },
    },
    className: {
      type: 'string',
      description:
        'Additional CSS classes to apply to the tags container element',
      control: { type: 'text' },
    },
    tags: {
      type: 'array',
      description: 'Array of tag strings to display as individual tag pills',
      control: { type: 'object' },
    },
    onAdd: {
      type: 'function',
      description:
        'Callback function invoked when a new tag is added to the collection',
    },
    onRemove: {
      type: 'function',
      description: 'Callback function invoked when an existing tag is removed',
    },
    resourceId: {
      type: 'string',
      description:
        'Unique identifier for the resource to which tags are associated',
      control: { type: 'text' },
    },
    userAbilities: {
      type: 'array',
      description:
        'Array of user ability objects to determine if tag operations are permitted',
      control: { type: 'object' },
    },
    validationMessage: {
      type: 'string',
      description:
        'Custom validation message displayed when tag input contains invalid characters',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    tags: ['carbonara', 'Amatriciana'],
    userAbilities: [{ name: 'all', resource: 'all' }],
    tagAdditionPermittedFor: ['all:all'],
    tagDeletionPermittedFor: ['all:all'],
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
