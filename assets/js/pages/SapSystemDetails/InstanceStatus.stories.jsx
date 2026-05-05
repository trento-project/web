// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import InstanceStatus from './InstanceStatus';

export default {
  title: 'Components/InstanceStatus',
  component: InstanceStatus,
  argTypes: {
    health: {
      description: 'The health prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    health: '',
  },
};
