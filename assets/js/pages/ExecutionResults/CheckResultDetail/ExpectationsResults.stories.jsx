import { faker } from '@faker-js/faker';
import {
  executionExpectationEvaluationErrorFactory,
  failingExpectEvaluationFactory,
} from '@lib/test-utils/factories';

import { WARNING } from '@lib/model';

import ExpectationsResults from './ExpectationsResults';

export default {
  title: 'Patterns/ExpectationsResults',
  component: ExpectationsResults,
};

export const Default = {
  args: {
    isTargetHost: true,
    results: [
      { name: faker.animal.bear(), return_value: true },
      { name: faker.animal.bear(), return_value: false },
    ],
    isError: false,
    errorMessage: 'An error occurred',
  },
};

export const WithFailureMessage = {
  args: {
    ...Default.args,
    results: [failingExpectEvaluationFactory.build()],
  },
};

export const WithWarning = {
  args: {
    ...WithFailureMessage.args,
    severity: WARNING,
  },
};

export const WithEvaluationError = {
  args: {
    ...Default.args,
    results: [executionExpectationEvaluationErrorFactory.build()],
  },
};
