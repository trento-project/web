import React from 'react';

import { screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import HintingProvider from './HintingProvider';

describe('ChecksResults HintingProvider component', () => {
  it('should render the notification box', () => {
    renderWithRouter(<HintingProvider catalogError />);

    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the suggestion box', () => {
    renderWithRouter(
      <HintingProvider catalogError={false} hasAlreadyChecksResults={false} />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Select Checks now!');
  });

  it('should render an hello', () => {
    renderWithRouter(
      <HintingProvider catalogError={false} hasAlreadyChecksResults={true}>
        <span data-testid="hello">Hello World!</span>
      </HintingProvider>
    );

    expect(screen.getByTestId('hello')).toHaveTextContent('Hello World!');
  });
});
