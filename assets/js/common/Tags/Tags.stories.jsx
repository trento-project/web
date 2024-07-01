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
