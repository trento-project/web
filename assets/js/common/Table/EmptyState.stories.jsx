// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import EmptyState from './EmptyState';

export default {
  title: 'Components/EmptyState',
  component: EmptyState,
  argTypes: {
    colSpan: {
      description: 'The colSpan prop',
      control: { type: 'number' },
    },
    emptyStateText: {
      description: 'The emptyStateText prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    colSpan: 5,
    emptyStateText: 'No data available',
  },
};
