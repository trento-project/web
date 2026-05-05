import Component from './TriggerChecksExecutionRequest';

import { action } from 'storybook/actions';
export default {
  title: 'Components/TriggerChecksExecutionRequest',
  component: Component,
  argTypes: {
    targetID: {
      description: 'Identifier for the target',
      control: { type: 'text' },
    },
    cssClasses: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
    children: {
      description: 'Button text or content',
      control: { type: 'text' },
    },
    hosts: {
      description: 'List of hosts to execute checks on',
      control: { type: 'object' },
    },
    checks: {
      description: 'Array of checks to execute',
      control: { type: 'object' },
    },
    onStartExecution: {
      description: 'Callback function invoked when starting execution',
      action: 'onStartExecution',
    },
    cssOverride: {
      description: 'CSS override identifier',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    targetID: 'host_001',
    cssClasses: '',
    children: 'Execute Checks',
    hosts: [{ id: 'host_001', name: 'host-01' }],
    checks: [
      { id: 'check_001', name: 'Check 1' },
      { id: 'check_002', name: 'Check 2' },
    ],
    onStartExecution: action('onStartExecution'),
    cssOverride: '',
  },
};
