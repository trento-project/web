import React from 'react';
import { action } from 'storybook/actions';

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
    onChange: {
      description: "Callback function triggered when pagination state changes"
    },
    onSelect: {
      description: "Callback function invoked with page navigation action"
    },
    pageStats: {
      description: "Component or content displayed to show current page statistics"
    },
    className: {
      description: "Additional CSS classes applied to the pagination container"
    },
    onChangeItemsPerPage: {
      description: "Callback function invoked when the items per page selection is changed"
    }
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
