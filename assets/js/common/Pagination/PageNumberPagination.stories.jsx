import React from 'react';
import { action } from '@storybook/addon-actions';

import { PageNumberPagination } from '.';

export default {
  title: 'Components/PageNumberPagination',
  component: PageNumberPagination,
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
    itemsTotal: {
      control: {
        type: 'number',
      },
    },
  },
  render: (args) => (
    <PageNumberPagination
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
    pages: 5,
    currentPage: 1,
    currentItemsPerPage: 10,
    itemsPerPageOptions: [10, 20, 50],
  },
};

export const WithManyPages = {
  args: {
    ...Default.args,
    pages: 99,
    currentPage: 20,
  },
};

export const EmptyDataset = {
  args: {
    itemsTotal: 0,
  },
};
