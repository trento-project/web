import Component from './HealthSummaryBox';

import { action } from 'storybook/actions';
export default {
  title: 'Components/HealthSummaryBox',
  component: Component,
  argTypes: {
    health: {
      description: 'Health status of the component',
      control: { type: 'select' },
      options: ['passing', 'warning', 'critical'],
    },
    selected: {
      description: 'Whether the component is selected',
      control: { type: 'boolean' },
    },
    value: {
      description: 'Current value of the component',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Callback function invoked when click',
      action: 'onClick',
    },
  },
};

export const Default = {
  args: {
    health: 'passing',
    selected: false,
    value: '0',
    onClick: action('onClick'),
  },
};
