import Component from './DatabaseItemOverview';

export default {
  title: 'Components/DatabaseItemOverview',
  component: Component,
  argTypes: {
    instance: {
      description: 'The instance prop',
      control: { type: 'text' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'text' },
    },
    onCleanUpClick: {
      description: 'Callback function invoked when clean up click',
      action: 'onCleanUpClick',
    },
    instances: {
      description: 'The instances prop',
      control: { type: 'text' },
    },
    asDatabaseLayer: {
      description: 'The asDatabaseLayer prop',
      control: { type: 'text' },
    },
    database: {
      description: 'Array of items for the database',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    instance: '',
    userAbilities: '',
    instances: '',
    asDatabaseLayer: '',
    database: [],
  },
};
