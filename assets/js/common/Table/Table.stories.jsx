// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import classNames from 'classnames';

import Pill from '@common/Pill';

import Table from '.';

import { createStringSortingPredicate } from './sorting';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Table',
  component: Table,
};

function StatusPill({ children }) {
  return (
    <Pill
      className={classNames({
        'bg-green-100 text-green-800': children === 'active',
        'bg-gray-200 text-gray-800': children !== 'active',
      })}
    >
      {children}
    </Pill>
  );
}

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
      render: (status) => <StatusPill>{status}</StatusPill>,
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
      render: (status) => <StatusPill>{status}</StatusPill>,
    },
  ],
};

const collapsibleConfig = {
  ...config,
  collapsibleDetailRenderer: () => (
    <div className="p-4 bg-gray-100">
      <p>This is a collapsible row data</p>
    </div>
  ),
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
    status: 'inactive',
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
    const [sortingColumn, setSortingColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const toggleSortDirection = () => {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    };

    const createOnClickHandler = (key) => () => {
      if (sortingColumn === key) {
        toggleSortDirection();
      } else {
        setSortDirection('asc');
      }
      setSortingColumn(key);
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
          sortDirection: sortingColumn === 'user' ? sortDirection : null,
          handleClick: handleUserColClick,
        },
        {
          title: 'Created At',
          key: 'created_at',
          sortable: true,
          sortDirection: sortingColumn === 'created_at' ? sortDirection : null,
          handleClick: handleCreatedAtColClick,
        },
        {
          title: 'Role',
          key: 'role',
          sortable: true,
          sortDirection: sortingColumn === 'role' ? sortDirection : null,
          handleClick: handleRoleColClick,
        },
        {
          title: 'Status',
          key: 'status',
          render: (status) => <StatusPill>{status}</StatusPill>,
        },
      ],
    };

    return (
      <Table
        config={sortedConfig}
        sortBy={createStringSortingPredicate(sortingColumn, sortDirection)}
        data={data}
      />
    );
  },
};

export function Populated() {
  return <Table config={config} data={data} />;
}

export function Paginated() {
  return (
    <Table
      config={{ ...config, pagination: true }}
      data={[].concat(data, data, data, data)}
    />
  );
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

export function WithCollapsibleRow(args) {
  return <Table config={collapsibleConfig} data={data} {...args} />;
}

export function WithStyledRows() {
  const configWithRowClass = {
    ...config,
    rowClassName: ({ status }) =>
      classNames({ 'bg-gray-100': status === 'inactive' }),
  };
  return <Table config={configWithRowClass} data={data} />;
}

export function Empty() {
  return <Table config={config} data={[]} />;
}
