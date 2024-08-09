import React, { useState } from 'react';
import { faker } from '@faker-js/faker';

import { format } from 'date-fns';
import { Factory } from 'fishery';

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

const dataFactory = Factory.define(() => ({
  user: faker.internet.userName(),
  role: faker.helpers.arrayElement([
    'Administrator',
    'Employee',
    'Head of Keks',
  ]),
  status: faker.helpers.arrayElement(['active', 'inactive']),
  created_at: format(faker.date.past(), 'yyyy-MM-dd'),
}));

const paginatableData = dataFactory.buildList(55);

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
        sortBy={createStringSortingPredicate(sortingColumn, sortDirection)}
        data={data}
      />
    );
  },
};

export const Populated = {
  args: {
    config,
    data,
  },
};

export const WithPageBasedPagination = {
  args: {
    config: { ...config, pagination: true },
    data: paginatableData,
  },
};

export const WithCursorPagination = {
  args: {
    ...WithPageBasedPagination.args,
    config: {
      ...config,
      pagination: true,
      cursorPagination: true,
    },
  },
};

export const WithFilters = {
  args: {
    ...Populated.args,
    config: filteredConfig,
  },
};

export const WithFiltersAndPageBasedPagination = {
  args: {
    data: paginatableData,
    config: {
      ...filteredConfig,
      pagination: true,
    },
  },
};

export const WithFiltersAndCursorBasedPagination = {
  args: {
    data: paginatableData,
    config: {
      ...filteredConfig,
      pagination: true,
      cursorPagination: true,
    },
  },
};

export const WithHeader = {
  args: {
    ...Populated.args,
    header: <h3 className="bg-white px-4 py-4">Header</h3>,
  },
};

export const Empty = {
  args: {
    config,
    data: [],
  },
};
