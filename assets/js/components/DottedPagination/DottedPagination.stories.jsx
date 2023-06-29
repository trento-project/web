import React, { useState } from 'react';
import DottedPagination from '.';

export default {
  title: 'DottedPagination',
  component: DottedPagination,
  argTypes: {
    pages: {
      type: 'array',
      description: 'List of items that are paginated',
    },
    initialSelectedIndex: {
      type: 'number',
      description: 'Initial index for the pagination',
      control: {
        type: 'number',
      },
    },
    onChange: {
      type: '',
      description: 'Function executed when a new page is selected',
    },
  },
};

const PAGES = ['page 1', 'page 2', 'page 3'];

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
    pages: PAGES,
    initialSelectedIndex: 0,
    onChange: () => {},
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
