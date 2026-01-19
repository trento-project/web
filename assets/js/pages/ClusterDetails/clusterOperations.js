import { curry, some, get, has, flow } from 'lodash';

import {
  canDisableUnit,
  canEnableUnit,
  isOnlineInCluster,
} from '@lib/model/hosts';
import {
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
  PACEMAKER_DISABLE,
  PACEMAKER_ENABLE,
  CLUSTER_HOST_START,
  CLUSTER_HOST_STOP,
} from '@lib/operations';
import {
  isOperationRunning,
  getLocalOrTargetParams,
} from '@state/selectors/runningOperations';

const NODE_MAINTENANCE_STATE = 'Maintenance';

const matchesHostId = (hostID, { metadata }) => metadata?.hostID === hostID;

const matchesTarget = (hostID, { metadata }) =>
  some(metadata?.targets, ({ agent_id }) => agent_id === hostID);

const matchesHostIdOrTarget = (hostID) => (runningOperation) =>
  matchesHostId(hostID, runningOperation) ||
  matchesTarget(hostID, runningOperation);

const matchesClusterOperation = ({ metadata }) =>
  flow(
    (meta) => getLocalOrTargetParams(meta),
    (params) => !has(params, 'resource_id') && !has(params, 'node_id')
  )(metadata);

const matchesNodeOperation =
  (nodeID) =>
  ({ metadata }) =>
    flow(
      (meta) => getLocalOrTargetParams(meta),
      (params) => get(params, 'node_id') === nodeID
    )(metadata);

const matchesResourceOperation =
  (resourceID) =>
  ({ metadata }) =>
    flow(
      (meta) => getLocalOrTargetParams(meta),
      (params) => get(params, 'resource_id') === resourceID
    )(metadata);

export const getClusterOperations = (
  clusterID,
  runningOperation,
  setOperationParams,
  setOperationModelOpen,
  details,
  someHostOnline
) => [
  {
    value: 'Cluster Maintenance',
    running: isOperationRunning(
      [runningOperation],
      clusterID,
      CLUSTER_MAINTENANCE_CHANGE,
      matchesClusterOperation
    ),
    disabled: !!runningOperation || !someHostOnline,
    permitted: ['maintenance_change:cluster'],
    onClick: () => {
      setOperationParams({
        maintenance: !details.maintenance_mode,
      });
      setOperationModelOpen({
        open: true,
        operation: CLUSTER_MAINTENANCE_CHANGE,
      });
    },
  },
  {
    value: 'Refresh resources',
    running: isOperationRunning(
      [runningOperation],
      clusterID,
      CLUSTER_RESOURCE_REFRESH,
      matchesClusterOperation
    ),
    disabled: !!runningOperation || !someHostOnline,
    permitted: ['resource_refresh:cluster'],
    onClick: () => {
      setOperationParams({});
      setOperationModelOpen({
        open: true,
        operation: CLUSTER_RESOURCE_REFRESH,
      });
    },
  },
];

export const getClusterHostOperations = curry(
  (
    clusterID,
    runningOperation,
    setCurrentOperationHost,
    setOperationParams,
    setOperationModelOpen,
    host
  ) => [
    {
      value: 'Node maintenance',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        CLUSTER_MAINTENANCE_CHANGE,
        matchesNodeOperation(host.name)
      ),
      disabled: !!runningOperation || !isOnlineInCluster(host),
      permitted: ['maintenance_change:cluster'],
      onClick: () => {
        setOperationParams({
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
    {
      value: 'Start cluster in node',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        CLUSTER_HOST_START,
        matchesHostIdOrTarget(host.id)
      ),
      disabled: !!runningOperation || isOnlineInCluster(host),
      permitted: ['cluster_host_start:cluster'],
      onClick: () => {
        setCurrentOperationHost(host);
        setOperationModelOpen({
          open: true,
          operation: CLUSTER_HOST_START,
        });
      },
    },
    {
      value: 'Stop cluster in node',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        CLUSTER_HOST_STOP,
        matchesHostIdOrTarget(host.id)
      ),
      disabled: !!runningOperation || !isOnlineInCluster(host),
      permitted: ['cluster_host_stop:cluster'],
      onClick: () => {
        setCurrentOperationHost(host);
        setOperationModelOpen({
          open: true,
          operation: CLUSTER_HOST_STOP,
        });
      },
    },
  ]
);

export const getResourceOperations = curry(
  (
    clusterID,
    runningOperation,
    setOperationParams,
    setOperationModelOpen,
    someHostOnline,
    resource
  ) => [
    {
      value: 'Resource maintenance',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        CLUSTER_MAINTENANCE_CHANGE,
        matchesResourceOperation(resource.id)
      ),
      disabled: !!runningOperation || !someHostOnline,
      permitted: ['maintenance_change:cluster'],
      onClick: () => {
        setOperationParams({
          maintenance: resource.managed,
          resource_id: resource.id,
        });
        setOperationModelOpen({
          open: true,
          operation: CLUSTER_MAINTENANCE_CHANGE,
        });
      },
    },
    {
      value: 'Refresh resource',
      running: isOperationRunning(
        [runningOperation],
        clusterID,
        CLUSTER_RESOURCE_REFRESH,
        matchesResourceOperation(resource.id)
      ),
      disabled: !!runningOperation || !someHostOnline,
      permitted: ['resource_refresh:cluster'],
      onClick: () => {
        setOperationParams({
          resource_id: resource.id,
        });
        setOperationModelOpen({
          open: true,
          operation: CLUSTER_RESOURCE_REFRESH,
        });
      },
    },
  ]
);
