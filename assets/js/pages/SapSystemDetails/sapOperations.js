import { curry } from 'lodash';

import { SAP_INSTANCE_START, SAP_INSTANCE_STOP } from '@lib/operations';

export const getSapInstanceOperations = curry(
  (
    _runningOperations,
    setOperationModelOpen,
    setCurrentOperationInstance,
    instance
  ) => [
    {
      value: 'Start instance',
      running: false,
      disabled: instance.health === 'passing',
      permitted: [],
      onClick: () => {
        setCurrentOperationInstance(instance);
        setOperationModelOpen({ open: true, operation: SAP_INSTANCE_START });
      },
    },
    {
      value: 'Stop instance',
      running: false,
      disabled: instance.health === 'unknown',
      permitted: [],
      onClick: () => {
        setCurrentOperationInstance(instance);
        setOperationModelOpen({ open: true, operation: SAP_INSTANCE_STOP });
      },
    },
  ]
);
