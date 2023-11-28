import React from 'react';

import { screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import ResultsContainer from './ResultsContainer';

describe('ChecksResults ResultsContainer component', () => {
  it('should render the notification box', () => {
    renderWithRouter(<ResultsContainer error />);

    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the notification box with several errors', () => {
    renderWithRouter(
      <ResultsContainer error errorContent={['error 1', 'error 2']} />
    );

    expect(screen.getByText('error 1')).toBeTruthy();
    expect(screen.getByText('error 2')).toBeTruthy();
    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the suggestion box', () => {
    renderWithRouter(
      <ResultsContainer error={false} hasAlreadyChecksResults={false} />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Select Checks now');
  });

  it('should render a hello', () => {
    renderWithRouter(
      <ResultsContainer error={false} hasAlreadyChecksResults>
        <span data-testid="hello">Hello World!</span>
      </ResultsContainer>
    );

    expect(screen.getByTestId('hello')).toHaveTextContent('Hello World!');
  });
});
