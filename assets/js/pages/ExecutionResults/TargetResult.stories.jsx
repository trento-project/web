import ExecutionResults from '.';
import { action } from 'storybook/actions';

export default {
  title: 'Components/TargetResult',
  component: ExecutionResults,
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
    targetType: 'cluster',
    targetName: 'Cluster 1',
    expectationsSummary: '5/6 Expectations met',
    isAgentCheckError: false,
    onClick: action('onClick'),
  },
};

export const WithError = {
  args: {
    ...Default.args,
    isAgentCheckError: true,
    expectationsSummary: 'Check execution failed',
  },
};
