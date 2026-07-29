// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import HealthIcon from './HealthIcon';

export default {
  title: 'Components/HealthIcon',
  component: HealthIcon,
  argTypes: {
    health: {
      description: 'The health status to display',
      control: { type: 'select' },
      options: [
        'passing',
        'warning',
        'critical',
        'pending',
        'not_available',
        'unknown',
      ],
    },
    centered: {
      description: 'Whether to apply centering styles to the health icon',
      control: { type: 'boolean' },
    },
    hoverOpacity: {
      description: 'Whether to apply opacity change on hover',
      control: { type: 'boolean' },
    },
    size: {
      description: 'The icon size',
      control: { type: 'select' },
      options: ['xs', 's', 'm', 'l', 'xl'],
    },
    staleAt: {
      description: 'Timestamp when the host became stale (null if not stale)',
      control: {
        type: 'text',
      },
    },
    isLink: {
      description: 'Whether to icon is a link or not',
      control: { type: 'boolean' },
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
    health: 'unknown',
    isLink: false,
    centered: false,
    hoverOpacity: false,
    size: 'm',
  },
};

export const StaleUnknown = {
  args: {
    health: 'unknown',
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const LargeStaleUnknown = {
  args: {
    health: 'unknown',
    staleAt: '2026-06-15T10:30:00Z',
    size: 'xl',
  },
};

export const Passing = {
  args: {
    ...Default.args,
    health: 'passing',
    isLink: false,
  },
};

export const LinkPassing = {
  args: {
    health: 'passing',
    isLink: true,
  },
};

export const StalePassing = {
  args: {
    health: 'passing',
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const Warning = {
  args: {
    ...Default.args,
    health: 'warning',
    isLink: false,
  },
};

export const LinkWarning = {
  args: {
    health: 'warning',
    isLink: true,
  },
};

export const StaleWarning = {
  args: {
    health: 'warning',
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const Critical = {
  args: {
    ...Default.args,
    health: 'critical',
    isLink: false,
  },
};

export const LinkCritical = {
  args: {
    health: 'critical',
    isLink: true,
  },
};

export const StaleCritical = {
  args: {
    health: 'critical',
    staleAt: '2026-06-15T10:30:00Z',
  },
};

export const Pending = {
  args: {
    ...Default.args,
    health: 'pending',
    isLink: false,
  },
};

export const Absent = {
  args: {
    ...Default.args,
    health: 'absent',
    isLink: false,
  },
};

export const NotAvailable = {
  args: {
    ...Default.args,
    health: 'not_available',
    isLink: false,
  },
};

export const Linked = {
  args: {
    ...Default.args,
    isLink: true,
  },
};

export const ExtraLarge = {
  args: {
    ...Default.args,
    health: 'passing',
    size: 'xl',
    isLink: false,
  },
};
