import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ExecutionContainer from './ExecutionContainer';

describe('ExecutionContainer component', () => {
  const loadingChecksExecutionScenarios = [
    {
      name: 'catalog loading',
      props: {
        catalogLoading: true,
      },
    },
    {
      name: 'execution loading',
      props: {
        executionLoading: true,
      },
    },
    {
      name: 'catalog and execution loading',
      props: {
        catalogLoading: true,
        executionLoading: true,
      },
    },
  ];

  it.each(loadingChecksExecutionScenarios)(
    'should render check execution loading when "$name"',
    ({ props }) => {
      render(<ExecutionContainer {...props}>child content</ExecutionContainer>);

      expect(screen.getByText('Loading checks execution...')).toBeVisible();
    }
  );

  it('should render checks execution starting', () => {
    render(
      <ExecutionContainer executionStarted={false}>
        child content
      </ExecutionContainer>
    );

    expect(screen.getByText('Checks execution starting...')).toBeVisible();
  });

  it('should render checks execution running', () => {
    render(
      <ExecutionContainer executionRunning>child content</ExecutionContainer>
    );

    expect(screen.getByText('Checks execution running...')).toBeVisible();
  });

  it('should render the children', () => {
    render(<ExecutionContainer>child content</ExecutionContainer>);

    expect(screen.getByText('child content')).toBeVisible();
  });
});
