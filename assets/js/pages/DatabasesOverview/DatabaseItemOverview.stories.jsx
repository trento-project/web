import Component from './DatabaseItemOverview';
import { action } from 'storybook/actions';

export default {
  title: 'Components/DatabaseItemOverview',
  component: Component,
  argTypes: {
    instance: {
      description: 'The instance prop',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    onCleanUpClick: {
      description: 'Callback function invoked when clean up click',
      action: 'onCleanUpClick',
    },
    instances: {
      description: 'The instances prop',
      control: { type: 'object' },
    },
    asDatabaseLayer: {
      description: 'The asDatabaseLayer prop',
      control: { type: 'object' },
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
    onCleanUpClick: action('onCleanUpClick'),
  },
};
