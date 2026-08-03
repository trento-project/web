// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';

import HealthSummary from './HealthSummary';

export default {
  title: 'Components/HealthSummary',
  component: HealthSummary,
  argTypes: {
    passing: {
      description: 'The passing prop',
      control: { type: 'number' },
    },
    critical: {
      description: 'The critical prop',
      control: { type: 'number' },
    },
    warning: {
      description: 'The warning prop',
      control: { type: 'number' },
    },
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    onFilterChange: {
      description: 'Callback function invoked when filter change',
      action: 'onFilterChange',
    },
    activeFilters: {
      description: 'The activeFilters prop',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    passing: 10,
    critical: 2,
    warning: 3,
    className: '',
    activeFilters: [],
    onFilterChange: action('onFilterChange'),
  },
};
