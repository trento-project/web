import React from 'react';

import { screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import Content from './Content';

describe('ChecksResults Content component', () => {
  it('should render the notification box', () => {
    renderWithRouter(<Content catalogError />);

    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the notification box', () => {
    renderWithRouter(
      <Content catalogError={false} hasAlreadyChecksResults={false} />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Select Checks now!');
  });
});
