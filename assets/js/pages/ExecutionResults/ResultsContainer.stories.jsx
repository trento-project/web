import { catalogFactory, hostFactory } from '@lib/test-utils/factories';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import ResultsContainer from './ResultsContainer';

const hosts = hostFactory.buildList(2);
const catalog = catalogFactory.build();
const checks = Object.keys(catalog.catalog || {}).slice(0, 3);
export default {
  title: 'Components/ResultsContainer',
  component: ResultsContainer,
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
    hasAlreadyChecksResults: true,
    selectedChecks: checks,
    hosts: hosts.map((h) => h.id),
    children: 'Results content',
    onContentRefresh: action('onContentRefresh'),
    onStartExecution: action('onStartExecution'),
  },
};

export const NoResults = {
  args: {
    ...Default.args,
    hasAlreadyChecksResults: false,
  },
};

export const WithError = {
  args: {
    ...Default.args,
    error: true,
    errorContent: 'Failed to load results',
    hasAlreadyChecksResults: false,
  },
};
