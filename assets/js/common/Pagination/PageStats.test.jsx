import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PageStats } from '.';

describe('Page stats', () => {
  it('should not render when there are no items', () => {
    render(<PageStats itemsTotal={0} />);

    expect(
      screen.queryByText('Showing', { exact: false })
    ).not.toBeInTheDocument();
  });

  it('should render', () => {
    render(
      <PageStats
        selectedPage={1}
        itemsPresent={10}
        itemsTotal={13}
        currentItemsPerPage={10}
      />
    );

    expect(screen.getByText('Showing 1–10 of 13')).toBeInTheDocument();

    render(
      <PageStats
        selectedPage={2}
        itemsPresent={3}
        itemsTotal={13}
        currentItemsPerPage={10}
      />
    );

    expect(screen.getByText('Showing 11–13 of 13')).toBeInTheDocument();
  });
});
