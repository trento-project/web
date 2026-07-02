// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import DiskSpaceChart from './DiskSpaceChart';

export default {
  title: 'Components/DiskSpaceChart',
  component: DiskSpaceChart,
  argTypes: {
    hostId: {
      description: 'Unique identifier for the host',
      control: { type: 'text' },
    },
    updateFrequency: {
      description: 'The updateFrequency prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    hostId: 'host-123',
    updateFrequency: 30000,
  },
};
