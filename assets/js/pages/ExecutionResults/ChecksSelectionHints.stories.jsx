import React from 'react';
import { MemoryRouter } from 'react-router';
import Component from './ChecksSelectionHints';

import { action } from 'storybook/actions';
export default {
  title: 'Components/ChecksSelectionHints',
  component: Component,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    targetID: {
      description: 'Identifier for the targetID',
      control: { type: 'text' },
    },
    targetType: {
      description: 'The targetType prop',
      control: { type: 'text' },
    },
    selectedChecks: {
      description: 'The selectedChecks prop',
      control: { type: 'object' },
    },
    hosts: {
      description: 'The hosts prop',
      control: { type: 'object' },
    },
    onStartExecution: {
      description: 'Callback function invoked when start execution',
      action: 'onStartExecution',
    },
  },
};

export const Default = {
  args: {
    targetID: 'target-1',
    targetType: 'cluster',
    selectedChecks: [],
    hosts: [],
    onStartExecution: action('onStartExecution'),
  },
};
