// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import FactValue from './FactValue';

export default {
  title: 'Components/FactValue',
  component: FactValue,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    data: {
      description: 'Array of items for the data',
      control: { type: 'object' },
    },
  },
};

export const Default = {
  args: {
    className: '',
    data: [
      { key: 'hostname', value: 'host-01' },
      { key: 'status', value: 'passing' },
      { key: 'check_id', value: 'check_001' },
    ],
  },
};

export const Empty = {
  args: {
    ...Default.args,
    className: '',
    data: [],
  },
};

export const SingleFact = {
  args: {
    ...Default.args,
    className: '',
    data: [{ key: 'single_fact', value: 'Single value' }],
  },
};
