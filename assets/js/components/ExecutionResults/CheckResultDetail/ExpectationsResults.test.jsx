import React from 'react';
import { render, screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';

import {
  executionExpectationEvaluationFactory,
  expectationResultFactory,
} from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import ExpectationsResults from './ExpectationsResults';

describe('ExpectationsResults Component', () => {
  it('should render expect statements results', () => {
    const results = [
      ...executionExpectationEvaluationFactory.buildList(3, {
        return_value: true,
      }),
      ...executionExpectationEvaluationFactory.buildList(2, {
        return_value: false,
      }),
    ];

    const [{ name: expectationName1 }, _, { name: expectationName3 }] = results;

    render(<ExpectationsResults results={results} />);

    expect(screen.getAllByText('Passing')).toHaveLength(3);
    expect(screen.getAllByText('Failing')).toHaveLength(2);
    expect(screen.getByText(expectationName1)).toBeVisible();
    expect(screen.getByText(expectationName3)).toBeVisible();
  });

  it('should render expect_same statements results', () => {
    const results = [
      ...expectationResultFactory.buildList(3, {
        result: null,
      }),
      ...expectationResultFactory.buildList(2, {
        result: undefined,
      }),
      ...expectationResultFactory.buildList(2, {
        result: false,
      }),
      ...expectationResultFactory.buildList(2, { result: true }),
    ];

    const [
      { name: expectationName1 },
      { name: expectationName2 },
      { name: expectationName3 },
    ] = results;

    render(<ExpectationsResults isTargetHost={false} results={results} />);

    expect(screen.getAllByText('Passing')).toHaveLength(2);
    expect(screen.getAllByText('Failing')).toHaveLength(7);
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
