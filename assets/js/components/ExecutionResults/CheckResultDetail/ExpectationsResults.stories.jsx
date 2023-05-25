import { faker } from '@faker-js/faker';
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
