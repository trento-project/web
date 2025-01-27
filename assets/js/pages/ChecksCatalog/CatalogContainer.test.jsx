import React, { act } from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import CatalogContainer from './CatalogContainer';

describe('ChecksCatalog CatalogContainer component', () => {
  it('should render the notification box', () => {
    renderWithRouter(<CatalogContainer catalogError="some error" />);

    expect(screen.getByText('Connection Error')).toBeVisible();
    expect(screen.getByText('some error')).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the loading box', () => {
    renderWithRouter(<CatalogContainer loading />);

    expect(screen.getByText('Loading checks catalog...')).toBeVisible();
  });

  it('should render an error message if the checks catalog is empty and allow filter reset', async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();

    renderWithRouter(
      <CatalogContainer withResetFilters empty onClear={onClear} />
    );

    expect(screen.getByText('Checks Catalog is empty.')).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent('Reset filters');

    const button = screen.getByText('Reset filters');
    await act(async () => user.click(button));
    expect(onClear).toHaveBeenCalled();
  });

  it('should not render a reset filters button when not needed', () => {
    renderWithRouter(<CatalogContainer empty />);

    expect(screen.getByText('Checks Catalog is empty.')).toBeVisible();
    expect(screen.queryByText('Reset filters')).toBeNull();
  });
});
