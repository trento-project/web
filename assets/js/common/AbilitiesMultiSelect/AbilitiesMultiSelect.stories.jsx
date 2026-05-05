import Component from './AbilitiesMultiSelect';
import { action } from 'storybook/actions';

export default {
  title: 'Components/AbilitiesMultiSelect',
  component: Component,
  argTypes: {
    abilities: {
      description: 'Available abilities options (array of ability objects)',
      control: { type: 'object' },
    },
    userAbilities: {
      description: 'Current user abilities (array of ability objects)',
      control: { type: 'object' },
    },
    placeholder: {
      description: 'Placeholder text shown in the select when empty',
      control: { type: 'text' },
    },
    setAbilities: {
      description: 'Callback invoked when selected abilities change',
      action: 'setAbilities',
    },
    operationsEnabled: {
      description: 'Flag to enable operations-related grouped abilities',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    abilities: [],
    userAbilities: [],
    placeholder: 'Select abilities...',
    operationsEnabled: true,
    setAbilities: action('setAbilities'),
  },
};
