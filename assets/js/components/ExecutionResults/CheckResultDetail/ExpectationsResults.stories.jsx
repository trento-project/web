import React from 'react';
import { faker } from '@faker-js/faker';
import ExpectationsResults from './ExpectationsResults';

export default {
  title: 'ExpectationsResults',
  component: ExpectationsResults,
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

export function Default(args) {
  return <ExpectationsResults {...args} />;
}
