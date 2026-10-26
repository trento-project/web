// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { action } from 'storybook/actions';

import { bulkOperationResourceFactory } from '@lib/test-utils/factories';
import {
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
} from '@lib/operations';

import BulkOperationModal from './BulkOperationModal';

export default {
  title: 'Components/BulkOperationModal',
  component: BulkOperationModal,
  argTypes: {
    operation: {
      description: 'Operation to apply on all the resources',
      control: { type: 'radio' },
      options: [CLUSTER_MAINTENANCE_CHANGE, CLUSTER_RESOURCE_REFRESH],
    },
    descriptionResolverArgs: {
      description:
        'Arguments for the description resolver function to generate the operation description',
      control: { type: 'object' },
    },
    resources: {
      description: 'Resources affected by the operation, with id and label',
      control: { type: 'object' },
    },
    isOpen: {
      description: 'Modal is open',
      control: { type: 'boolean' },
    },
    onRequest: {
      description: 'Request the operation on all the resources',
      action: 'onRequest',
    },
    onCancel: {
      description: 'Closes the modal',
      action: 'onCancel',
    },
    children: {
      description: 'Additional content, like user inputs, shown above the list',
      control: false,
    },
  },
};

export const ResourceRefresh = {
  args: {
    operation: CLUSTER_RESOURCE_REFRESH,
    descriptionResolverArgs: {},
    resources: bulkOperationResourceFactory.buildList(5),
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};

export const MaintenanceOn = {
  args: {
    ...ResourceRefresh.args,
    operation: CLUSTER_MAINTENANCE_CHANGE,
    descriptionResolverArgs: { maintenance: true },
  },
};

export const MaintenanceOff = {
  args: {
    ...ResourceRefresh.args,
    operation: CLUSTER_MAINTENANCE_CHANGE,
    descriptionResolverArgs: { maintenance: false },
  },
};

export const ManyResources = {
  args: {
    ...ResourceRefresh.args,
    resources: bulkOperationResourceFactory.buildList(40),
  },
};
