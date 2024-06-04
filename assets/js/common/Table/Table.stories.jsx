import React, { useState } from 'react';

import Table from '.';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Table',
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
      render: (content) => (
        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
          />
          <span className="relative">{content}</span>
        </span>
      ),
    },
  ],
};

const filteredConfig = {
  columns: [
    {
      title: 'User',
      key: 'user',
      filter: true,
    },
    {
      title: 'Created At',
      key: 'created_at',
      filter: true,
    },
    {
      title: 'Role',
      key: 'role',
      filter: true,
    },
    {
      title: 'Status',
      key: 'status',
      render: (content) => (
        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
          />
          <span className="relative">{content}</span>
        </span>
      ),
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

export const Sorted = {
  args: {},
  render: () => {
    const [sortDirection, setSortDirection] = useState('asc');

    const handleClickUsers = () => {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    };

    const sortedColumnsConfig = config.columns.map((c) => {
      if (c.key !== 'status') {
        return {
          ...c,
          sortable: true,
          sortDirection: c.key === 'user' ? sortDirection : null,
          handleClick: c.key === 'user' ? handleClickUsers : null,
        };
      }

      return c;
    });

    const orderByUser = (a, b) => {
      const userA = a.user.toUpperCase();
      const userB = b.user.toUpperCase();

      if (userA < userB) {
        return sortDirection === 'asc' ? -1 : 1;
      }

      if (userA > userB) {
        return sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    };

    return (
      <Table
        config={{ ...config, columns: sortedColumnsConfig }}
        sortBy={orderByUser}
        data={data}
      />
    );
  },
};

export function Populated() {
  return <Table config={config} data={data} />;
}

export function Paginated() {
  return <Table config={{ ...config, pagination: true }} data={data} />;
}

export function WithFilters(args) {
  return <Table config={filteredConfig} data={data} {...args} />;
}

export function WithHeader(args) {
  return (
    <Table
      config={config}
      data={data}
      header={<h3 className="bg-white px-4 py-4">Header</h3>}
      {...args}
    />
  );
}

export function Empty() {
  return <Table config={config} data={[]} />;
}
