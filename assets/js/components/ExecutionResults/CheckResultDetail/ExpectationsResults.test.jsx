import React from 'react';
import { render, screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';

import {
  executionExpectationEvaluationFactory,
  failingExpectEvaluationFactory,
  expectationResultFactory,
  failingExpectationResultFactory,
} from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import ExpectationsResults from './ExpectationsResults';

describe('ExpectationsResults Component', () => {
  it('should render expect statements results', () => {
    const failureMessage = faker.lorem.sentence();
    const results = [
      ...executionExpectationEvaluationFactory.buildList(3, {
        return_value: true,
      }),
      ...failingExpectEvaluationFactory.buildList(2, {
        failure_message: failureMessage,
      }),
    ];

    const [{ name: expectationName1 }, _, { name: expectationName3 }] = results;

    render(<ExpectationsResults results={results} />);

    expect(screen.getAllByText('Passing')).toHaveLength(3);
    expect(screen.getAllByText('Failing')).toHaveLength(2);
    expect(screen.getAllByText(failureMessage)).toHaveLength(2);
    expect(screen.getByText(expectationName1)).toBeVisible();
    expect(screen.getByText(expectationName3)).toBeVisible();
  });

  it('should render expect_same statements results', () => {
    const failureMessage = faker.lorem.sentence();
    const results = [
      ...failingExpectationResultFactory.buildList(7, {
        type: 'expect_same',
        failure_message: failureMessage,
      }),
      ...expectationResultFactory.buildList(2, {
        result: true,
        type: 'expect_same',
      }),
    ];

    const [
      { name: expectationName1 },
      { name: expectationName2 },
      { name: expectationName3 },
    ] = results;

    render(<ExpectationsResults isTargetHost={false} results={results} />);

    expect(screen.getAllByText('Passing')).toHaveLength(2);
    expect(screen.getAllByText('Failing')).toHaveLength(7);
    expect(screen.getAllByText(failureMessage)).toHaveLength(7);
    expect(screen.getByText(expectationName1)).toBeVisible();
    expect(screen.getByText(expectationName2)).toBeVisible();
    expect(screen.getByText(expectationName3)).toBeVisible();
  });

  it('should render an error', () => {
    const errorMessage = faker.lorem.sentence();
    render(
      <ExpectationsResults results={[]} isError errorMessage={errorMessage} />
    );

    expect(screen.getByText(errorMessage)).toBeVisible();
  });
});
