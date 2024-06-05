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
    const [sortingByCol, setSortingByCol] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const toggleSortDirection = () => {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    };

    const sortingFunc = (sortingCol, direction) => {
      if (!sortingCol) {
        return null;
      }

      return (a, b) => {
        const keyA = a[sortingCol].toUpperCase();
        const keyB = b[sortingCol].toUpperCase();

        if (keyA < keyB) {
          return direction === 'asc' ? -1 : 1;
        }

        if (keyA > keyB) {
          return direction === 'asc' ? 1 : -1;
        }

        return 0;
      };
    };

    const createOnClickHandler = (key) => () => {
      if (sortingByCol === key) {
        toggleSortDirection();
      } else {
        setSortDirection('asc');
      }
      setSortingByCol(key);
    };

    const handleUserColClick = createOnClickHandler('user');
    const handleCreatedAtColClick = createOnClickHandler('created_at');
    const handleRoleColClick = createOnClickHandler('role');

    const sortedConfig = {
      columns: [
        {
          title: 'User',
          key: 'user',
          sortable: true,
          sortDirection: sortingByCol === 'user' ? sortDirection : null,
          handleClick: handleUserColClick,
        },
        {
          title: 'Created At',
          key: 'created_at',
          sortable: true,
          sortDirection: sortingByCol === 'created_at' ? sortDirection : null,
          handleClick: handleCreatedAtColClick,
        },
        {
          title: 'Role',
          key: 'role',
          sortable: true,
          sortDirection: sortingByCol === 'role' ? sortDirection : null,
          handleClick: handleRoleColClick,
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

    return (
      <Table
        config={sortedConfig}
        sortBy={sortingFunc(sortingByCol, sortDirection)}
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
