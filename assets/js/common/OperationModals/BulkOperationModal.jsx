// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { capitalize, get, noop } from 'lodash';
import {
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
  getOperationTitle,
} from '@lib/operations';

import OperationModal from './OperationModal';

const getClusterMaintenanceDescription = (_operation, { maintenance }) => (
  <>
    Change maintenance state to <b>{capitalize(String(maintenance))}</b> on the
    following clusters:
  </>
);

const getClusterResourceRefreshDescription = () =>
  'Refresh all the resources on the following clusters:';

const DESCRIPTION_RESOLVERS = {
  [CLUSTER_MAINTENANCE_CHANGE]: getClusterMaintenanceDescription,
  [CLUSTER_RESOURCE_REFRESH]: getClusterResourceRefreshDescription,
};

function BulkOperationModal({
  operation,
  descriptionResolverArgs = {},
  resources = [],
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
  children,
}) {
  const operationTitle = getOperationTitle(operation);

  const descriptionResolver = get(
    DESCRIPTION_RESOLVERS,
    operation,
    () => 'No description available'
  );

  return (
    <OperationModal
      title={operationTitle}
      description={descriptionResolver(operation, descriptionResolverArgs)}
      operationText={operationTitle}
      isOpen={isOpen}
      onRequest={onRequest}
      onCancel={onCancel}
    >
      {children}
      <ul className="list-disc list-inside text-sm max-h-60 overflow-y-auto">
        {resources.map(({ id, label }) => (
          <li key={id}>{label}</li>
        ))}
      </ul>
    </OperationModal>
  );
}

export default BulkOperationModal;
