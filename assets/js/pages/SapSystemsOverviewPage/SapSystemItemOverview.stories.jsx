import Component from './SapSystemItemOverview';
import { action } from 'storybook/actions';

export default {
  title: 'Components/SapSystemItemOverview',
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
    sapSystem: {
      description: 'The sapSystem prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    instance: '',
    userAbilities: '',
    sapSystem: '',
    onCleanUpClick: action('onCleanUpClick'),
  },
};
