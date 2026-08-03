// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { action } from 'storybook/actions';

import CatalogContainer from './CatalogContainer';

export default {
  title: 'Components/CatalogContainer',
  component: CatalogContainer,
  argTypes: {
    onClear: {
      description: 'Callback function invoked when clear',
      action: 'onClear',
    },
    onRefresh: {
      description: 'Callback function invoked when refresh',
      action: 'onRefresh',
    },
    withResetFilters: {
      description: 'Whether to show reset filters button',
      control: { type: 'boolean' },
    },
    empty: {
      description: 'Whether the catalog is empty',
      control: { type: 'boolean' },
    },
    catalogError: {
      description: 'Error message from catalog loading',
      control: { type: 'text' },
    },
    loading: {
      description: 'Whether catalog is loading',
      control: { type: 'boolean' },
    },
    children: {
      description: 'Catalog content',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    onClear: action('onClear'),
    onRefresh: action('onRefresh'),
    withResetFilters: true,
    empty: false,
    catalogError: '',
    loading: false,
    children: 'Catalog content',
  },
};

export const Loading = {
  args: {
    ...Default.args,
    onClear: action('onClear'),
    onRefresh: action('onRefresh'),
    withResetFilters: true,
    empty: false,
    catalogError: '',
    loading: true,
    children: '',
  },
};

export const Empty = {
  args: {
    ...Default.args,
    onClear: action('onClear'),
    onRefresh: action('onRefresh'),
    withResetFilters: true,
    empty: true,
    catalogError: '',
    loading: false,
    children: '',
  },
};

export const WithError = {
  args: {
    ...Default.args,
    onClear: action('onClear'),
    onRefresh: action('onRefresh'),
    withResetFilters: true,
    empty: false,
    catalogError: 'Failed to load catalog',
    loading: false,
    children: '',
  },
};
