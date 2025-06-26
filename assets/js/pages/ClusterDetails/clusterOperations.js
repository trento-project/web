import { curry, some } from 'lodash';
import { PACEMAKER_DISABLE, PACEMAKER_ENABLE } from '@lib/operations';
import { isOperationRunning } from '@state/selectors/runningOperations';

const matchesHostId = (hostID, { metadata }) => metadata?.hostID === hostID;

const matchesTarget = (hostID, { metadata }) =>
  some(metadata?.targets, ({ agent_id }) => agent_id === hostID);

const matchesHostIdOrTarget = (hostID) => (runningOperation) =>
  matchesHostId(hostID, runningOperation) ||
  matchesTarget(hostID, runningOperation);

export const getClusterHostOperations = curry(
  (
    clusterID,
    runningOperation,
    setCurrentOperationHost,
    setOperationModelOpen,
    host
  ) => [
    {
      value: 'Enable pacemaker at boot',
      running: isOperationRunning(
        runningOperation,
        clusterID,
        PACEMAKER_ENABLE,
        matchesHostIdOrTarget(host.id)
      ),
      disabled: !!runningOperation,
      permitted: ['pacemaker_enable:cluster'],
      onClick: () => {
        setCurrentOperationHost(host);
        setOperationModelOpen({ open: true, operation: PACEMAKER_ENABLE });
      },
    },
    {
      value: 'Disable pacemaker at boot',
      running: isOperationRunning(
        runningOperation,
        clusterID,
        PACEMAKER_DISABLE,
        matchesHostIdOrTarget(host.id)
      ),
      disabled: !!runningOperation,
      permitted: ['pacemaker_disable:cluster'],
      onClick: () => {
        setCurrentOperationHost(host);
        setOperationModelOpen({ open: true, operation: PACEMAKER_DISABLE });
      },
    },
  ]
);
