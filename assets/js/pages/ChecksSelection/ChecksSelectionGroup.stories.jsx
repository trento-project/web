import { action } from 'storybook/actions';

import ChecksSelectionGroup from './ChecksSelectionGroup';

export default {
  title: 'Components/ChecksSelectionGroup',
  component: ChecksSelectionGroup,
  argTypes: {
    children: {
      description: 'Checks within this group',
      control: { type: 'text' },
    },
    group: {
      description: 'Group identifier or name',
      control: { type: 'text' },
    },
    selected: {
      description: 'Currently selected check IDs',
      control: { type: 'object' },
    },
    onChange: {
      description: 'Callback function invoked when selection changes',
      action: 'onChange',
    },
  },
};

export const Default = {
  args: {
    children: 'Check items go here',
    group: 'Configuration Checks',
    selected: {},
    onChange: action('onChange'),
  },
};

export const WithSelected = {
  args: {
    ...Default.args,
    group: 'Configuration Checks',
    selected: { check_001: true, check_002: true },
    onChange: action('onChange'),
    children: 'Check items go here',
  },
};
