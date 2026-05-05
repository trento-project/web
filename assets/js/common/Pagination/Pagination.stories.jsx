import React from 'react';
import Pagination, { PageStats } from '.';
import { action } from 'storybook/actions';

export default {
  title: 'Components/Pagination',
  component: Pagination,
  argTypes: {
    hasPrev: { control: { type: 'boolean' }, defaultValue: true },
    hasNext: { control: { type: 'boolean' }, defaultValue: true },
    currentItemsPerPage: {
      control: { type: 'number' },
      defaultValue: 10,
    },
    itemsPerPageOptions: {
      control: { type: 'object' },
      defaultValue: [10],
    },
    onSelect: {
      description: 'Callback function invoked with page navigation action',
      action: 'callback',
    },
    pageStats: {
      type: 'element',
      description:
        'Component or content displayed to show current page statistics',
    },
    className: {
      type: 'string',
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
