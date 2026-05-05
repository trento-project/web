// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { executionValueFactory } from '@lib/test-utils/factories';

import ExpectedValues from './ExpectedValues';

export default {
  title: 'Patterns/ExpectedValues',
  component: ExpectedValues,
  argTypes: {
    isTargetHost: {
      description: 'Indicates if the expected values are for the target host',
      control: { type: 'boolean' },
    },
    expectedValues: {
      description: 'List of expected values to display',
      control: { type: 'object' },
    },
    isError: {
      description:
        'Indicates if there was an error fetching the expected values',
      control: { type: 'boolean' },
    },
  },
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
