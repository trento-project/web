import React, { useState } from 'react';
import { capitalize, get, noop } from 'lodash';
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

function SimpleAcceptanceOperationModal({
  operation,
  descriptionResolverArgs = {},
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
}) {
  const [checked, setChecked] = useState(false);
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
      applyDisabled={!checked}
      checked={checked}
      isOpen={isOpen}
      onChecked={() => setChecked((prev) => !prev)}
      onRequest={() => {
        onRequest({});
        setChecked(false);
      }}
      onCancel={() => {
        onCancel();
        setChecked(false);
      }}
    />
  );
}

export default SimpleAcceptanceOperationModal;
