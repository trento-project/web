import React from 'react';
import { MemoryRouter } from 'react-router';
import { clusterFactory } from '@lib/test-utils/factories';
import { action } from 'storybook/actions';
import ExecutionHeader from '.';

const cluster = clusterFactory.build({
  provider: 'aws',
  type: 'hana_scale_up',
  details: {
    architecture_type: 'classic',
    hana_scenario: 'performance_optimized',
  },
});

export default {
  title: 'Components/ExecutionHeader',
  component: ExecutionHeader,
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
      control: { type: 'object' },
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
    targetID: cluster.id,
    targetName: cluster.name,
    targetType: 'cluster',
    target: cluster,
    savedFilters: [],
    onFilterChange: action('onFilterChange'),
    onFilterSave: action('onFilterSave'),
  },
};
