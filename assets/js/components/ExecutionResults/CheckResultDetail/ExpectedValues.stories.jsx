import { faker } from '@faker-js/faker';

import ExpectedValues from './ExpectedValues';

export default {
  title: 'Patterns/ExpectedValues',
  component: ExpectedValues,
};

export const Default = {
  args: {
    isTargetHost: true,
    expectedValues: [
      { name: faker.animal.bear(), value: faker.number.int() },
      { name: faker.animal.bear(), value: faker.number.int() },
    ],
    isError: false,
  },
};
