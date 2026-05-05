import Component from './TargetResult';
import { action } from 'storybook/actions';

export default {
  title: 'Components/TargetResult',
  component: Component,
  argTypes: {
    targetType: {
      description: 'The targetType prop',
      control: { type: 'text' },
    },
    targetName: {
      description: 'The targetName prop',
      control: { type: 'text' },
    },
    expectationsSummary: {
      description: 'The expectationsSummary prop',
      control: { type: 'text' },
    },
    isAgentCheckError: {
      description: 'The isAgentCheckError prop',
      control: { type: 'boolean' },
    },
    onClick: {
      description: 'Callback function invoked when click',
      action: 'onClick',
    },
  },
};

export const Default = {
  args: {
    targetType: '',
    targetName: '',
    expectationsSummary: '',
    isAgentCheckError: false,
    onClick: action('onClick'),
  },
};
