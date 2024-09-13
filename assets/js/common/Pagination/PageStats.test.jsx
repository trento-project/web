import React from 'react';

import { noop } from 'lodash';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Pagination from '.';

describe('Page stats', () => {
  it('should render', () => {
    render(
      <Pagination
        pages={2}
        currentPage={1}
        currentItemsPerPage={10}
        itemsPerPageOptions={[10, 20, 50]}
        onSelect={noop}
        onChangeItemsPerPage={noop}
        itemsPresent={10}
        itemsTotal={13}
      />
    );

    expect(screen.getByText('Showing 1–10 of 13')).toBeInTheDocument();

    render(
      <Pagination
        pages={2}
        currentPage={2}
        currentItemsPerPage={10}
        itemsPerPageOptions={[10, 20, 50]}
        onSelect={noop}
        onChangeItemsPerPage={noop}
        itemsPresent={3}
        itemsTotal={13}
      />
    );

    expect(screen.getByText('Showing 11–13 of 13')).toBeInTheDocument();
  });
});
