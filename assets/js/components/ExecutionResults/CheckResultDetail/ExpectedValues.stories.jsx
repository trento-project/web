import React from 'react';
import ExpectedValues from './ExpectedValues';

export default {
  title: 'ExpectedValues',
  component: ExpectedValues,
  args: {
    isTargetHost: true,
    expectedValues: [
      { name: 'First passing  Evaluationresult', value: 10 },
      { name: 'Second failing Evaluation result', value: 20 },
    ],
    isError: false,
  },
};

export function Default(args) {
  return <ExpectedValues {...args} />;
}
