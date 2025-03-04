import { executionValueFactory } from '@lib/test-utils/factories';
import ExpectedValues from './ExpectedValues';

export default {
  title: 'Patterns/ExpectedValues',
  component: ExpectedValues,
};

export const Default = {
  args: {
    isTargetHost: true,
    expectedValues: [
      executionValueFactory.build({ customized: true }),
      executionValueFactory.build({ customized: false }),
    ],
    isError: false,
  },
};
