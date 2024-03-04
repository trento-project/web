import React from 'react';
import { render, screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';

import { PASSING, WARNING, CRITICAL } from '@lib/model';

import {
  executionExpectationEvaluationFactory,
  executionExpectationEvaluationErrorFactory,
  failingExpectEvaluationFactory,
  expectationResultFactory,
  failingExpectationResultFactory,
} from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import ExpectationsResults from './ExpectationsResults';

describe('ExpectationsResults Component', () => {
  it('should render host expectation statements results', () => {
    const failureMessage = faker.lorem.sentence();
    const warningMessage = faker.lorem.sentence();
    const evaluationErrorMessage = faker.lorem.sentence();
    const results = [].concat(
      executionExpectationEvaluationFactory.buildList(3, {
        return_value: true,
      }),
      executionExpectationEvaluationFactory.build({
        return_value: PASSING,
      }),
      executionExpectationEvaluationFactory.build({
        return_value: WARNING,
        failure_message: warningMessage,
      }),
      executionExpectationEvaluationFactory.build({
        return_value: CRITICAL,
      }),
      failingExpectEvaluationFactory.buildList(2, {
        failure_message: failureMessage,
      }),
      executionExpectationEvaluationErrorFactory.build({
        name: 'erroring_evaluation',
        message: evaluationErrorMessage,
      })
    );

    const [{ name: expectationName1 }, _, { name: expectationName3 }] = results;

    render(<ExpectationsResults results={results} severity={CRITICAL} />);

    expect(screen.getAllByText('Passing')).toHaveLength(4);
    expect(screen.getAllByText('Warning')).toHaveLength(1);
    expect(screen.getAllByText('Critical')).toHaveLength(4);
    expect(screen.getAllByText(failureMessage)).toHaveLength(2);
    expect(screen.getAllByText(warningMessage)).toHaveLength(1);
    expect(screen.getAllByText(evaluationErrorMessage)).toHaveLength(1);
    expect(screen.getByText(expectationName1)).toBeVisible();
    expect(screen.getByText(expectationName3)).toBeVisible();
  });

  it('should render host expectation statements with provided seveirty', () => {
    const failureMessage = faker.lorem.sentence();

    const results = executionExpectationEvaluationFactory.buildList(1, {
      return_value: false,
      failure_message: failureMessage,
    });

    const [{ name: expectationName }] = results;

    render(<ExpectationsResults results={results} severity={WARNING} />);

    expect(screen.getAllByText('Warning')).toHaveLength(1);
    expect(screen.getAllByText(failureMessage)).toHaveLength(1);
    expect(screen.getByText(expectationName)).toBeVisible();
  });

  it('should render expect_same statements results', () => {
    const failureMessage = faker.lorem.sentence();
    const evaluationErrorMessage = faker.lorem.sentence();

    const results = [].concat(
      failingExpectationResultFactory.buildList(7, {
        type: 'expect_same',
        failure_message: failureMessage,
      }),
      expectationResultFactory.buildList(2, {
        result: true,
        type: 'expect_same',
      }),
      executionExpectationEvaluationErrorFactory.build({
        name: 'erroring_evaluation',
        type: 'expect_same',
        message: evaluationErrorMessage,
      })
    );

    const [
      { name: expectationName1 },
      { name: expectationName2 },
      { name: expectationName3 },
    ] = results;

    render(
      <ExpectationsResults
        isTargetHost={false}
        results={results}
        severity={CRITICAL}
      />
    );

    expect(screen.getAllByText('Passing')).toHaveLength(2);
    expect(screen.getAllByText('Critical')).toHaveLength(8);
    expect(screen.getAllByText(failureMessage)).toHaveLength(7);
    expect(screen.getAllByText(evaluationErrorMessage)).toHaveLength(1);
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
