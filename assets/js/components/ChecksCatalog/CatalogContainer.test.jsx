import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import CatalogContainer from './CatalogContainer';

describe('ChecksCatalog CatalogContainer component', () => {
  it('should render the notification box', () => {
    renderWithRouter(<CatalogContainer catalogError={'some error'} />);

    expect(screen.getByText('some error')).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the loading box', () => {
    renderWithRouter(<CatalogContainer loading={true} />);

    expect(screen.getByText('Loading checks catalog...')).toBeVisible();
  });

  it('should render an error message if the checks catalog is empty', () => {
    renderWithRouter(<CatalogContainer isCatalogEmpty={true} />);

    expect(screen.getByText('Checks catalog is empty.')).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });
});
