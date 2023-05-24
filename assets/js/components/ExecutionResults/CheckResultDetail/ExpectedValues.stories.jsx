import React from 'react';
import { faker } from '@faker-js/faker';

import ExpectedValues from './ExpectedValues';

export default {
  title: 'ExpectedValues',
  component: ExpectedValues,
  args: {
    isTargetHost: true,
    expectedValues: [
      { name: faker.animal.bear(), value: faker.datatype.number() },
      { name: faker.animal.bear(), value: faker.datatype.number() },
    ],
    isError: false,
  },
};

export function Default(args) {
  return <ExpectedValues {...args} />;
}
