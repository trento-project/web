import React from 'react';

import Table from './';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Table',
  component: Table,
};

const config = {
  columns: [
    {
      title: 'User',
      key: 'user',
    },
    {
      title: 'Created At',
      key: 'created_at',
    },
    {
      title: 'Role',
      key: 'role',
    },
    {
      title: 'Status',
      key: 'status',
      render: (content) => {
        return (
          <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
            <span
              aria-hidden="true"
              class="absolute inset-0 bg-green-200 opacity-50 rounded-full"
            ></span>
            <span class="relative">{content}</span>
          </span>
        );
      },
    },
  ],
};

const data = [
  {
    user: 'Tony Kekw',
    role: 'Administrator',
    status: 'active',
    created_at: '2022-02-30',
  },
  {
    user: 'Chad Carbonara',
    role: 'Employee',
    status: 'active',
    created_at: '2022-02-30',
  },
  {
    user: 'Chuck Amatriciana',
    role: 'Head of Keks',
    status: 'active',
    created_at: '2022-02-31',
  },
];

export const Populated = () => <Table config={config} data={data} />;

export const Empty = () => <Table config={config} data={[]} />;
