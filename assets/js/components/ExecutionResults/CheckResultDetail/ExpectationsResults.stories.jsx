import React from 'react';
import ExpectationsResults from './ExpectationsResults';

export default {
  title: 'ExpectationsResults',
  component: ExpectationsResults,
  args: {
    isTargetHost: true,
    results: [
      { name: 'First passing  Evaluationresult', return_value: true },
      { name: 'Second failing Evaluation result', return_value: false },
    ],
    isError: false,
    errorMessage: 'An error occurred',
  },
};

export function Default(args) {
  return <ExpectationsResults {...args} />;
}
