import Component from './Resources';

export default {
  title: 'Components/Resources',
  component: Component,
  argTypes: {
    resources: {
      description: 'The resources prop',
      control: { type: 'object' },
    },
    hosts: {
      description: 'The hosts prop',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    operationsDisabled: {
      description: 'The operationsDisabled prop',
      control: { type: 'text' },
    },
    getResourceOperations: {
      description: 'The getResourceOperations prop',
      control: { type: 'object' },
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
