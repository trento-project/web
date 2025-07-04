import { curry, some, get, has, flow } from 'lodash';

import { canDisableUnit, canEnableUnit } from '@lib/model/hosts';
import {
  CLUSTER_MAINTENANCE_CHANGE,
  PACEMAKER_DISABLE,
  PACEMAKER_ENABLE,
} from '@lib/operations';
import { isOperationRunning } from '@state/selectors/runningOperations';

const NODE_MAINTENANCE_STATE = 'Maintenance';

const matchesHostId = (hostID, { metadata }) => metadata?.hostID === hostID;

const matchesTarget = (hostID, { metadata }) =>
  some(metadata?.targets, ({ agent_id }) => agent_id === hostID);

const matchesHostIdOrTarget = (hostID) => (runningOperation) =>
  matchesHostId(hostID, runningOperation) ||
  matchesTarget(hostID, runningOperation);

const getLocalOrTargetParams = (metadata) =>
  has(metadata, 'targets') ? metadata.targets[0].arguments : metadata.params;

const matchesClusterMaintenance = ({ metadata }) =>
  flow(
    (meta) => getLocalOrTargetParams(meta),
    (params) => !has(params, 'resource_id') && !has(params, 'node_id')
  )(metadata);

const matchesNodeMaintenance =
  (nodeID) =>
  ({ metadata }) =>
    flow(
      (meta) => getLocalOrTargetParams(meta),
      (params) => get(params, 'node_id') === nodeID
    )(metadata);

const matchesResourceMaintenance =
  (resourceID) =>
  ({ metadata }) =>
    flow(
      (meta) => getLocalOrTargetParams(meta),
      (params) => get(params, 'resource_id') === resourceID
    )(metadata);

export const getClusterOperations = (
  clusterID,
  runningOperation,
  setMaintenanceOperationParams,
  setOperationModelOpen,
  details
) => [
  {
    value: 'Cluster Maintenance',
    running: isOperationRunning(
      [runningOperation],
      clusterID,
      CLUSTER_MAINTENANCE_CHANGE,
      matchesClusterMaintenance
    ),
    disabled: !!runningOperation,
    permitted: ['maintenance_change:cluster'],
    onClick: () => {
      setMaintenanceOperationParams({
        maintenance: !details.maintenance_mode,
      });
      setOperationModelOpen({
        open: true,
        operation: CLUSTER_MAINTENANCE_CHANGE,
      });
    },
  },
];

export const getClusterHostOperations = curry(
  (
    clusterID,
    runningOperation,
    setCurrentOperationHost,
    setMaintenanceOperationParams,
    setOperationModelOpen,
    host
  ) => [
    {
      value: 'Node maintenance',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        CLUSTER_MAINTENANCE_CHANGE,
        matchesNodeMaintenance(host.name)
      ),
      disabled: !!runningOperation,
      permitted: ['maintenance_change:cluster'],
      onClick: () => {
        setMaintenanceOperationParams({
          maintenance: host.status !== NODE_MAINTENANCE_STATE,
          node_id: host.name,
        });
        setOperationModelOpen({
          open: true,
          operation: CLUSTER_MAINTENANCE_CHANGE,
        });
      },
    },
    {
      value: 'Enable pacemaker at boot',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        PACEMAKER_ENABLE,
        matchesHostIdOrTarget(host.id)
      ),
      disabled: !!runningOperation || !canEnableUnit(host, 'pacemaker.service'),
      permitted: ['pacemaker_enable:cluster'],
      onClick: () => {
        setCurrentOperationHost(host);
        setOperationModelOpen({ open: true, operation: PACEMAKER_ENABLE });
      },
    },
    {
      value: 'Disable pacemaker at boot',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        PACEMAKER_DISABLE,
        matchesHostIdOrTarget(host.id)
      ),
      disabled:
        !!runningOperation || !canDisableUnit(host, 'pacemaker.service'),
      permitted: ['pacemaker_disable:cluster'],
      onClick: () => {
        setCurrentOperationHost(host);
        setOperationModelOpen({ open: true, operation: PACEMAKER_DISABLE });
      },
    },
  ]
);

export const getResourceOperations = curry(
  (
    clusterID,
    runningOperation,
    setMaintenanceOperationParams,
    setOperationModelOpen,
    resource
  ) => [
    {
      value: 'Resource maintenance',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        CLUSTER_MAINTENANCE_CHANGE,
        matchesResourceMaintenance(resource.id)
      ),
      disabled: !!runningOperation,
      permitted: ['maintenance_change:cluster'],
      onClick: () => {
        setMaintenanceOperationParams({
          maintenance: resource.managed,
          resource_id: resource.id,
        });
        setOperationModelOpen({
          open: true,
          operation: CLUSTER_MAINTENANCE_CHANGE,
        });
      },
    },
  ]
);
