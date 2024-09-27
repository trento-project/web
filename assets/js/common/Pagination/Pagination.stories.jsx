import React from 'react';
import { action } from '@storybook/addon-actions';

import Pagination, { PageStats } from '.';

export default {
  title: 'Components/Pagination',
  component: Pagination,
  argTypes: {
    hasPrev: { control: { type: 'boolean' }, defaultValue: true },
    hasNext: { control: { type: 'boolean' }, defaultValue: true },
    currentItemsPerPage: {
      control: {
        type: 'number',
      },
      defaultValue: 10,
    },
    itemsPerPageOptions: {
      control: {
        type: 'array',
      },
      defaultValue: [10],
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
