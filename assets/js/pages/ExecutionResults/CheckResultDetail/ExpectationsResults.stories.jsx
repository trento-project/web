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
  argTypes: {
    isTargetHost: {
      description: 'Indicates if the target is a host',
      control: { type: 'boolean' },
    },
    results: {
      description: 'List of expectation results',
      control: { type: 'object' },
    },
    isError: {
      description: 'Indicates if there was an error during evaluation',
      control: { type: 'boolean' },
    },
    errorMessage: {
      description: 'Error message to display if an error occurred',
      control: { type: 'text' },
    },
    severity: {
      description: 'Severity level of the expectation result',
      control: { type: 'text' },
    },
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
    ...Default.args,
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
