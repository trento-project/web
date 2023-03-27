import React from 'react';
import { render, screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';

import { executionExpectationEvaluationFactory } from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import ExpectationsResults from './ExpectationsResults';

describe('ExpectationsResults Component', () => {
  it('should render expect statements results', async () => {
    const expectStatementsResults = [
      ...executionExpectationEvaluationFactory.buildList(3, {
        return_value: true,
      }),
      ...executionExpectationEvaluationFactory.buildList(2, {
        return_value: false,
      }),
    ];

    const [{ name: expectationName1 }, _, { name: expectationName3 }] =
      expectStatementsResults;

    render(
      <ExpectationsResults expectStatementsResults={expectStatementsResults} />
    );

    expect(screen.getAllByText('Passing')).toHaveLength(3);
    expect(screen.getAllByText('Failing')).toHaveLength(2);
    expect(screen.getByText(expectationName1)).toBeVisible();
    expect(screen.getByText(expectationName3)).toBeVisible();
  });

  it('should render an error', async () => {
    const anErrorMessage = faker.lorem.sentence();
    render(
      <ExpectationsResults
        expectStatementsResults={[]}
        isCheckError
        errorMessage={anErrorMessage}
      />
    );

    expect(screen.getByText(anErrorMessage)).toBeVisible();
  });
});
