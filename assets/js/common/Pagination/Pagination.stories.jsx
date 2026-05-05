import React from 'react';
import { action } from 'storybook/actions';

import PageStats from './PageStats';
import Pagination from './Pagination';

export default {
  title: 'Components/Pagination',
  component: Pagination,
  argTypes: {
    hasPrev: {
      description: 'Whether the previous page button is enabled',
      control: { type: 'boolean' },
    },
    hasNext: {
      description: 'Whether the next page button is enabled',
      control: { type: 'boolean' },
    },
    currentItemsPerPage: {
      description: 'Number of items currently displayed per page',
      control: { type: 'number' },
    },
    itemsPerPageOptions: {
      description: 'Available options for items per page',
      control: { type: 'object' },
    },
    onSelect: {
      description: 'Callback function invoked with page navigation action',
      action: 'callback',
    },
    pageStats: {
      description:
        'Component or content displayed to show current page statistics',
      control: { type: 'object' },
    },
    className: {
      description: 'Additional CSS classes applied to the pagination container',
      control: { type: 'text' },
    },
    onChangeItemsPerPage: {
      description:
        'Callback function invoked when the items per page selection is changed',
      action: 'onChangeItemsPerPage',
    },
    onChange: {
      description: 'Callback function invoked when change',
      action: 'onChange',
    },
  },
  render: (args) => (
    <Pagination
      {...args}
      onSelect={(value) => {
        action('onSelect')(value);
      }}
      onChangeItemsPerPage={(value) => {
        action('onChangeItemsPerPage')(value);
      }}
    />
  ),
};

export const Default = {
  args: {
    hasPrev: true,
    hasNext: true,
    currentItemsPerPage: 10,
    itemsPerPageOptions: [10, 20, 50],
  },
};

export const WithPageStats = {
  args: {
    ...Default.args,
    pageStats: (
      <PageStats
        selectedPage={1}
        itemsPresent={42}
        itemsTotal={54}
        currentItemsPerPage={10}
      />
    ),
  },
};
