import { curry } from 'lodash';

import { SAP_INSTANCE_START, SAP_INSTANCE_STOP } from '@lib/operations';

import { isOperationRunning } from '@state/selectors/runningOperations';

export const getSapInstanceOperations = curry(
  (
    runningOperations,
    setOperationModelOpen,
    setCurrentOperationInstance,
    instance
  ) => [
    {
      value: 'Start instance',
      running: isOperationRunning(
        runningOperations,
        instance.host_id,
        SAP_INSTANCE_START
      ),
      disabled: instance.health === 'passing',
      permitted: ['start:application_instance'],
      onClick: () => {
        setCurrentOperationInstance(instance);
        setOperationModelOpen({ open: true, operation: SAP_INSTANCE_START });
      },
    },
    {
      value: 'Stop instance',
      running: isOperationRunning(
        runningOperations,
        instance.host_id,
        SAP_INSTANCE_STOP
      ),
      disabled: instance.health === 'unknown',
      permitted: ['stop:application_instance'],
      onClick: () => {
        setCurrentOperationInstance(instance);
        setOperationModelOpen({ open: true, operation: SAP_INSTANCE_STOP });
      },
    },
  ]
);
