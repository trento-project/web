import React from 'react';
import { action } from '@storybook/addon-actions';

import { PaginationPrevNext } from '.';

export default {
  title: 'Components/PaginationPrevNext',
  component: PaginationPrevNext,
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
    <PaginationPrevNext
      hasPrev={args.hasPrev}
      hasNext={args.hasNext}
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
    currentItemsPerPage: 10,
    itemsPerPageOptions: [10, 20, 50],
  },
};
