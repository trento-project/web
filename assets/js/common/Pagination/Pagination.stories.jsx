import React from 'react';
import { action } from '@storybook/addon-actions';

import Pagination from '.';

export default {
  title: 'Components/Pagination',
  component: Pagination,
  argTypes: {
    pages: {
      control: {
        type: 'number',
      },
      defaultValue: 5,
    },
    currentPage: {
      control: {
        type: 'number',
      },
      defaultValue: 1,
    },
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
      pages={args.pages}
      currentPage={args.currentPage}
      currentItemsPerPage={args.currentItemsPerPage}
      itemsPerPageOptions={args.itemsPerPageOptions}
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
    pages: 5,
    currentPage: 1,
    currentItemsPerPage: 10,
    itemsPerPageOptions: [10, 20, 50],
  },
};
