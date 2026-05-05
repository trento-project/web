import React from 'react';
import { MemoryRouter } from 'react-router';
import Component from './ResultsContainer';

import { action } from 'storybook/actions';
export default {
  title: 'Components/ResultsContainer',
  component: Component,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    error: {
      description: 'The error prop',
      control: { type: 'boolean' },
    },
    errorContent: {
      description: 'The errorContent prop',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
    targetID: {
      description: 'Identifier for the targetID',
      control: { type: 'text' },
    },
    targetType: {
      description: 'The targetType prop',
      control: { type: 'text' },
    },
    hasAlreadyChecksResults: {
      description: 'The hasAlreadyChecksResults prop',
      control: { type: 'boolean' },
    },
    selectedChecks: {
      description: 'The selectedChecks prop',
      control: { type: 'object' },
    },
    hosts: {
      description: 'The hosts prop',
      control: { type: 'object' },
    },
    onContentRefresh: {
      description: 'Callback function invoked when content refresh',
      action: 'onContentRefresh',
    },
    onStartExecution: {
      description: 'Callback function invoked when start execution',
      action: 'onStartExecution',
    },
  },
};

export const Default = {
  args: {
    error: false,
    errorContent: '',
    targetID: 'target-1',
    targetType: 'cluster',
    hasAlreadyChecksResults: false,
    selectedChecks: [],
    hosts: [],
    onContentRefresh: action('onContentRefresh'),
    onStartExecution: action('onStartExecution'),
  },
};
