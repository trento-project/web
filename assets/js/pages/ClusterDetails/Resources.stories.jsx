import Component from './Resources';

export default {
  title: 'Components/Resources',
  component: Component,
  argTypes: {
    resources: {
      description: 'The resources prop',
      control: { type: 'text' },
    },
    hosts: {
      description: 'The hosts prop',
      control: { type: 'text' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'text' },
    },
    operationsDisabled: {
      description: 'The operationsDisabled prop',
      control: { type: 'text' },
    },
    getResourceOperations: {
      description: 'The getResourceOperations prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    resources: '',
    hosts: '',
    userAbilities: '',
    operationsDisabled: '',
    getResourceOperations: '',
  },
};
