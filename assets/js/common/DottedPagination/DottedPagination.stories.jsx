// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { action } from 'storybook/actions';

import DottedPagination from './DottedPagination';

export default {
  title: 'Components/DottedPagination',
  component: DottedPagination,
  argTypes: {
    pages: {
      description: 'List of items that are paginated',
      control: { type: 'object' },
    },
    initialSelectedIndex: {
      description: 'Initial index for the pagination',
      control: { type: 'number' },
    },
    onChange: {
      description: 'Function executed when a new page is selected',
      action: 'onChange',
    },
  },
};

const PAGES = ['page 1', 'page 2', 'page 3'];

export const Default = {
  args: {
    pages: PAGES,
    initialSelectedIndex: 0,
    onChange: action('onChange'),
  },
};

function DottedPaginationWithHooks(args) {
  const { pages, initialSelectedIndex } = args;
  const [page, setPage] = useState(pages[initialSelectedIndex]);

  return (
    <div>
      <DottedPagination {...args} onChange={setPage} />
      <span>{page}</span>
    </div>
  );
}

export const Multiple = {
  args: {
    ...Default.args,
    pages: PAGES,
    initialSelectedIndex: 0,
    onChange: action('onChange'),
  },
  render: (args) => <DottedPaginationWithHooks {...args} />,
};

export const Single = {
  args: {
    ...Multiple.args,
    pages: PAGES.slice(0, 1),
  },
  render: (args) => <DottedPaginationWithHooks {...args} />,
};
