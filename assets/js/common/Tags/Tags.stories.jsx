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
      description: "Callback function invoked when a tag pill element is clicked"
    },
    disabled: {
      description: "Whether tag deletion buttons are disabled"
    },
    tag: {
      description: "The tag string identifier for deletion operations"
    },
    className: {
      description: "Additional CSS classes to apply to the tags container element"
    },
    tags: {
      description: "Array of tag strings to display as individual tag pills"
    },
    onAdd: {
      description: "Callback function invoked when a new tag is added to the collection"
    },
    onRemove: {
      description: "Callback function invoked when an existing tag is removed"
    },
    resourceId: {
      description: "Unique identifier for the resource to which tags are associated"
    },
    userAbilities: {
      description: "Array of user ability objects to determine if tag operations are permitted"
    },
    validationMessage: {
      description: "Custom validation message displayed when tag input contains invalid characters"
    }
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
