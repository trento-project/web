import ChecksSelection from '.';

import { action } from 'storybook/actions';
export default {
  title: 'Components/ChecksSelectionItem',
  component: ChecksSelection,
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    name: {
      description: 'Name or label for the component',
      control: { type: 'text' },
    },
    description: {
      description: 'The description prop',
      control: { type: 'text' },
    },
    customizable: {
      description: 'Whether the check can be customized',
      control: { type: 'boolean' },
    },
    customized: {
      description: 'Whether the check has been customized',
      control: { type: 'boolean' },
    },
    selected: {
      description: 'Whether the check is selected',
      control: { type: 'boolean' },
    },
    userAbilities: {
      description: 'Array of user abilities',
      control: { type: 'object' },
    },
    onChange: {
      description: 'Callback function invoked when change',
      action: 'onChange',
    },
    onCustomize: {
      description: 'Callback function invoked when customize',
      action: 'onCustomize',
    },
    onResetCustomization: {
      description: 'Callback function invoked when reset customization',
      action: 'onResetCustomization',
    },
  },
};

export const Default = {
  args: {
    checkID: 'check-1',
    name: 'Check Name',
    description: 'Description of the check',
    customizable: true,
    customized: false,
    selected: true,
    userAbilities: [],
    onChange: action('onChange'),
    onCustomize: action('onCustomize'),
    onResetCustomization: action('onResetCustomization'),
  },
};
