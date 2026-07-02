// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import InstanceStatus from './InstanceStatus';

export default {
  title: 'Components/InstanceStatus',
  component: InstanceStatus,
  argTypes: {
    status: {
      description: 'The status color of the instance',
      control: {
        type: 'select',
      },
      options: ['green', 'yellow', 'red', 'gray'],
    },
    absent: {
      description: 'Whether the instance is absent',
      control: {
        type: 'boolean',
      },
    },
    staleAt: {
      description:
        'Timestamp when the instance became stale (null if not stale)',
      control: {
        type: 'text',
      },
    },
    timezone: {
      description: 'Timezone for displaying the stale timestamp',
      control: {
        type: 'text',
      },
    },
  },
};

export const Default = {
  args: {
    status: 'green',
    absent: false,
    timezone: 'Etc/UTC',
  },
};

export const GreenStatus = {
  args: {
    ...Default.args,
    status: 'green',
  },
};

export const YellowStatus = {
  args: {
    ...Default.args,
    status: 'yellow',
  },
};

export const RedStatus = {
  args: {
    ...Default.args,
    status: 'red',
  },
};

export const GrayStatus = {
  args: {
    ...Default.args,
    status: 'gray',
  },
};

export const AbsentInstance = {
  args: {
    ...Default.args,
    status: 'green',
    absent: true,
  },
};

export const StaleGreenStatus = {
  args: {
    ...Default.args,
    status: 'green',
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const StaleYellowStatus = {
  args: {
    ...Default.args,
    status: 'yellow',
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const StaleRedStatus = {
  args: {
    ...Default.args,
    status: 'red',
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const StaleGrayStatus = {
  args: {
    ...Default.args,
    status: 'gray',
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const StaleAbsentInstance = {
  args: {
    ...Default.args,
    status: 'green',
    absent: true,
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const WithTimezone = {
  args: {
    ...Default.args,
    status: 'green',
    staleAt: '2026-06-15T10:30:00Z',
    timezone: 'America/New_York',
  },
};
