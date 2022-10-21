import React from 'react';

import { screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import ResultsContainer from './ResultsContainer';

describe('ChecksResults ResultsContainer component', () => {
  it('should render the notification box', () => {
    renderWithRouter(<ResultsContainer catalogError />);

    expect(screen.getByRole('button')).toHaveTextContent('Try again');
  });

  it('should render the suggestion box', () => {
    renderWithRouter(
      <ResultsContainer catalogError={false} hasAlreadyChecksResults={false} />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Select Checks now!');
  });

  it('should render a hello', () => {
    renderWithRouter(
      <ResultsContainer catalogError={false} hasAlreadyChecksResults={true}>
        <span data-testid="hello">Hello World!</span>
      </ResultsContainer>
    );

    expect(screen.getByTestId('hello')).toHaveTextContent('Hello World!');
  });
});
