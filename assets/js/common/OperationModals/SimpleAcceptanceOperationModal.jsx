// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { capitalize, get, isEmpty, noop } from 'lodash';
import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  PACEMAKER_DISABLE,
  PACEMAKER_ENABLE,
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
  CLUSTER_HOST_START,
  CLUSTER_HOST_STOP,
  HOST_REBOOT,
  getOperationTitle,
} from '@lib/operations';

import OperationModal from './OperationModal';

// Single operations resolvers

const getSapInstanceStartStopDescription = (
  operation,
  { instanceNumber, sid }
) =>
  `${getOperationTitle(operation)} with instance number ${instanceNumber} in ${sid}`;

const getPacemakerEnableDisableDescription = (operation, { hostName }) =>
  `${getOperationTitle(operation)} systemd unit at boot on host ${hostName}`;

const getClusterMaintenanceDescription = (
  _operation,
  { resource_id: resourceID, node_id: nodeID, maintenance }
) => {
  let scopeText = 'cluster';
  if (resourceID) {
    scopeText = `resource ${resourceID}`;
  } else if (nodeID) {
    scopeText = `node ${nodeID}`;
  }

  return (
    <>
      Change maintenance state to <b>{capitalize(maintenance)}</b> on{' '}
      {scopeText}
    </>
  );
};

const getClusterResourceRefreshDescription = (
  _operation,
  { resource_id: resourceID }
) => {
  if (resourceID) {
    return (
      <>
        Refresh cluster resource <b>{resourceID}</b>
      </>
    );
  }

  return <>Refresh all cluster resources</>;
};

const getHostRebootDescription = (operation, { hostName }) =>
  `${getOperationTitle(operation)} ${hostName}`;

const getClusterHostStartStopDescription = (operation, { hostName }) =>
  `${getOperationTitle(operation)} ${hostName}`;

// Bulk operation resolvers

const getClusterBulkMaintenanceDescription = (_operation, { maintenance }) => (
  <>
    Change maintenance state to <b>{capitalize(String(maintenance))}</b> on the
    following clusters:
  </>
);

const getClusterBulkResourceRefreshDescription = () =>
  'Refresh all the resources on the following clusters:';

const DESCRIPTION_RESOLVERS = {
  [SAP_INSTANCE_START]: getSapInstanceStartStopDescription,
  [SAP_INSTANCE_STOP]: getSapInstanceStartStopDescription,
  [PACEMAKER_ENABLE]: getPacemakerEnableDisableDescription,
  [PACEMAKER_DISABLE]: getPacemakerEnableDisableDescription,
  [CLUSTER_MAINTENANCE_CHANGE]: getClusterMaintenanceDescription,
  [CLUSTER_RESOURCE_REFRESH]: getClusterResourceRefreshDescription,
  [CLUSTER_HOST_START]: getClusterHostStartStopDescription,
  [CLUSTER_HOST_STOP]: getClusterHostStartStopDescription,
  [HOST_REBOOT]: getHostRebootDescription,
};

const BULK_DESCRIPTION_RESOLVERS = {
  [CLUSTER_MAINTENANCE_CHANGE]: getClusterBulkMaintenanceDescription,
  [CLUSTER_RESOURCE_REFRESH]: getClusterBulkResourceRefreshDescription,
};

function SimpleAcceptanceOperationModal({
  operation,
  descriptionResolverArgs = {},
  resources = [],
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const operationTitle = getOperationTitle(operation);

  const resolvers = isEmpty(resources)
    ? DESCRIPTION_RESOLVERS
    : BULK_DESCRIPTION_RESOLVERS;

  const descriptionResolver = get(
    resolvers,
    operation,
    () => 'No description available'
  );

  return (
    <OperationModal
      title={operationTitle}
      description={descriptionResolver(operation, descriptionResolverArgs)}
      operationText={operationTitle}
      resources={resources}
      isOpen={isOpen}
      onRequest={() => onRequest({})}
      onCancel={onCancel}
    />
  );
}

export default SimpleAcceptanceOperationModal;
