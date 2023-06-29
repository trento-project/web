import { faker } from '@faker-js/faker';
import {
  executionExpectationEvaluationErrorFactory,
  failingExpectEvaluationFactory,
} from '@lib/test-utils/factories';

import ExpectationsResults from './ExpectationsResults';

export default {
  title: 'ExpectationsResults',
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

export const WithEvaluationError = {
  args: {
    ...Default.args,
    results: [executionExpectationEvaluationErrorFactory.build()],
  },
};
