// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import OperationForbiddenModal from './OperationForbiddenModal';

export default {
  title: 'Components/OperationForbiddenModal',
  component: OperationForbiddenModal,
  argTypes: {
    operation: {
      description: 'Operation name',
      control: { type: 'text' },
    },
    errors: {
      description: 'Authorization errors as string',
      control: { type: 'object' },
    },
    isOpen: {
      description: 'Modal is open',
      control: { type: 'boolean' },
    },
    onCancel: {
      description: 'Closes the modal',
      action: 'onCancel',
    },
  },
  args: {
    isOpen: true,
    onCancel: action('onCancel'),
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const SingleOperation = {
  args: {
    operation: 'My operation',
    errors: [
      { detail: 'Authorization error 1', metadata: [] },
      {
        detail: 'Authorization error 2: {0}',
        metadata: [{ id: 1, label: 'Resource', type: 'cluster' }],
      },
    ],
  },
};

export const BulkOperation = {
  args: {
    operation: 'My bulk operation',
    errors: [
      {
        detail: 'Authorization error 1: {0}',
        metadata: [
          {
            id: 'resource-1',
            label: 'Resource',
            type: 'cluster',
          },
          {
            id: 'resource-1',
            label: 'Resource 1',
            type: 'cluster',
            bulk_operation: true,
          },
        ],
      },
      {
        detail: 'Authorization error 2',
        metadata: [
          {
            id: 'resource-1',
            label: 'Resource 1',
            type: 'cluster',
            bulk_operation: true,
          },
        ],
      },
      {
        detail: 'Authorization error 1',
        metadata: [
          {
            id: 'resource-2',
            label: 'Resource 2',
            type: 'cluster',
            bulk_operation: true,
          },
        ],
      },
    ],
    isOpen: true,
    onCancel: action('onCancel'),
  },
};
