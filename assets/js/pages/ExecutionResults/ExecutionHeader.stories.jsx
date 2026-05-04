import React from 'react';
import { MemoryRouter } from 'react-router';
import Component from './ExecutionHeader';

export default {
  title: 'Components/ExecutionHeader',
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
    targetName: {
      description: 'The targetName prop',
      control: { type: 'text' },
    },
    targetType: {
      description: 'The targetType prop',
      control: { type: 'text' },
    },
    target: {
      description: 'The target prop',
      control: { type: 'text' },
    },
    savedFilters: {
      description: 'The savedFilters prop',
      control: { type: 'text' },
    },
    onFilterChange: {
      description: 'Callback function invoked when filter change',
      action: 'onFilterChange',
    },
    onFilterSave: {
      description: 'Callback function invoked when filter save',
      action: 'onFilterSave',
    },
  },
};

export const Default = {
  args: {
    targetID: 'target-1',
    targetName: 'Cluster-01',
    targetType: 'cluster',
    target: {},
    savedFilters: [],
  },
};
