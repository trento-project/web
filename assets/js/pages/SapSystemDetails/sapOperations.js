import { curry, every } from 'lodash';

import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  SAP_SYSTEM_START,
  SAP_SYSTEM_STOP,
} from '@lib/operations';

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

export const getSapSystemOperations = (
  sapSystem,
  runningOperations,
  setOperationModelOpen
) => [
  {
    value: 'Start system',
    running: isOperationRunning(
      runningOperations,
      sapSystem.id,
      SAP_SYSTEM_START
    ),
    disabled: sapSystem.health === 'passing',
    permitted: ['start:sap_system'],
    onClick: () => {
      setOperationModelOpen({ open: true, operation: SAP_SYSTEM_START });
    },
  },
  {
    value: 'Stop system',
    running: isOperationRunning(
      runningOperations,
      sapSystem.id,
      SAP_SYSTEM_STOP
    ),
    disabled: every(sapSystem.application_instances, { health: 'unknown' }),
    permitted: ['stop:sap_system'],
    onClick: () => {
      setOperationModelOpen({ open: true, operation: SAP_SYSTEM_STOP });
    },
  },
];
